export default async function handler(req, res) {
  const { panelId, from = 'now-7d', to = 'now', width = 800, height = 400 } = req.query
  const dashboardUid = 'oWJw2pPnz'

  const url = `${process.env.GRAFANA_BASE_URL}/render/d-solo/${dashboardUid}/berita-indonesia?orgId=3&panelId=${panelId}&from=${from}&to=${to}&width=${width}&height=${height}&theme=light`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: process.env.GRAFANA_TOKEN,
      },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Gagal fetch dari Grafana' })
    }

    const imageBuffer = await response.arrayBuffer()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.send(Buffer.from(imageBuffer))

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}