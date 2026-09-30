import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Prompt per bagian ────────────────────────────────────────────────────────
function buildPrompt(section, currentData, previousData) {
  const base = `Kamu adalah analis media monitoring profesional. Tulis insight dalam Bahasa Indonesia, maksimal 3 paragraf pendek, padat, dan informatif. Analisis fokus pada PERBANDINGAN TREN antara periode saat ini dengan periode sebelumnya. JANGAN gunakan format Markdown (tanda bintang, pagar, dsb). Tulis plain text saja.\n\n`;

  switch (section) {
    case "utama":
      return base + `
DATA PERIODE SAAT INI VS SEBELUMNYA:
- Total berita: ${currentData.totalBerita} (Sebelumnya: ${previousData?.totalBerita ?? "-"})
- Total kantor berita: ${currentData.totalKantor} (Sebelumnya: ${previousData?.totalKantor ?? "-"})
- Total organisasi unik: ${currentData.totalOrganisasi ?? "-"} (Sebelumnya: ${previousData?.totalOrganisasi ?? "-"})
- Total kata kunci unik: ${currentData.totalKataKunci ?? "-"} (Sebelumnya: ${previousData?.totalKataKunci ?? "-"})

Top 5 isu/kata kunci periode saat ini:
${currentData.topIsu?.map((k, i) => `${i+1}. "${k.name}" (${k.value} berita)`).join("\n")}

Tulis insight yang mencakup:
1. Analisis perbandingan volume pemberitaan (apakah ada lonjakan atau penurunan drastis)
2. Isu atau topik yang mendominasi pergerakan data saat ini
3. Kesimpulan lanskap media secara keseluruhan
`;

    case "isu":
      return base + `
DATA ANALISIS ISU & TOPIK (Saat Ini vs Sebelumnya):
Top 5 topik berita (Saat Ini):
${currentData.topTopik?.map((t, i) => `${i+1}. ${t.name} (${t.value} berita)`).join("\n")}

Top 10 kata kunci/isu dalam berita (Saat Ini):
${currentData.topIsu?.map((k, i) => `${i+1}. "${k.name}" (${k.value} berita)`).join("\n")}

Distribusi SDG yang terpengaruh (Saat ini):
${currentData.sdg?.slice(0, 5).map(s => `- ${s.name}: ${s.value} berita`).join("\n")}
Distribusi SDG yang terpengaruh (Sebelumnya):
${previousData?.sdg?.slice(0, 5).map(s => `- ${s.name}: ${s.value} berita`).join("\n")}

Tulis insight yang mencakup:
1. Pergeseran atau dominasi topik/isu saat ini dibandingkan periode sebelumnya
2. Keterkaitan tren isu dengan tujuan pembangunan berkelanjutan (SDG)
3. Tren kata kunci yang perlu diperhatikan
`;

    case "aktor":
      return base + `
DATA AKTOR & JARINGAN (Saat Ini vs Sebelumnya):
Top 5 tokoh (Saat Ini):
${currentData.topNama?.map((n, i) => `${i+1}. ${n.name} (${n.value} kali disebut)`).join("\n")}

Top 5 organisasi (Saat Ini):
${currentData.topOrganisasi?.map((o, i) => `${i+1}. ${o.name} (${o.value} kali disebut)`).join("\n")}

Top 5 lokasi (Saat Ini):
${currentData.topLokasi?.map((l, i) => `${i+1}. ${l.name} (${l.value} kali)`).join("\n")}

Tulis insight yang mencakup:
1. Tokoh atau figur publik yang paling mencuat dibanding sebelumnya
2. Pergerakan organisasi yang paling berpengaruh dalam pemberitaan
3. Wilayah atau lokasi yang menjadi pusat sorotan
`;

    case "sentimen":
      return base + `
DATA SENTIMEN & EMOSI:
Distribusi sentimen (Saat Ini):
${currentData.sentimen?.map(s => `- ${s.name}: ${s.value} berita`).join("\n")}
Distribusi sentimen (Sebelumnya):
${previousData?.sentimen?.map(s => `- ${s.name}: ${s.value} berita`).join("\n")}

Distribusi emosi non-netral (Saat Ini):
${currentData.emosi?.map(e => `- ${e.name}: ${e.value} berita`).join("\n")}

Top 5 kata kunci dengan sentimen positif/netral (Saat Ini):
${currentData.topPositif?.slice(0, 5).map((k, i) => `${i+1}. ${k.name} (${k.value} berita)`).join("\n")}
Top 5 kata kunci dengan sentimen negatif (Saat Ini):
${currentData.topNegatif?.slice(0, 5).map((k, i) => `${i+1}. ${k.name} (${k.value} berita)`).join("\n")}

Tulis insight yang mencakup:
1. Pergeseran tone atau nuansa pemberitaan (apakah sentimen negatif/positif meningkat)
2. Emosi yang paling dominan saat ini
3. Analisis pemicu sentimen negatif dan respons positif
`;

    case "media":
      return base + `
DATA SUMBER MEDIA:
Top 10 outlet berita (Saat Ini):
${currentData.topOutlet?.slice(0, 10).map((o, i) => `${i+1}. ${o.name} (${o.value} berita)`).join("\n")}

Perbandingan media lokal vs mainstream (Saat Ini):
${currentData.jenisMedia?.map(j => `- ${j.name}: ${j.value} berita`).join("\n")}
Perbandingan media lokal vs mainstream (Sebelumnya):
${previousData?.jenisMedia?.map(j => `- ${j.name}: ${j.value} berita`).join("\n")}

Tulis insight yang mencakup:
1. Pergerakan aktivitas outlet/media yang paling aktif memberitakan
2. Pergeseran rasio kontribusi antara media lokal vs media arus utama (mainstream)
3. Kesimpulan singkat mengenai lanskap sumber media
`;

    default:
      return base + `Tidak ada data yang dikirimkan untuk bagian ini.`;
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { currentData, previousData, section = "utama" } = req.body;

  if (!currentData) {
    return res.status(400).json({ error: "currentData required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const prompt = buildPrompt(section, currentData, previousData);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ insight: text });

  } catch (err) {
    console.error("Gemini Error:", err);
    if (err.message.includes("429") || err.message.includes("quota")) {
      return res.status(429).json({
        error: "Sistem sedang sibuk. Silakan tunggu 1 menit dan coba lagi.",
      });
    }
    return res.status(500).json({ error: "Gagal terhubung ke AI: " + err.message });
  }
}