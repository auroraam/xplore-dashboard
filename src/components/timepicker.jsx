"use client";
import { useState, useRef, useEffect } from "react";

const QUICK_RANGES = [
  { label: "Last 5 minutes",  from: "now-5m",   to: "now" },
  { label: "Last 15 minutes", from: "now-15m",  to: "now" },
  { label: "Last 30 minutes", from: "now-30m",  to: "now" },
  { label: "Last 1 hour",     from: "now-1h",   to: "now" },
  { label: "Last 3 hours",    from: "now-3h",   to: "now" },
  { label: "Last 6 hours",    from: "now-6h",   to: "now" },
  { label: "Last 12 hours",   from: "now-12h",  to: "now" },
  { label: "Last 24 hours",   from: "now-24h",  to: "now" },
  { label: "Last 2 days",     from: "now-2d",   to: "now" },
  { label: "Last 7 days",     from: "now-7d",   to: "now" },
  { label: "Last 30 days",    from: "now-30d",  to: "now" },
  { label: "Last 90 days",    from: "now-90d",  to: "now" },
  { label: "Last 6 months",   from: "now-6M",   to: "now" },
  { label: "Last 1 year",     from: "now-1y",   to: "now" },
  { label: "Last 2 years",    from: "now-2y",   to: "now" },
  { label: "Last 5 years",    from: "now-5y",   to: "now" },
  { label: "Yesterday",       from: "now-1d/d", to: "now-1d/d" },
  { label: "This week",       from: "now/w",    to: "now/w" },
  { label: "This month",      from: "now/M",    to: "now/M" },
  { label: "This year",       from: "now/y",    to: "now/y" },
];

function formatLabel(from, to) {
  const match = QUICK_RANGES.find(r => r.from === from && r.to === to);
  if (match) return match.label;
  const f = from.includes("now") ? from : from.slice(0, 10);
  const t = to.includes("now") ? to : to.slice(0, 10);
  return `${f} → ${t}`;
}

function MiniCalendar({ value, onChange }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const selected = value ? new Date(value) : null;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleDay = (d) => {
    if (!d) return;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onChange(iso);
  };

  const isSelected = (d) => {
    if (!selected || !d) return false;
    return selected.getFullYear() === year &&
      selected.getMonth() === month &&
      selected.getDate() === d;
  };

  const isToday = (d) =>
    d && today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d;

  return (
    <div className="w-full">
      {/* Nav bulan */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-slate-100 text-slate-500 text-xs">‹</button>
        <span className="text-xs font-semibold text-slate-700">{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-slate-100 text-slate-500 text-xs">›</button>
      </div>
      {/* Hari */}
      <div className="grid grid-cols-7 gap-px">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
        ))}
        {cells.map((d, i) => (
          <button key={i} onClick={() => handleDay(d)} disabled={!d}
            className={`text-center text-xs py-1 rounded transition-colors
              ${!d ? "" :
                isSelected(d) ? "bg-blue-600 text-white font-bold" :
                isToday(d) ? "bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100" :
                "text-slate-700 hover:bg-slate-100"
              }`}>
            {d || ""}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TimePicker({ filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [absFrom, setAbsFrom] = useState("");
  const [absTo, setAbsTo] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyQuick = (range) => {
    setFilters(f => ({ ...f, from: range.from, to: range.to }));
    setOpen(false);
  };

  const applyAbsolute = () => {
    if (!absFrom || !absTo) return;
    setFilters(f => ({ ...f, from: absFrom + "T00:00:00", to: absTo + "T23:59:59" }));
    setOpen(false);
  };

  const filtered = QUICK_RANGES.filter(r =>
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {formatLabel(filters.from, filters.to)}
        <svg className="w-3 h-3 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl w-[560px] flex overflow-hidden">

          <div className="w-[240px] border-r border-slate-100 p-4 flex flex-col gap-4">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Absolute time range</p>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">From</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <input type="text" value={absFrom}
                  onChange={e => setAbsFrom(e.target.value)}
                  placeholder="now-7d"
                  className="flex-1 px-3 py-1.5 text-xs outline-none text-slate-700" />
                <button className="px-2 py-1.5 border-l border-slate-200 text-slate-400 hover:bg-slate-50 text-sm">📅</button>
              </div>
              <MiniCalendar value={absFrom} onChange={setAbsFrom} />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">To</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <input type="text" value={absTo}
                  onChange={e => setAbsTo(e.target.value)}
                  placeholder="now"
                  className="flex-1 px-3 py-1.5 text-xs outline-none text-slate-700" />
                <button className="px-2 py-1.5 border-l border-slate-200 text-slate-400 hover:bg-slate-50 text-sm">📅</button>
              </div>
              <MiniCalendar value={absTo} onChange={setAbsTo} />
            </div>

            <button onClick={applyAbsolute}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
              Apply time range
            </button>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-3">
            {/* Search */}
            <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
              <svg className="w-3.5 h-3.5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search quick ranges"
                value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-slate-700" />
            </div>

            <div className="overflow-y-auto max-h-[420px] flex flex-col gap-0.5">
              {filtered.map(r => (
                <button key={r.label} onClick={() => applyQuick(r)}
                  className={`text-left px-3 py-1.5 rounded-lg text-xs transition-colors
                    ${filters.from === r.from && filters.to === r.to
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                    }`}>
                  {r.label}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-slate-400 px-3 py-2">Tidak ditemukan</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}