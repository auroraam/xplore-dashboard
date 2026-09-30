"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Area, AreaChart
} from "recharts";
import { geoMercator, geoPath } from "d3-geo";
import PremiumPaywall from '@/components/landing';
import IntisariAI from '@/components/intisariAI';
import { feature } from "topojson-client";

// warna
const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#7C3AED", "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#6366F1"];
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

  const filtersKey = `${type}-${filters?.from}-${filters?.to}-${filters?.topik}-${filters?.sdg}-${filters?.sentimen}-${filters?.sdg}-${filters?.lucene}-${filters?._refreshTrigger}`;

  useEffect(() => {
    if (!filters?.from) return;

    const params = new URLSearchParams();
    params.append("type", type);
    params.append("from", filters.from);
    params.append("to", filters.to ?? "now");
    params.append("topik", filters.topik ?? "$__all");
    params.append("sentimen", filters.sentimen ?? "$__all");
    params.append("sdg", filters.sdg ?? "$__all");
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
  const jumlah = data?.hits?.total?.value ?? 0;
  const kantor = data?.aggregations?.kantor_berita?.value ?? 0;
  const organisasi = data?.aggregations?.total_organisasi?.value ?? 0;
  const kata_kunci = data?.aggregations?.kata_kunci_unik?.value ?? 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-indigo-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-indigo-700">
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
      <div className="bg-indigo-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-indigo-700">
          {loading ? "…" : organisasi >= 1000 ? `${(organisasi / 1000).toFixed(2)} K` : organisasi}
        </p>
        <p className="text-xs text-slate-500 mt-1">Jumlah Organisasi</p>
      </div>
      <div className="bg-emerald-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-emerald-700">
          {loading ? "…" : kata_kunci >= 1000 ? `${(kata_kunci / 1000).toFixed(2)} K` : kata_kunci}
        </p>
        <p className="text-xs text-slate-500 mt-1">Kata Kunci Unik</p>
      </div>
    </div>
  );
}

// Evolusi Kata Kunci
function EvolusiChart({filters}) {
  const { data, loading, error } = useESData("evolusi", filters);
  
  const [activeLine, setActiveLine] = useState(null); 

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
    <div className="flex flex-col md:flex-row gap-6 w-full items-start">
      
      {/* 1. BAGIAN KIRI: CHART */}
      <div className="flex-1 w-full min-w-0">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            
            {buckets.map((phrase, i) => {
              if (activeLine && activeLine !== phrase.key) return null;

              return (
                <Line
                  key={phrase.key}
                  type="monotone"
                  dataKey={phrase.key}
                  stroke={COLORS[i % COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. BAGIAN KANAN: CUSTOM LEGEND & TOTAL */}
      <div className="w-full md:w-64 shrink-0 flex flex-col max-h-[280px]">
        
        <div className="flex justify-between items-center text-blue-600 font-medium text-xs pb-2 border-b border-gray-200 px-1">
          <span>Name</span>
          <span>Total</span>
        </div>

        <div className="overflow-y-auto flex-1 pt-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
          {buckets.map((phrase, i) => {
            
            const isInactive = activeLine && activeLine !== phrase.key;

            return (
              <div 
                key={phrase.key} 
                onClick={() => setActiveLine(activeLine === phrase.key ? null : phrase.key)}
                className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 cursor-pointer transition-all px-1 
                  ${isInactive ? 'opacity-30 grayscale' : 'hover:bg-slate-50 opacity-100'}` // Bikin item lain memudar
                }
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className="w-3.5 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span 
                    className="text-xs font-medium text-slate-700 truncate capitalize" 
                    title={phrase.key}
                  >
                    {phrase.key}
                  </span>
                </div>
                
                <span className="text-xs font-semibold text-slate-700 ml-3">
                  {phrase.doc_count || 0}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GANTI seluruh fungsi decodeGeohash + PetaChart yang lama dengan ini
// ════════════════════════════════════════════════════════════════════════

function decodeGeohash(geohash) {
  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let evenBit = true;
  let latMin = -90, latMax = 90, lonMin = -180, lonMax = 180;
  for (const char of geohash) {
    const idx = BASE32.indexOf(char);
    if (idx === -1) continue;
    for (const mask of BITS) {
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2;
        if (idx & mask) lonMin = lonMid; else lonMax = lonMid;
      } else {
        const latMid = (latMin + latMax) / 2;
        if (idx & mask) latMin = latMid; else latMax = latMid;
      }
      evenBit = !evenBit;
    }
  }
  return { lat: (latMin + latMax) / 2, lon: (lonMin + lonMax) / 2 };
}

const LAT_MIN = -11, LAT_MAX = 6.5, LON_MIN = 94, LON_MAX = 142;
const MAP_W = 600, MAP_H = 280;

// ── Grid lines konfigurasi ────────────────────────────────────────────
const LON_LINES = [95, 100, 105, 110, 115, 120, 125, 130, 135, 140];
const LAT_LINES = [-10, -5, 0, 5];

function PetaChart({ filters }) {
  const { data, loading, error } = useESData("peta", filters);
  const [hovered, setHovered] = useState(null);
  const [topoData, setTopoData] = useState(null);

  // ── Zoom & Pan state ──────────────────────────────────────────────
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 8;

  // Ambil Data GeoJSON langsung dari URL external yang sudah valid
  useEffect(() => {
    // Panggil file TopoJSON dari folder public
    fetch("/indonesia-38-provinces.topo.json")
      .then((res) => res.json())
      .then((data) => setTopoData(data))
      .catch((err) => console.error("Gagal memuat TopoJSON:", err));
  }, []);

  // Setup D3 Geo Projection
  const { projection, pathGenerator, geoFeatures } = useMemo(() => {
    if (!topoData) return { projection: null, pathGenerator: null, geoFeatures: [] };
    
    // 👇 KONVERSI TOPOJSON (sesuai artikel yang kamu temukan) 👇
    const objectKey = Object.keys(topoData.objects)[0]; 
    const provinces = feature(topoData, topoData.objects[objectKey]);

    // Setup proyeksi peta (Manual center & scale agar koordinat titik beritamu tidak meleset)
    const proj = geoMercator()
      .center([118.0, -2.5]) 
      .scale(680) // Atur angka ini kalau petanya kurang besar/kecil
      .translate([MAP_W / 2, MAP_H / 2]); 
      
    const pathGen = geoPath().projection(proj);
    
    return { 
      projection: proj, 
      pathGenerator: pathGen,
      geoFeatures: provinces.features // Ambil array features-nya untuk digambar
    };
  }, [topoData]);

  // Fungsi helper untuk menerjemahkan lat/lon menjadi posisi x/y di layar
  const getCoord = (lon, lat) => {
    if (!projection) return { x: 0, y: 0 };
    const [x, y] = projection([lon, lat]);
    return { x, y };
  };

  // Zoom dengan scroll wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    // Posisi kursor relatif ke SVG
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * MAP_W;
    const mouseY = ((e.clientY - svgRect.top) / svgRect.height) * MAP_H;

    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.85;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, transform.scale * zoomFactor));

    // Zoom ke arah kursor
    const newTx = mouseX - (mouseX - transform.tx) * (newScale / transform.scale);
    const newTy = mouseY - (mouseY - transform.ty) * (newScale / transform.scale);

    setTransform({ scale: newScale, tx: newTx, ty: newTy });
  };

  // Pan dengan drag
  const handleMouseDown = (e) => {
    if (e.target.tagName === "circle") return; // jangan drag kalau klik titik
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.tx, y: e.clientY - transform.ty });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      tx: e.clientX - dragStart.x,
      ty: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Reset zoom
  const resetZoom = () => setTransform({ scale: 1, tx: 0, ty: 0 });

  if (loading) return <Skeleton h="h-80" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.peta?.buckets ?? [];
  const points = buckets.map((b) => {
    const { lat, lon } = decodeGeohash(b.key);
    return {
      lat, lon,
      count: b.doc_count,
      judul: b.judul?.buckets?.[0]?.key ?? "-",
      link: b.link?.buckets?.[0]?.key ?? "#",
    };
  });

  const maxCount = Math.max(...points.map((p) => p.count), 1);

  // Radius titik mengecil saat zoom in biar tidak numpuk
  const dotRadius = (count) => {
    const base = 3 + (count / maxCount) * 12;
    return base / Math.sqrt(transform.scale);
  };

  return (
    <div className="relative">
      {/* Kontrol zoom */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setTransform(p => ({
            ...p,
            scale: Math.min(MAX_SCALE, p.scale * 1.3),
            tx: p.tx - (MAP_W * 0.15),
            ty: p.ty - (MAP_H * 0.15),
          }))}
          className="w-7 h-7 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 shadow text-sm font-bold flex items-center justify-center"
        >+</button>
        <button
          onClick={() => setTransform(p => ({
            ...p,
            scale: Math.max(MIN_SCALE, p.scale * 0.77),
            tx: p.tx + (MAP_W * 0.12),
            ty: p.ty + (MAP_H * 0.12),
          }))}
          className="w-7 h-7 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 shadow text-sm font-bold flex items-center justify-center"
        >−</button>
        <button
          onClick={resetZoom}
          className="w-7 h-7 bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 shadow text-xs flex items-center justify-center"
          title="Reset zoom"
        >⟳</button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-80 rounded-lg select-none"
        style={{
          background: "#dbeafe",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Semua konten dalam group yang di-transform */}
        <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${transform.scale})`}
          style={{ transformOrigin: "0 0" }}>

          {/* ── Background laut ── */}
          <rect
            x={-MAP_W} y={-MAP_H}
            width={MAP_W * 3} height={MAP_H * 3}
            fill="#dbeafe"
          />

          {/* ── Grid garis koordinat ── */}
          {LON_LINES.map((lon) => {
            const { x } = getCoord(lon, 0); // Ambil X dari longitude
            return (
              <g key={`lon-${lon}`}>
                <line x1={x} y1={-MAP_H} x2={x} y2={MAP_H * 2}
                  stroke="#bfdbfe" strokeWidth={0.4 / transform.scale} strokeDasharray={`${3/transform.scale},${3/transform.scale}`} />
                <text x={x} y={MAP_H - 2 / transform.scale} textAnchor="middle" fontSize={7 / transform.scale} fill="#60a5fa" fontFamily="monospace">
                  {lon}°BT
                </text>
              </g>
            );
          })}
          {LAT_LINES.map((lat) => {
            const { y } = getCoord(115, lat); // Ambil Y dari latitude
            const label = lat === 0 ? "0°" : lat > 0 ? `${lat}°LU` : `${Math.abs(lat)}°LS`;
            return (
              <g key={`lat-${lat}`}>
                <line x1={-MAP_W} y1={y} x2={MAP_W * 2} y2={y}
                  stroke="#bfdbfe" strokeWidth={0.4 / transform.scale} strokeDasharray={`${3/transform.scale},${3/transform.scale}`} />
                <text x={2 / transform.scale} y={y - 2 / transform.scale} fontSize={7 / transform.scale} fill="#60a5fa" fontFamily="monospace">
                  {label}
                </text>
              </g>
            );
          })}

          {/* ── Outline pulau ── */}
          {geoFeatures.length > 0 && pathGenerator && geoFeatures.map((feat, i) => (
            <path
              key={`prov-${i}`}
              d={pathGenerator(feat)}
              fill="#d1fae5"
              stroke="#6ee7b7"
              strokeWidth={0.8 / transform.scale}
            />
          ))}


          {/* ── Titik berita ── */}
          {points.map((p, i) => {
            // Gunakan getCoord agar letak titik jatuh persis di atas GeoJSON
            const { x, y } = getCoord(p.lon, p.lat);
            const r = dotRadius(p.count);
            const isHovered = hovered?.judul === p.judul;
            
            return (
              <g key={i}>
                {isHovered && (
                  <circle cx={x} cy={y} r={r + 4 / transform.scale} fill="#6366f1" fillOpacity={0.2} />
                )}
                <circle
                  cx={x} cy={y} r={r}
                  fill="#6366f1"
                  fillOpacity={isHovered ? 0.95 : 0.65}
                  stroke="white"
                  strokeWidth={0.8 / transform.scale}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(p)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => p.link !== "#" && window.open(p.link, "_blank")}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip hover */}
      {hovered && (
        <div className="absolute bottom-10 left-2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 max-w-xs text-xs z-10 pointer-events-none">
          <p className="font-semibold text-slate-700 mb-1">
            {hovered.count.toLocaleString()} berita
          </p>
          <p className="text-slate-500 mb-1">
            {hovered.lat.toFixed(2)}° {hovered.lat >= 0 ? "LU" : "LS"} ·{" "}
            {hovered.lon.toFixed(2)}° BT
          </p>
          <p className="text-slate-600 line-clamp-2">{hovered.judul}</p>
          {hovered.link !== "#" && (
            <a href={hovered.link} target="_blank" rel="noreferrer"
              className="text-indigo-500 hover:underline mt-1 inline-block pointer-events-auto">
              buka ↗
            </a>
          )}
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-slate-400">
          {points.length} lokasi · scroll untuk zoom · drag untuk geser
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-400 inline-block" />
            Daratan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Titik berita
          </span>
        </div>
      </div>
    </div>
  );
}

function BeritaPerHariChart({ filters }) {
  const { data, loading, error } = useESData("berita_perhari", filters);

  if (loading) return <Skeleton h="h-40" />;
  if (error) return <p className="text-red-400 text-xs">{error}</p>;

  const buckets = data?.aggregations?.per_day?.buckets ?? [];
  if (buckets.length === 0) return <p className="text-xs text-slate-400">Tidak ada data</p>;

  const chartData = buckets.map(b => ({
    date: b.key_as_string?.slice(5, 10), // MM-DD
    jumlah: b.doc_count,
  }));

  const total = buckets.reduce((s, b) => s + b.doc_count, 0);
  const maxPerHari = Math.max(...buckets.map(b => b.doc_count));
  const rataRata = Math.round(total / buckets.length);

  return (
    <div>
      {/* Stat ringkasan di atas chart */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-indigo-700">
            {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total}
          </p>
          <p className="text-xs text-slate-500">Total Berita</p>
        </div> */}
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">
            {rataRata >= 1000 ? `${(rataRata / 1000).toFixed(1)}K` : rataRata}
          </p>
          <p className="text-xs text-slate-500">Rata-rata/Hari</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-amber-700">
            {maxPerHari >= 1000 ? `${(maxPerHari / 1000).toFixed(1)}K` : maxPerHari}
          </p>
          <p className="text-xs text-slate-500">Tertinggi/Hari</p>
        </div>
      </div>

      {/* Area chart */}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="gradBerita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} width={40}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="jumlah"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gradBerita)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardContent({ filters, userRole, onOpenPlans }) {
  console.log("Current Filters State:", filters);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="">
        <Card>
          {/* 2. Cek apakah user adalah Guest */}
          {userRole === "Guest" ? (
            
            /* TAMPILAN MINI-PAYWALL KHUSUS AI */
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <span className="text-3xl mb-3">✨</span>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Intisari AI Terkunci</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm">
                Ringkasan otomatis menggunakan Gemini AI hanya tersedia untuk pengguna premium.
              </p>
              {/* Tombol yang memicu pop-up dari Bapaknya */}
              <button 
                onClick={onOpenPlans} 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Upgrade Sekarang
              </button>
            </div>

          ) : (
            
            /* JIKA SUDAH BAYAR, TAMPILKAN AI ASLINYA */
            <IntisariAI filters={filters} section="utama" />
            
          )}
        </Card>
      </div>

      <div className="gap-6">
        <Card title="Jumlah Berita & Sumber">
          <StatPanel filters={filters} />
        </Card>
      </div>

      <Card title="Rincian Berita per Hari">
        <BeritaPerHariChart filters={filters} />
      </Card>

      <Card title="Evolusi Kata Kunci / Isu">
        <EvolusiChart filters={filters} />
      </Card>

      <div className="">
        <Card title="Berita dalam Peta">
          <PetaChart filters={filters} />
        </Card>
      </div>     

    </main>
  );
}