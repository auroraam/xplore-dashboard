"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";

// warna
const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#7C3AED", "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#6366F1"];
const SENTIMEN_COLOR = { positif:"#10B981", netral:"#7C3AED", negatif:"#EF4444"};
const EMOSI_COLOR = { Happy:   "#F59E0B", Sadness: "#7C3AED", Anger:   "#EF4444", Fear:    "#EC4899", Love:    "#F97316"};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-3 text-xs"
         style={{ boxShadow: "0 8px 24px rgba(124,58,237,0.10)" }}>
      <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <b>{p.value?.toLocaleString()}</b>
        </p>
      ))}
    </div>
  );
};

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}
         style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {title && (
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {/* Three-dot menu icon */}
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </button>
        </div>
      )}
      <div className="p-5">{children}</div>
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

  const filtersKey = `${type}-${filters?.from}-${filters?.to}-${filters?.topik}-${filters?.sentimen}-${filters?.lucene}`;

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

// Jumlah Berita & Sumber
function StatPanel({ filters }) {
  const { data, loading } = useESData("stat", filters);
  const jumlah = data?.aggregations?.total_berita?.value ?? 0;
  const kantor = data?.aggregations?.kantor_berita?.value ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-red-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-red-700">
          {loading ? "…" : jumlah >= 1000 ? `${(jumlah / 1000).toFixed(1)} K` : jumlah}
        </p>
        <p className="text-xs text-slate-500 mt-1">Jumlah Berita</p>
      </div>
      <div className="bg-emerald-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-emerald-700">
          {loading ? "…" : kantor >= 1000 ? `${(kantor / 1000).toFixed(2)} K` : kantor}
        </p>
        <p className="text-xs text-slate-500 mt-1">Kantor Berita</p>
      </div>
    </div>
  );
}

// Evolusi Kata Kunci / Isu
function EvolusiChart({filters}) {
  const { data, loading, error } = useESData("evolusi", filters);

  if (loading) return <Skeleton h="h-72" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_phrase?.buckets ?? [];

  const allDates = new Set();
  buckets.forEach((phrase) =>
    phrase.per_day.buckets.forEach((d) => allDates.add(d.key_as_string?.slice(0, 10)))
  );
  const sortedDates = Array.from(allDates).sort();

  const chartData = sortedDates.map((date) => {
    const row = { date: date.slice(5) }; 
    buckets.forEach((phrase) => {
      const dayBucket = phrase.per_day.buckets.find(
        (d) => d.key_as_string?.slice(0, 10) === date
      );
      row[phrase.key] = dayBucket?.doc_count ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {buckets.map((phrase, i) => (
          <Line
            key={phrase.key}
            type="monotone"
            dataKey={phrase.key}
            stroke={COLORS[i % COLORS.length]}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
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

export default function DashboardContent({ filters }) {
  console.log("Current Filters State:", filters);
  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-red-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h3 className="font-bold text-slate-800 text-lg">Intisari Hari Ini</h3>
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Area ini akan memuat ringkasan otomatis dari LLM tentang tren berita terkini,
          metrik sentimen dominan, dan tokoh yang paling banyak dibicarakan hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Jumlah Berita & Sumber">
          <StatPanel filters={filters} />
        </Card>
        {/* <Card title="Sentimen dalam Berita">
          <SentimenChart filters={filters} />
        </Card>
        <Card title="Emosi non Netral dalam Berita">
          <EmosiChart filters={filters} />
        </Card> */}
      </div>

      <Card title="Evolusi Kata Kunci / Isu">
        <EvolusiChart filters={filters} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Top 5 Topik Berita">
          <HBarChart type="topik" aggKey="topik" filters={filters} />
        </Card>
        <Card title="Top 5 Nama">
          <HBarChart type="nama" aggKey="nama" filters={filters} />
        </Card>
        <Card title="Top 5 Organisasi">
          <HBarChart type="organisasi" aggKey="organisasi" filters={filters} />
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Sentimen Positif & Netral">
          <TabelSentimen type="sentimen_positif" label="Positif/Netral" color="#10b981" filters={filters} />
        </Card>
        <Card title="Sentimen Negatif dalam Berita">
          <TabelSentimen type="sentimen_negatif" label="Negatif" color="#ef4444" filters={filters} />
        </Card>
      </div> */}

      <Card title="Kata Kunci dalam Berita (7 hari terakhir)">
        <TabelKunci filters={filters} />
      </Card>

      <Card title="Kata Kunci atau Isu dalam Berita">
        <WordCloud filters={filters} />
      </Card>

      <Card title="Nama dan Berita">
        <NamaBeritaTabel filters={filters} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Top 5 Organisasi Berpengaruh dalam Berita">
          <OrganisasiBerpengaruhChart filters={filters} />
        </Card>
        <Card title="Top 10 Lokasi Berpengaruh dalam Berita">
          <LokasiChart filters={filters} />
        </Card>
      </div>

    </main>
  );
}