import { useEffect, useState , useMemo} from "react";

// Label judul per bagian
const SECTION_LABEL = {
  utama:    "Utama",
  isu:      "Tren Isu",
  aktor:    "Aktor & Jaringan",
  sentimen: "Sentimen",
  media:    "Sumber Media",
};

function useESData(type, filters, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersKey = `${type}-${filters?.from}-${filters?.to}-${filters?.topik}-${filters?.sdg}-${filters?.sentimen}-${filters?.lucene}-${filters?._refreshTrigger}`;

  useEffect(() => {
    if (!filters?.from || !enabled) return;

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

  }, [filtersKey, enabled]);

  return { data, loading, error };
}

function IntisariAI({ filters, section = "utama" }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const getPrevFilters = (filters) => {
    if (!filters?.from) return filters;
    
    let prevFrom = filters.from;
    let prevTo = filters.from; 

    const match = filters.from.match(/^now-(\d+)([a-zA-Z]+)$/);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[2];
      prevFrom = `now-${val * 2}${unit}`; 
    }
    return { ...filters, from: prevFrom, to: prevTo };
  };

  const prevFilters = useMemo(() => getPrevFilters(filters), [filters]);

  // ── Ambil data sesuai kebutuhan per bagian ────────────────────────
  const { data: dataStat }     = useESData("stat", filters, section === "utama");
  const { data: dataIsu }      = useESData("wordcloud", filters, section === "utama" || section === "isu");
  const { data: dataTopik }    = useESData("topik", filters, section === "isu");
  const { data: dataSDG }      = useESData("sdg", filters, section === "isu");
  const { data: dataSentimen } = useESData("sentimen", filters, section === "sentimen");
  const { data: dataEmosi }     = useESData("emosi", filters, section == "sentimen");
  const { data: dataNama }      = useESData("nama", filters, section === "aktor");
  const { data: dataOrg }       = useESData("organisasi_berpengaruh", filters, section === "aktor");
  const { data: dataLokasi }    = useESData("lokasi", filters, section === "aktor");
  const { data: dataPosistif }  = useESData("sentimen_positif", filters, section === "sentimen");
  const { data: dataNegatif }   = useESData("sentimen_negatif", filters, section === "sentimen");
  const { data: dataOutlet }    = useESData("pie_news", filters, section === "media");
  const { data: dataMedia }     = useESData("media_lokal_mainstream", filters, section === "media");

  const { data: prevDataStat }     = useESData("stat", prevFilters, section === "utama");
  const { data: prevDataIsu }      = useESData("wordcloud", prevFilters, section === "utama" || section === "isu");
  const { data: prevDataTopik }    = useESData("topik", prevFilters, section === "isu");
  const { data: prevDataSDG }      = useESData("sdg", prevFilters, section === "isu");
  const { data: prevDataSentimen } = useESData("sentimen", prevFilters, section === "sentimen");
  const { data: prevDataEmosi }     = useESData("emosi", prevFilters, section == "sentimen");
  const { data: prevDataNama }      = useESData("nama", prevFilters, section === "aktor");
  const { data: prevDataOrg }       = useESData("organisasi_berpengaruh", prevFilters, section === "aktor");
  const { data: prevDataLokasi }    = useESData("lokasi", prevFilters, section === "aktor");
  const { data: prevDataPosistif }  = useESData("sentimen_positif", prevFilters, section === "sentimen");
  const { data: prevDataNegatif }   = useESData("sentimen_negatif", prevFilters, section === "sentimen");
  const { data: prevDataOutlet }    = useESData("pie_news", prevFilters, section === "media");
  const { data: prevDataMedia }     = useESData("media_lokal_mainstream", prevFilters, section === "media");

  // ── Cache key unik per section + hari + filter ────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `insight_${section}_${today}_${filters?.from}_${filters?.topik}_${filters?.sentimen}_${filters?.sdg}`;

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setInsight(parsed.text);
        setLastGenerated(parsed.generatedAt);
      } else {
        // Reset kalau tidak ada cache untuk section/hari ini
        setInsight("");
        setLastGenerated(null);
      }
    } catch (e) {
      console.error("Cache read error:", e);
    }
  }, [cacheKey, isMounted]);

  // ── Susun dashboardData sesuai section ────────────────────────────
  const buildDashboardData = () => {
    const formatUtama = (stat, isu) => ({
      totalBerita: stat?.hits?.total?.value ?? 0,
      totalKantor: stat?.aggregations?.kantor_berita?.value ?? 0,
      topIsu: isu?.aggregations?.wordcloud?.buckets?.slice(0, 5)?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
    });
    const formatIsu = (topik, isu, sdg) => ({
      topTopik: topik?.aggregations?.topik?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      topIsu: isu?.aggregations?.wordcloud?.buckets?.slice(0, 10)?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      sdg: sdg?.aggregations?.sdg?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
    });
    const formatAktor = (nama, org, lokasi) => ({
      topNama: nama?.aggregations?.nama?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      topOrganisasi: org?.aggregations?.organisasi_berpengaruh?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      topLokasi: lokasi?.aggregations?.lokasi?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
    });
    const formatSentimen = (sentimen, emosi, posistif, negatif) => ({
      sentimen: sentimen?.aggregations?.sentimen?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      emosi: emosi?.aggregations?.emosi?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      topPositif: posistif?.aggregations?.per_phrase?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      topNegatif: negatif?.aggregations?.per_phrase?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
    });
    const formatMedia = (outlet, media) => ({
      topOutlet: outlet?.aggregations?.pie_news?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
      jenisMedia: media?.aggregations?.jenis?.buckets?.map(b => ({ name: b.key, value: b.doc_count })) ?? [],
    });
    switch (section) {
      case "utama":
        return {
          currentData: formatUtama(dataStat, dataIsu),
          previousData: formatUtama(prevDataStat, prevDataIsu)
        };

      case "isu":
        return {
          currentData: formatIsu(dataIsu, dataTopik, dataSDG),
          previousData: formatIsu(prevDataIsu, prevDataTopik, prevDataSDG)
        };

      case "aktor":
        return {
          currentData: formatAktor(dataNama, dataOrg, dataLokasi),
          previousData: formatAktor(prevDataNama, prevDataOrg, prevDataLokasi)
        };

      case "sentimen":
        return {
          currentData: formatSentimen(dataSentimen, dataEmosi, dataPosistif, dataNegatif),
          previousData: formatSentimen(prevDataSentimen, prevDataEmosi, prevDataPosistif, prevDataNegatif)
        };

      case "media":
        return {
          currentData: formatMedia(dataOutlet, dataMedia),
          previousData: formatMedia(prevDataOutlet, prevDataMedia)
        };
      default:
        return { currentData: {}, previousData: {} };
    }
  };

  const generateInsight = async () => {
    setLoading(true);
    const payload = buildDashboardData();

    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentData: payload.currentData, 
          previousData: payload.previousData, 
          section
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setInsight(json.error ?? "Gagal menghasilkan insight.");
        return;
      }

      const text = json.insight ?? "Gagal menghasilkan insight.";
      const generatedAt = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit",
      });

      localStorage.setItem(cacheKey, JSON.stringify({ text, generatedAt }));
      setInsight(text);
      setLastGenerated(generatedAt);
    } catch (err) {
      setInsight("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInsight = () => {
    localStorage.removeItem(cacheKey);
    setInsight("");
    setLastGenerated(null);
  };

  if (!isMounted) {
    return (
      <div className="h-24 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm" />
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── HEADER SECTION (Tanpa border bawah dan padding besar) ── */}
      <div className="flex items-center justify-between pb-4">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 leading-tight">
              Intisari — {SECTION_LABEL[section]}
            </h3>
            <span className="text-xs text-violet-500 font-medium">Powered by Gemini</span>
          </div>
        </div>

        {/* Action Buttons & Timestamp */}
        <div className="flex items-center gap-3">
          {lastGenerated && (
            <span className="text-xs text-gray-400">{today} · {lastGenerated}</span>
          )}

          {insight && (
            <button
              onClick={clearInsight}
              disabled={loading}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5 transition-colors disabled:opacity-50"
            >
              Hapus
            </button>
          )}
          
          <button
            onClick={generateInsight}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating...
              </>
            ) : (
              <>✨ {insight ? "Regenerate" : "Generate"}</>
            )}
          </button>
        </div>
      </div>

      {/* ── CONTENT SECTION ── */}
      <div>
        
        {/* Empty State */}
        {!insight && !loading && (
          <p className="text-gray-400 text-xs italic">
            Klik Generate untuk insight otomatis bagian ini.
          </p>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-2 mt-2">
            <div className="animate-pulse h-3 bg-indigo-100 rounded w-full" />
            <div className="animate-pulse h-3 bg-indigo-100 rounded w-5/6" />
            <div className="animate-pulse h-3 bg-indigo-100 rounded w-4/6" />
          </div>
        )}

        {/* Result Text */}
        {insight && !loading && (
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line mt-2">
            {insight}
          </p>
        )}
      </div>
    </div>
  );
}

export default IntisariAI;