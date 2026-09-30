"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import PremiumPaywall from '@/components/landing';
import IntisariAI from '@/components/intisariAI';

// warna
const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#6366F1"];
const SENTIMEN_COLOR = { positif:"#10B981", netral:"#7C3AED", negatif:"#EF4444"};
const EMOSI_COLOR = { Happy:   "#F59E0B", Sadness: "#7C3AED", Anger:   "#EF4444", Fear:    "#EC4899", Love:    "#F97316"};

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

  // Pakai useMemo bukan JSON.stringify langsung
  const filtersKey = `${type}-${filters?.from}-${filters?.to}-${filters?.topik}-${filters?.sdg}-${filters?.sentimen}-${filters?.lucene}-${filters?._refreshTrigger}`;

  useEffect(() => {
    if (!filters?.from) return; // tunggu sampai filters terisi

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

  }, [filtersKey]); // pakai string gabungan, bukan object

  return { data, loading, error };
}

// Sentimen dalam Berita
function SentimenChart({filters}) {
  const { data, loading, error } = useESData("sentimen", filters);
  if (loading) return <Skeleton h="h-48" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.sentimen?.buckets ?? [];
  const total = buckets.reduce((s, b) => s + b.doc_count, 0);
  const chartData = buckets.map((b) => ({ name: b.key, value: b.doc_count }));

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={SENTIMEN_COLOR[entry.name] ?? COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${((v / total) * 100).toFixed(1)}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {chartData.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: SENTIMEN_COLOR[entry.name] ?? COLORS[i] }}
            />
            <span className="text-xs text-slate-600 capitalize">{entry.name}</span>
            <span className="text-xs font-semibold text-slate-800 ml-auto pl-4">
              {((entry.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Emosi non Netral dalam Berita
function EmosiChart({filters}) {
  const { data, loading, error } = useESData("emosi", filters);
  if (loading) return <Skeleton h="h-48" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.emosi?.buckets ?? [];
  const total = buckets.reduce((s, b) => s + b.doc_count, 0);
  const chartData = buckets.map((b) => ({ name: b.key, value: b.doc_count }));

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={EMOSI_COLOR[entry.name] ?? COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${((v / total) * 100).toFixed(1)}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {chartData.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: EMOSI_COLOR[entry.name] ?? COLORS[i] }}
            />
            <span className="text-xs text-slate-600">{entry.name}</span>
            <span className="text-xs font-semibold text-slate-800 ml-auto pl-4">
              {((entry.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper: transform data nested bucket ke format recharts
function transformPerHari(outerBuckets, outerKey, innerKey = "per_day") {
  const allDates = new Set();
  outerBuckets.forEach(outer =>
    outer[innerKey]?.buckets?.forEach(d =>
      allDates.add(d.key_as_string?.slice(0, 10))
    )
  );

  return Array.from(allDates).sort().map(date => {
    const row = { date: date.slice(5) };
    outerBuckets.forEach(outer => {
      const found = outer[innerKey]?.buckets?.find(
        d => d.key_as_string?.slice(0, 10) === date
      );
      row[outer.key] = found?.doc_count ?? 0;
    });
    return row;
  });
}

// Sentimen per Hari
function SentimenPerHariChart({ filters }) {
  const { data, loading, error } = useESData("sentimen_perhari", filters);
  if (loading) return <Skeleton h="h-56" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_sentiment?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const chartData = transformPerHari(buckets, "per_sentiment");

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {buckets.map((b) => (
          <Line
            key={b.key}
            type="monotone"
            dataKey={b.key}
            stroke={SENTIMEN_COLOR[b.key] ?? COLORS[0]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Emosi per Hari
function EmosiPerHariChart({ filters }) {
  const { data, loading, error } = useESData("emosi_perhari", filters);
  if (loading) return <Skeleton h="h-56" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_emosi?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const chartData = transformPerHari(buckets, "per_emosi");

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {buckets.map((b) => (
          <Line
            key={b.key}
            type="monotone"
            dataKey={b.key}
            stroke={EMOSI_COLOR[b.key] ?? COLORS[0]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Sentimen Positif, Negatif, dan Netral
function TabelSentimen({ type, label, color, filters }) {
  const { data, loading, error } = useESData(type, filters);
  if (loading) return <Skeleton h="h-48" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_phrase?.buckets ?? [];

  return (
    <div className="overflow-y-auto max-h-52">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-slate-500 font-medium">Kata Kunci</th>
            <th className="text-right py-2 text-slate-500 font-medium">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-1.5 text-slate-700">{b.key}</td>
              <td className="py-1.5 text-right font-semibold" style={{ color }}>
                {b.doc_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardSentimen({ filters, userRole, onSimulateLogin }) {
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
          <IntisariAI filters={filters} section="sentimen" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Sentimen dalam Berita">
          <SentimenChart filters={filters} />
        </Card>
        <Card title="Emosi non Netral dalam Berita">
          <EmosiChart filters={filters} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Tren Sentimen per Hari">
          <SentimenPerHariChart filters={filters} />
        </Card>
        <Card title="Tren Emosi per Hari">
          <EmosiPerHariChart filters={filters} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Sentimen Positif & Netral">
          <TabelSentimen type="sentimen_positif" label="Positif/Netral" color="#10b981" filters={filters} />
        </Card>
        <Card title="Sentimen Negatif dalam Berita">
          <TabelSentimen type="sentimen_negatif" label="Negatif" color="#ef4444" filters={filters} />
        </Card>
      </div>

    </main>
  );
}