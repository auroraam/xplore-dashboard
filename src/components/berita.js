"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import PremiumPaywall from '@/components/landing';
import IntisariAI from '@/components/intisariAI';

// warna
const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#a855f7","#ec4899","#14b8a6","#f97316","#84cc16"];
const SENTIMEN_COLOR = { positif: "#10b981", netral: "#6366f1", negatif: "#ef4444" };
const EMOSI_COLOR = { Happy:"#f59e0b", Sadness:"#6366f1", Anger:"#ef4444", Fear:"#a855f7", Love:"#ec4899" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <b>{p.value?.toLocaleString()}</b></p>
      ))}
    </div>
  );
};

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

function Skeleton({ h = "h-48" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${h} w-full`} />;
}

function useESData(type, filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersKey = `${type}-${filters?.from}-${filters?.to}-${filters?.topik}-${filters?.sdg}-${filters?.sentimen}-${filters?.lucene}-${filters?._refreshTrigger}`;

  useEffect(() => {
    if (!filters?.from) return;

    const params = new URLSearchParams();
    params.append("type", type);
    params.append("from", filters.from);
    params.append("to", filters.to ?? "now");
    params.append("topik", filters.topik ?? "$__all");
    params.append("sentimen", filters.sentimen ?? "$__all");
    params.append("lucene", filters.lucene ?? "*");

    setLoading(true);
    fetch(`/api/elasticsearch?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });

  }, [filtersKey]);

  return { data, loading, error };
}

// Perbedaan Media Lokal dan Mainstream
function MediaTreemap({ filters }) {
  const { data, loading, error } = useESData("media_lokal_mainstream", filters);
  const [hovered, setHovered] = useState(null);
 
  if (loading) return <Skeleton h="h-72" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;
 
  const jenisBuckets = data?.aggregations?.jenis?.buckets ?? [];
  if (jenisBuckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;
 
  // Flatten jadi list item untuk treemap
  const items = [];
  jenisBuckets.forEach((jenis) => {
    (jenis.person?.buckets ?? []).forEach((person) => {
      items.push({
        jenis: jenis.key,
        name: person.key,
        value: person.doc_count,
        jenisTotal: jenis.doc_count,
      });
    });
  });
 
  if (items.length === 0) return <p className="text-xs text-slate-400">Tidak ada data person</p>;
 
  // ── Layout treemap sederhana: 2 kolom (lokal | mainstream) ──────────
  const W = 640, H = 300;
  const totalAll = jenisBuckets.reduce((s, b) => s + b.doc_count, 0) || 1;
 
  // Tiap jenis dapat lebar proporsional
  let xOffset = 0;
  const columns = jenisBuckets.map((jenis, ji) => {
    const colW = (jenis.doc_count / totalAll) * W;
    const persons = jenis.person?.buckets ?? [];
    const totalPerson = persons.reduce((s, p) => s + p.doc_count, 0) || 1;
 
    let yOffset = 0;
    const cells = persons.map((person, pi) => {
      const cellH = (person.doc_count / totalPerson) * H;
      const cell = {
        x: xOffset,
        y: yOffset,
        w: colW,
        h: cellH,
        name: person.key,
        value: person.doc_count,
        jenis: jenis.key,
        color: COLORS[(ji * 3 + pi) % COLORS.length],
      };
      yOffset += cellH;
      return cell;
    });
 
    xOffset += colW;
    return { jenis: jenis.key, total: jenis.doc_count, colW, cells, xStart: xOffset - colW };
  });
 
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-80">
        {/* Header kolom */}
        {columns.map((col) => (
          <text
            key={col.jenis}
            x={col.xStart + col.colW / 2}
            y={14}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill="#475569"
          >
            {col.jenis} ({col.total >= 1000 ? `${(col.total / 1000).toFixed(1)}K` : col.total})
          </text>
        ))}
 
        {/* Garis pemisah kolom */}
        {columns.length > 1 && (
          <line
            x1={columns[0].colW} y1={20}
            x2={columns[0].colW} y2={H + 20}
            stroke="#e2e8f0" strokeWidth={2}
          />
        )}
 
        {/* Cells */}
        {columns.map((col) =>
          col.cells.map((cell, i) => (
            <g key={`${col.jenis}-${i}`}
              onMouseEnter={() => setHovered(cell)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect
                x={cell.x + 1}
                y={cell.y + 20}
                width={cell.w - 2}
                height={cell.h - 2}
                fill={cell.color}
                fillOpacity={hovered?.name === cell.name ? 0.9 : 0.65}
                rx={3}
              />
              {/* Label nama — tampilkan kalau cell cukup besar */}
              {cell.h > 20 && (
                <text
                  x={cell.x + cell.w / 2}
                  y={cell.y + 20 + cell.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={cell.h > 35 ? 10 : 8}
                  fill="white"
                  fontWeight={500}
                  className="select-none"
                >
                  {cell.name.length > 16 ? cell.name.slice(0, 15) + "…" : cell.name}
                </text>
              )}
            </g>
          ))
        )}
      </svg>
 
      {/* Tooltip hover */}
      {hovered && (
        <div className="absolute top-2 right-2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold text-slate-700">{hovered.name}</p>
          <p className="text-slate-500">{hovered.jenis}</p>
          <p className="text-slate-800 font-bold mt-1">
            {hovered.value >= 1000
              ? `${(hovered.value / 1000).toFixed(1)}K`
              : hovered.value} berita
          </p>
        </div>
      )}
 
      {/* Legend */}
      <div className="flex items-center gap-4 justify-center mt-2">
        {jenisBuckets.map((j, i) => (
          <div key={j.key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: COLORS[i * 3 % COLORS.length] }}
            />
            {j.key}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie News — Banyaknya Artikel per Outlet
function PieNewsChart({ filters }) {
  const { data, loading, error } = useESData("pie_news", filters);
 
  if (loading) return <Skeleton h="h-64" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;
 
  const buckets = data?.aggregations?.pie_news?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;
 
  const total = buckets.reduce((s, b) => s + b.doc_count, 0);
 
  // Top 10 ditampilkan, sisanya digabung jadi "Lainnya"
  const TOP_N = 10;
  const top = buckets.slice(0, TOP_N);
  const others = buckets.slice(TOP_N);
  const othersTotal = others.reduce((s, b) => s + b.doc_count, 0);
 
  const chartData = [
    ...top.map((b) => ({ name: b.key, value: b.doc_count })),
    ...(othersTotal > 0 ? [{ name: "Lainnya", value: othersTotal }] : []),
  ];
 
  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            dataKey="value"
            label={({ name, percent }) =>
              percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ""
            }
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [
              `${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: 10, maxWidth: 140 }}
            formatter={(value) =>
              value.length > 18 ? value.slice(0, 17) + "…" : value
            }
          />
        </PieChart>
      </ResponsiveContainer>
 
      {/* Total */}
      <p className="text-xs text-slate-400 text-center">
        Total {total.toLocaleString()} berita dari {buckets.length} outlet
      </p>
    </div>
  );
}

export default function DashboardBerita({ filters, userRole, onSimulateLogin }) {
  console.log("Current Filters State:", filters);
  if (userRole === "Guest") {
    return (
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {/* Lempar props-nya ke sini */}
        <PremiumPaywall onSimulateLogin={onSimulateLogin} />
      </main>
    );
  }
  
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="">
        <Card>
          <IntisariAI filters={filters} section="media" />
        </Card>
      </div>

      <Card title="Perbedaan Media Lokal dan Mainstream">
        <MediaTreemap filters={filters} />
      </Card>

      <Card title="Pie News — Banyaknya Artikel per Outlet">
        <PieNewsChart filters={filters} />
      </Card>

    </main>
  );
}