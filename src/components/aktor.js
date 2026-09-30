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
    <ResponsiveContainer width="100%" height={180}>
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

// Top 5 Organisasi Berpengaruh dalam Berita
function OrganisasiBerpengaruhChart({ filters }) {
  const { data, loading, error } = useESData("organisasi_berpengaruh", filters);
  if (loading) return <Skeleton h="h-56" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.organisasi_berpengaruh?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const total = buckets.reduce((s, b) => s + b.doc_count, 0);
  const chartData = buckets.map((b) => ({ name: b.key, value: b.doc_count }));

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={85}
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v} berita (${((v / total) * 100).toFixed(1)}%)`} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {chartData.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-slate-600 truncate flex-1">{entry.name}</span>
            <span className="text-xs font-semibold text-slate-800">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top 10 Lokasi Berpengaruh dalam Berita
function LokasiChart({ filters }) {
  const { data, loading, error } = useESData("lokasi", filters);
  if (loading) return <Skeleton h="h-64" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.lokasi?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const chartData = buckets.map((b) => ({ name: b.key, jumlah: b.doc_count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
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

// Network Organisasi dan Orang
function NetworkGraph({ filters }) {
  const { data, loading, error } = useESData("network", filters);
  const [hovered, setHovered] = useState(null);

  if (loading) return <Skeleton h="h-80" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const persons = data?.aggregations?.person?.buckets ?? [];

  const nodes = [];
  const edges = [];
  const nodeMap = new Map();

  const addNode = (name, type, value) => {
    if (!nodeMap.has(name)) {
      nodeMap.set(name, { id: name, type, value });
      nodes.push(nodeMap.get(name));
    } else {
      nodeMap.get(name).value += value;
    }
  };

  persons.forEach((p) => {
    addNode(p.key, "person", p.doc_count);
    (p.orgs?.buckets ?? []).forEach((o) => {
      addNode(o.key, "org", o.doc_count);
      edges.push({ source: p.key, target: o.key, value: o.doc_count });
    });
  });

  if (nodes.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const W = 500, H = 320;
  const cx = W / 2, cy = H / 2;
  const personNodes = nodes.filter((n) => n.type === "person");
  const orgNodes = nodes.filter((n) => n.type === "org");

  const positions = new Map();
  personNodes.forEach((n, i) => {
    const angle = (i / personNodes.length) * 2 * Math.PI;
    positions.set(n.id, { x: cx + Math.cos(angle) * 90, y: cy + Math.sin(angle) * 90 });
  });
  orgNodes.forEach((n, i) => {
    const angle = (i / orgNodes.length) * 2 * Math.PI + Math.PI / orgNodes.length;
    positions.set(n.id, { x: cx + Math.cos(angle) * 200, y: cy + Math.sin(angle) * 130 });
  });

  const maxVal = Math.max(...nodes.map((n) => n.value), 1);
  const nodeRadius = (val) => 6 + (val / maxVal) * 16;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-80">
        {/* edges */}
        {edges.map((e, i) => {
          const s = positions.get(e.source);
          const t = positions.get(e.target);
          if (!s || !t) return null;
          return (
            <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
              stroke="#cbd5e1" strokeWidth={1} opacity={0.6} />
          );
        })}
        {/* nodes */}
        {nodes.map((n) => {
          const pos = positions.get(n.id);
          if (!pos) return null;
          const r = nodeRadius(n.value);
          const color = n.type === "person" ? "#6366f1" : "#f59e0b";
          return (
            <g key={n.id}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <circle cx={pos.x} cy={pos.y} r={r} fill={color} fillOpacity={0.85} />
              <text x={pos.x} y={pos.y + r + 10} textAnchor="middle"
                fontSize={9} fill="#475569" className="select-none">
                {n.id.length > 14 ? n.id.slice(0, 13) + "…" : n.id}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="absolute top-2 right-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 text-xs">
          <p className="font-semibold text-slate-700">{hovered.id}</p>
          <p className="text-slate-500">{hovered.type === "person" ? "Nama" : "Organisasi"} · {hovered.value} mention</p>
        </div>
      )}

      <div className="flex items-center gap-4 justify-center mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Nama Orang</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Organisasi</span>
      </div>
    </div>
  );
}

// Flow Nama, Organisasi, dan Lokasi
function FlowSankey({ filters }) {
  const { data, loading, error } = useESData("flow", filters);
  const [hoveredLink, setHoveredLink] = useState(null);

  if (loading) return <Skeleton h="h-80" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const persons = data?.aggregations?.person?.buckets ?? [];
  if (persons.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const personNodes = [];
  const orgNodes = [];
  const locNodes = [];
  const links1 = [];
  const links2 = [];
  const orgMap = new Map();
  const locMap = new Map();

  persons.forEach((p) => {
    personNodes.push({ id: p.key, value: p.doc_count });

    (p.org?.buckets ?? []).forEach((o) => {
      if (!o.key || o.key.trim() === "") return;
      if (!orgMap.has(o.key)) orgMap.set(o.key, 0);
      orgMap.set(o.key, orgMap.get(o.key) + o.doc_count);
      links1.push({ source: p.key, target: o.key, value: o.doc_count });

      (o.loc?.buckets ?? []).forEach((l) => {
        const locKey = l.key?.trim();
        if (!locKey || locKey === "") return;

        if (!locMap.has(locKey)) locMap.set(locKey, 0);
        locMap.set(locKey, locMap.get(locKey) + l.doc_count);
        links2.push({ source: o.key, target: locKey, value: l.doc_count });
      });
    });
  });

  orgMap.forEach((value, key) => orgNodes.push({ id: key, value }));
  locMap.forEach((value, key) => locNodes.push({ id: key, value }));

  if (orgNodes.length === 0) {
    return <p className="text-xs text-slate-400">Data tidak cukup untuk membuat flow</p>;
  }

  const W = 700, H = 380;
  const NODE_WIDTH = 14;
  const PADDING = 10;
  const COL_X = [120, W / 2 - 7, W - 200];

  const layoutColumn = (nodes, x) => {
    const totalValue = nodes.reduce((s, n) => s + n.value, 0) || 1;
    const availableH = H - 30 - PADDING * (nodes.length + 1);
    let y = 30;
    return nodes.map((n) => {
      const h = Math.max((n.value / totalValue) * availableH, 6);
      const pos = { ...n, x, y, h };
      y += h + PADDING;
      return pos;
    });
  };

  const posPersons = layoutColumn(personNodes, COL_X[0]);
  const posOrgs    = layoutColumn(orgNodes,    COL_X[1]);
  const posLocs    = layoutColumn(locNodes,    COL_X[2]);

  const findPos = (arr, id) => arr.find((n) => n.id === id);

  const buildLinkPath = (sPos, tPos, sOff, sH, tOff, tH) => {
    const x1 = sPos.x + NODE_WIDTH;
    const x2 = tPos.x;
    const y1a = sPos.y + sOff;
    const y1b = sPos.y + sOff + sH;
    const y2a = tPos.y + tOff;
    const y2b = tPos.y + tOff + tH;
    const xMid = (x1 + x2) / 2;
    return `M${x1},${y1a} C${xMid},${y1a} ${xMid},${y2a} ${x2},${y2a}
            L${x2},${y2b} C${xMid},${y2b} ${xMid},${y1b} ${x1},${y1b} Z`;
  };

  const computeLinkPaths = (links, sourceArr, targetArr) => {
    const srcUsed = new Map();
    const tgtUsed = new Map();
    return links.map((link) => {
      const sPos = findPos(sourceArr, link.source);
      const tPos = findPos(targetArr, link.target);
      if (!sPos || !tPos) return null;
      const sH = (link.value / (sourceArr.find(n => n.id === link.source)?.value || 1)) * sPos.h;
      const tH = (link.value / (targetArr.find(n => n.id === link.target)?.value || 1)) * tPos.h;
      const sOff = srcUsed.get(link.source) || 0;
      const tOff = tgtUsed.get(link.target) || 0;
      srcUsed.set(link.source, sOff + sH);
      tgtUsed.set(link.target, tOff + tH);
      return { ...link, path: buildLinkPath(sPos, tPos, sOff, sH, tOff, tH) };
    }).filter(Boolean);
  };

  const paths1 = computeLinkPaths(links1, posPersons, posOrgs);
  const paths2 = computeLinkPaths(links2, posOrgs, posLocs);

  const NODE_COLOR = { person: "#6366f1", org: "#f59e0b", loc: "#10b981" };

  return (
    <div className="relative overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-96">
        <text x={COL_X[0] + NODE_WIDTH / 2} y={16} textAnchor="middle"
          fontSize={10} fontWeight={600} fill="#6366f1">Nama</text>
        <text x={COL_X[1] + NODE_WIDTH / 2} y={16} textAnchor="middle"
          fontSize={10} fontWeight={600} fill="#f59e0b">Organisasi</text>
        <text x={COL_X[2] + NODE_WIDTH / 2} y={16} textAnchor="middle"
          fontSize={10} fontWeight={600} fill="#10b981">Lokasi</text>

        {paths1.map((l, i) => (
          <path key={`l1-${i}`} d={l.path}
            fill={NODE_COLOR.person}
            fillOpacity={hoveredLink === `${l.source}|${l.target}` ? 0.55 : 0.18}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredLink(`${l.source}|${l.target}`)}
            onMouseLeave={() => setHoveredLink(null)}
          />
        ))}

        {paths2.map((l, i) => (
          <path key={`l2-${i}`} d={l.path}
            fill={NODE_COLOR.org}
            fillOpacity={hoveredLink === `${l.source}|${l.target}` ? 0.55 : 0.18}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredLink(`${l.source}|${l.target}`)}
            onMouseLeave={() => setHoveredLink(null)}
          />
        ))}

        {posPersons.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={NODE_WIDTH} height={n.h}
              fill={NODE_COLOR.person} rx={2} />
            <text x={n.x - 8} y={n.y + n.h / 2}
              textAnchor="end" dominantBaseline="middle"
              fontSize={9} fill="#475569">
              {n.id.length > 18 ? n.id.slice(0, 17) + "…" : n.id}
            </text>
          </g>
        ))}

        {posOrgs.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={NODE_WIDTH} height={n.h}
              fill={NODE_COLOR.org} rx={2} />
            <text x={n.x + NODE_WIDTH / 2} y={n.y - 5}
              textAnchor="middle" fontSize={8} fill="#475569">
              {n.id.length > 16 ? n.id.slice(0, 15) + "…" : n.id}
            </text>
          </g>
        ))}

        {posLocs.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={NODE_WIDTH} height={n.h}
              fill={NODE_COLOR.loc} rx={2} />
            <text x={n.x + NODE_WIDTH + 8} y={n.y + n.h / 2}
              textAnchor="start" dominantBaseline="middle"
              fontSize={9} fill="#475569">
              {n.id.length > 14 ? n.id.slice(0, 13) + "…" : n.id}
            </text>
          </g>
        ))}
      </svg>

      {hoveredLink && (
        <div className="absolute top-2 right-2 bg-white border border-slate-200 rounded-lg shadow p-2 text-xs">
          <p className="text-slate-600">{hoveredLink.replace("|", " → ")}</p>
        </div>
      )}

      <div className="flex items-center gap-4 justify-center mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>Nama</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Organisasi</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Lokasi</span>
      </div>
    </div>
  );
}

// Nama dan Berita
function NamaBeritaTabel({ filters }) {
  const { data, loading, error } = useESData("nama_berita", filters);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  if (loading) return <Skeleton h="h-64" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_person?.buckets ?? [];
  const rows = buckets.map((b) => ({
    nama: b.key,
    judul: b.judul?.buckets?.[0]?.key ?? "-",
    topik: b.topik?.buckets?.[0]?.key ?? "-",
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
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Nama</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Judul</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Topik</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Sentimen</th>
              <th className="text-right py-2 px-2 text-slate-500 font-medium">Link</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-2 px-2 font-medium text-slate-800">{row.nama}</td>
                <td className="py-2 px-2 text-slate-600 max-w-xs truncate">{row.judul}</td>
                <td className="py-2 px-2 text-slate-600">{row.topik}</td>
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
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">{rows.length} nama</span>
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

export default function DashboardAktor({ filters, userRole, onSimulateLogin }) {
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
          <IntisariAI filters={filters} section="aktor" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Top 5 Nama">
          <HBarChart type="nama" aggKey="nama" filters={filters} />
        </Card>
        <Card title="Top 5 Organisasi">
          <HBarChart type="organisasi" aggKey="organisasi" filters={filters} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Top 5 Organisasi Berpengaruh dalam Berita">
          <OrganisasiBerpengaruhChart filters={filters} />
        </Card>
        <Card title="Top 10 Lokasi Berpengaruh dalam Berita">
          <LokasiChart filters={filters} />
        </Card>
      </div>

      <div className="gap-6">
        <Card title="Network Organisasi dan Orang">
          <NetworkGraph filters={filters} />
        </Card>
      </div>

      <Card title="Flow Nama, Organisasi, dan Lokasi">
        <FlowSankey filters={filters} />
      </Card>

      <Card title="Nama dan Berita">
        <NamaBeritaTabel filters={filters} />
      </Card>

    </main>
  );
}