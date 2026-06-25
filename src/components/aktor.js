"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";

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

export default function DashboardAktor({ filters }) {
  console.log("Current Filters State:", filters);
  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h3 className="font-bold text-slate-800 text-lg">Intisari Hari Ini</h3>
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Area ini akan memuat ringkasan otomatis dari LLM tentang tren berita terkini,
          metrik sentimen dominan, dan tokoh yang paling banyak dibicarakan hari ini.
        </p>
      </div>

    </main>
  );
}