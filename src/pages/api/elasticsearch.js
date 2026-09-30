export default async function handler(req, res) {
  const {
    type,
    from = "now-7d",
    to = "now",
    topik = "$__all",
    sentimen = "$__all",
    sdg = "$__all",
    lucene = "*",
  } = req.query;

  const DS_ID = 18;
  const GRAFANA_URL = "https://xplore.pustakadata.id";
  const TOKEN = process.env.GRAFANA_TOKEN;

  const mustFilters = [
    { exists: { field: "fulltext" } },
    { range: { created: { gte: from, lte: to } } },
  ];

  if (topik !== "$__all") {
    mustFilters.push({ term: { "topic.keyword": topik } });
  }
  if (sentimen !== "$__all") {
    mustFilters.push({ term: { "sentiment.keyword": sentimen } });
  }
  if (sdg !== "$__all") {
    mustFilters.push({ term: { "desc.keyword": sdg } });
  }
  if (lucene && lucene !== "*") {
    mustFilters.push({ query_string: { query: lucene } });
  }

  const baseQuery = (extraMust = [], mustNot = []) => ({
    bool: {
      must: [...mustFilters, ...extraMust],
      ...(mustNot.length ? { must_not: mustNot } : {}),
    },
  });

  const queries = {
    // Evolusi Kata Kunci / Isu
    evolusi: {
      size: 0,
      query: baseQuery(),
      aggs: {
        per_phrase: {
          terms: { field: "phrases.keyword", size: 10, order: { _count: "desc" } },
          aggs: {
            per_day: { date_histogram: { field: "created", calendar_interval: "1d" } },
          },
        },
      },
    },
    // Sentimen dalam Berita
    sentimen: {
      size: 0,
      query: baseQuery(),
      aggs: { sentimen: { terms: { field: "sentiment.keyword", size: 10 } } },
    },
    // Emosi non Netral dalam Berita
    emosi: {
      size: 0,
      query: baseQuery([], [{ term: { "emotion.keyword": "Neutral" } }]),
      aggs: { emosi: { terms: { field: "emotion.keyword", size: 10 } } },
    },
    // Top 5 Topik Berita, Nama, Organisasi
    topik: {
      size: 0,
      query: baseQuery(),
      aggs: { topik: { terms: { field: "topic.keyword", size: 12, order: { _count: "desc" } } } },
    },
    nama: {
      size: 0,
      query: baseQuery(),
      aggs: { nama: { terms: { field: "ners.person.keyword", size: 5, order: { _count: "desc" } } } },
    },
    organisasi: {
      size: 0,
      query: baseQuery(),
      aggs: { organisasi: { terms: { field: "ners.organization.keyword", size: 5, order: { _count: "desc" } } } },
    },
    // Jumlah Berita & Sumber
    stat: {
      size: 0,
      track_total_hits: true,
      query: baseQuery(),
      aggs: { 
        kantor_berita: { cardinality: { field: "site.keyword" } },
        total_organisasi: { cardinality: { field: "ners.organization.keyword"}},
        kata_kunci_unik: { cardinality: { field: "phrases.keyword" }}
      },
    },
    // Kata Kunci dalam Berita
    tabel_kunci: {
      size: 0,
      query: baseQuery(),
      aggs: {
        per_phrase: {
          terms: { field: "phrases.keyword", size: 30, order: { _count: "desc" } },
          aggs: {
            judul: { terms: { field: "title.keyword", size: 1 } },
            sentiment: { terms: { field: "sentiment.keyword", size: 1 } },
            link: { terms: { field: "link.keyword", size: 1 } },
          },
        },
      },
    },
    // Sentimen Positif, Negatif, dan Netral
    sentimen_positif: {
      size: 0,
      query: baseQuery([], [{ term: { "sentiment.keyword": "negatif" } }]),
      aggs: { per_phrase: { terms: { field: "phrases.keyword", size: 20, order: { _count: "desc" } } } },
    },
    sentimen_negatif: {
      size: 0,
      query: baseQuery([{ term: { "sentiment.keyword": "negatif" } }]),
      aggs: { per_phrase: { terms: { field: "phrases.keyword", size: 20, order: { _count: "desc" } } } },
    },
    // Berita dalam Peta
    peta: {
      size: 0,
      query: baseQuery(),
      aggs: {
        peta: {
          geohash_grid: { field: "geo", precision: 4 },
          aggs: {
            judul: { terms: { field: "title.keyword", size: 1 } },
            link: { terms: { field: "link.keyword", size: 1 } },
          },
        },
      },
    },
    // Kata Kunci atau Isu dalam Berita
    wordcloud: {
      size: 0,
      query: baseQuery(),
      aggs: {
        wordcloud: {
          terms: { field: "phrases.keyword", size: 50, min_doc_count: 2, order: { _count: "desc" } },
        },
      },
    },
    // Network Organisasi dan Orang
    network: {
      size: 0,
      query: baseQuery(),
      aggs: {
        person: {
          terms: { field: "ners.person.keyword", size: 8, order: { _count: "desc" } },
          aggs: {
            orgs: { terms: { field: "ners.organization.keyword", size: 3 } },
          },
        },
      },
    },
    // Nama dan Berita
    nama_berita: {
      size: 0,
      query: baseQuery(),
      aggs: {
        per_person: {
          terms: { field: "ners.person.keyword", size: 20, order: { _count: "desc" } },
          aggs: {
            judul: { terms: { field: "title.keyword", size: 1 } },
            topik: { terms: { field: "topic.keyword", size: 1 } },
            sentiment: { terms: { field: "sentiment.keyword", size: 1 } },
            link: { terms: { field: "link.keyword", size: 1 } },
          },
        },
      },
    },
    // Top 5 Organisasi Berpengaruh dalam Berita
    organisasi_berpengaruh: {
      size: 0,
      query: baseQuery(),
      aggs: {
        organisasi_berpengaruh: {
          terms: { field: "ners.organization.keyword", size: 5, order: { _count: "desc" } },
        },
      },
    },
    // Top 10 Lokasi Berpengaruh dalam Berita
    lokasi: {
      size: 0,
      query: baseQuery(),
      aggs: {
        lokasi: {
          terms: { field: "ners.location.keyword", size: 10, order: { _count: "desc" } },
        },
      },
    },
    // Flow Nama, Organisasi, dan Lokasi
    flow: {
      size: 0,
      query: baseQuery(),
      aggs: {
        person: {
          terms: { field: "ners.person.keyword", size: 5, order: { _count: "desc" } },
          aggs: {
            org: {
              terms: { field: "ners.organization.keyword", size: 2, order: { _count: "desc" } },
              aggs: {
                loc: {
                  terms: { field: "ners.location.keyword", size: 2, order: { _count: "desc" }, missing: " " },
                },
              },
            },
          },
        },
      },
    },
    // Topik
    topik_full: {
      size: 0,
      query: baseQuery(),
      aggs: {
        topik_full: {
          terms: { field: "topic.keyword", size: 30, order: { _count: "desc" } },
        },
      },
    },
    // Pengaruh dalam SDG (Sustainable Development Goals)
    sdg: {
      size: 0,
      query: baseQuery(),
      aggs: {
        sdg: {
          terms: { field: "desc.keyword", size: 10, order: { _count: "desc" } },
        },
      },
    },
    // Perbedaan Media Lokal dan Mainstream
    media_lokal_mainstream: {
      size: 0,
      query: baseQuery(),
      aggs: {
        jenis: {
          terms: { field: "jenis.keyword", size: 2, order: { _count: "desc" } },
          aggs: {
            person: {
              terms: { field: "ners.person.keyword", size: 6, order: { _count: "desc" } },
            },
          },
        },
      },
    },
    // Keyword
    keyword_wordcloud: {
      size: 0,
      query: baseQuery(),
      aggs: {
        keyword_wordcloud: {
          terms: {
            field: "keywords.keyword",
            size: 50,
            min_doc_count: 4,
            order: { _count: "desc" },
          },
        },
      },
    },
    // Pie News — Banyaknya Artikel per Outlet
    pie_news: {
      size: 0,
      query: baseQuery(),
      aggs: {
        pie_news: {
          terms: {
            field: "site.keyword",
            size: 20,
            order: { _count: "desc" },
          },
        },
      },
    },
    sdg_list: {
      size: 0,
      query: { match_all: {} },
      aggs: {
        sdg_list: {
          terms: { field: "desc.keyword", size: 20, order: { _key: "asc" } },
        },
      },
    },
    topik_list: {
      size: 0,
      query: { match_all: {} },
      aggs: {
        topik_list: {
          terms: { field: "topic.keyword", size: 50, order: { _key: "asc" } },
        },
      },
    },
    berita_perhari: {
      size: 0,
      query: baseQuery(),
      aggs: {
        per_day: {
          date_histogram: {
            field: "created",
            calendar_interval: "1d",
            min_doc_count: 0,
          },
        },
      },
    },
    sentimen_perhari: {
      size: 0,
      query: baseQuery(),
      aggs: {
        per_sentiment: {
          terms: { field: "sentiment.keyword", size: 10 },
          aggs: {
            per_day: {
              date_histogram: {
                field: "created",
                calendar_interval: "1d",
                min_doc_count: 0,
              },
            },
          },
        },
      },
    },
    emosi_perhari: {
      size: 0,
      query: baseQuery([], [{ term: { "emotion.keyword": "Neutral" } }]),
      aggs: {
        per_emosi: {
          terms: { field: "emotion.keyword", size: 10 },
          aggs: {
            per_day: {
              date_histogram: {
                field: "created",
                calendar_interval: "1d",
                min_doc_count: 0,
              },
            },
          },
        },
      },
    },
  };

  const body = queries[type];
  if (!body) return res.status(400).json({ error: `Unknown type: ${type}` });

  try {
    const url = `${GRAFANA_URL}/api/datasources/proxy/${DS_ID}/_msearch`;
    const msearchBody =
      JSON.stringify({ index: "news_currentmonth" }) + "\n" +
      JSON.stringify(body) + "\n";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-ndjson",
        Authorization: TOKEN,
      },
      body: msearchBody,
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const result = data.responses?.[0] ?? data;
    res.setHeader("Cache-Control", "no-store"); 
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}