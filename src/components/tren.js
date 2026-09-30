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

// Top 5 Topik Berita, Nama, Organisasi
function HBarChart({ type, aggKey, color = "#6366f1", filters }) {
  const { data, loading, error } = useESData(type, filters);
  if (loading) return <Skeleton h="h-48" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.[aggKey]?.buckets ?? [];
  const chartData = buckets.map((b) => ({ name: b.key, jumlah: b.doc_count }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="jumlah" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Kata Kunci atau Isu dalam Berita
function WordCloud({ filters }) {
  const { data, loading, error } = useESData("wordcloud", filters);

  if (loading) return <Skeleton h="h-64" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.wordcloud?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const maxCount = buckets[0]?.doc_count ?? 1;
  const minCount = buckets[buckets.length - 1]?.doc_count ?? 1;

  const fontSize = (count) => {
    if (maxCount === minCount) return 16;
    const t = (count - minCount) / (maxCount - minCount);
    return 11 + t * 26; 
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 p-4 min-h-[220px]">
      {buckets.map((b, i) => (
        <span
          key={i}
          style={{
            fontSize: `${fontSize(b.doc_count)}px`,
            color: COLORS[i % COLORS.length],
            fontWeight: b.doc_count > maxCount * 0.5 ? 700 : 500,
            lineHeight: 1.1,
          }}
          className="cursor-default hover:opacity-70 transition-opacity"
          title={`${b.key}: ${b.doc_count} berita`}
        >
          {b.key}
        </span>
      ))}
    </div>
  );
}

// Kata Kunci dalam Berita
function TabelKunci({filters}) {
  const { data, loading, error } = useESData("tabel_kunci", filters);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  if (loading) return <Skeleton h="h-64" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_phrase?.buckets ?? [];
  const rows = buckets.map((b) => ({
    kata_kunci: b.key,
    judul: b.judul?.buckets?.[0]?.key ?? "-",
    sentiment: b.sentiment?.buckets?.[0]?.key ?? "-",
    link: b.link?.buckets?.[0]?.key ?? "#",
    jumlah: b.doc_count,
  }));

  const paged = rows.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(rows.length / PER_PAGE);

  const sentimenBadge = (s) => {
    const cls = s === "positif" ? "bg-emerald-100 text-emerald-700"
      : s === "negatif" ? "bg-red-100 text-red-700"
      : "bg-slate-100 text-slate-600";
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s}</span>;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Kata Kunci</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Judul</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Sentimen</th>
              <th className="text-right py-2 px-2 text-slate-500 font-medium">Link</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-2 px-2 font-medium text-slate-800">{row.kata_kunci}</td>
                <td className="py-2 px-2 text-slate-600 max-w-xs truncate">{row.judul}</td>
                <td className="py-2 px-2">{sentimenBadge(row.sentiment)}</td>
                <td className="py-2 px-2 text-right">
                  {row.link !== "#" && (
                    <a href={row.link} target="_blank" rel="noreferrer"
                      className="text-orange-500 hover:text-orange-700 underline">
                      buka ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">{rows.length} kata kunci</span>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-6 h-6 rounded text-xs font-medium transition-colors
                ${page === i ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Pengaruh dalam SDG (Sustainable Development Goals)
function SDGChart({ filters }) {
  const { data, loading, error } = useESData("sdg", filters);
  if (loading) return <Skeleton h="h-96" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;
 
  const buckets = data?.aggregations?.sdg?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;
 
  const chartData = buckets.map((b) => ({ name: b.key, jumlah: b.doc_count }));
  const chartHeight = Math.max(300, chartData.length * 32);
 
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 60, top: 4, bottom: 4 }}>
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={200} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="jumlah" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 9, fill: "#94a3b8" }}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
          <IntisariAI filters={filters} section="isu" />
        </Card>
      </div>

      <div className="gap-6 text-black">
        <Card title="Grafik Topik Berita">
          <HBarChart type="topik" aggKey="topik" filters={filters} />
        </Card>
      </div>

      <Card title="Kata Kunci atau Isu dalam Berita">
        <WordCloud filters={filters} />
      </Card>

      <Card title="Kata Kunci dalam Berita (7 hari terakhir)">
        <TabelKunci filters={filters} />
      </Card>

      <Card title="Pengaruh dalam SDG (Sustainable Development Goals)">
        <SDGChart filters={filters} />
      </Card>

    </main>
  );
}