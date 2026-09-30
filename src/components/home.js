"use client";
import { useEffect, useState } from "react";
import PremiumPaywall from '@/components/landing';


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


export default function LandingPage({ setActiveMenu }) {
  const menuCards = [
    { name: 'Utama', icon: '📊', desc: 'Ringkasan keseluruhan metrik analitik' },
    { name: 'Sentimen', icon: '🎭', desc: 'Analisis opini positif, netral, dan negatif' },
    { name: 'Aktor & Jaringan', icon: '🕸️', desc: 'Peta relasi tokoh dan organisasi' },
    { name: 'Tren Isu', icon: '📈', desc: 'Pergerakan topik berita dari waktu ke waktu' },
    { name: 'Sumber Media', icon: '📰', desc: 'Distribusi dan dominasi portal berita' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
      
      {/* ── KOTAK UTAMA (Mengikuti gaya border-gray-200, shadow-sm, dan rounded-xl) ── */}
      <div className="bg-white rounded-xl p-6 md:p-8 mx-auto w-full shadow-sm border border-gray-200 flex flex-col">
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col items-center justify-center pb-6 border-b border-gray-100 mb-6 text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl"></span>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 leading-tight">
              Selamat Datang di xPlore
            </h1>
          </div>
          <span className="text-sm text-violet-500 font-medium">
            Platform Analitik Berita & Media
          </span>
          <p className="text-gray-500 text-xs mt-3 max-w-md leading-relaxed">
            Pilih salah satu panel di bawah ini untuk mulai memantau sentimen publik, jaringan aktor, dan tren isu secara real-time.
          </p>
        </div>

        {/* ── MENU GRID (Gaya hover dan border persis seperti tombol Insight) ── */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {menuCards.map((menu) => (
            <button
              key={menu.name}
              onClick={() => setActiveMenu(menu.name)}
              className="text-left bg-white border border-gray-200 hover:bg-violet-50 hover:border-violet-300 group flex flex-col gap-2 px-4 py-4 rounded-lg transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {menu.icon}
                </span>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-violet-600 transition-colors">
                  {menu.name}
                </h3>
              </div>
              <p className="text-xs text-gray-400 group-hover:text-violet-500/80 leading-relaxed transition-colors">
                {menu.desc}
              </p>
            </button>
          ))}
        </div>

      </div>
    </main>
  );
}