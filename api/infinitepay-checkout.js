export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  try {
    const body = req.body || {}
    const handle = String(body.handle || '').replace(/^\$/, '').trim()
    const orderNsu = String(body.order_nsu || `unhaos-${Date.now()}`)

    // A InfinitePay exige o parâmetro em inglês: items.
    // Mantemos leitura de itens também para compatibilidade com versões antigas do app.
    const rawItems = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.itens)
        ? body.itens
        : []

    const items = rawItems.map((item) => ({
      quantity: Number(item.quantity || item.quantidade || 1),
      price: Number(item.price || item.preco || 0),
      description: String(item.description || item.descricao || body.plan?.name || 'Assinatura UnhaOS')
    })).filter((item) => item.quantity > 0 && item.price > 0 && item.description)

    if (!handle) return res.status(400).json({ error: 'InfiniteTag não configurada.' })
    if (!items.length) return res.status(400).json({ error: 'Nenhum item válido informado para pagamento.' })

    const payload = {
      handle,
      order_nsu: orderNsu,
      items
    }

    if (body.redirect_url) payload.redirect_url = String(body.redirect_url)
    if (body.webhook_url) payload.webhook_url = String(body.webhook_url)

    const response = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let result
    try { result = JSON.parse(text) } catch { result = { raw: text } }

    const url = result?.url || result?.link || result?.checkout_url || result?.payment_url || result?.data?.url || result?.data?.link || ''

    if (!response.ok) {
      return res.status(response.status).json({
        error: result?.error || result?.message || result?.raw || 'A InfinitePay recusou a criação do checkout.',
        details: result,
        sent: payload
      })
    }

    if (!url) {
      return res.status(502).json({
        error: 'A InfinitePay não retornou um link válido.',
        details: result,
        sent: payload
      })
    }

    return res.status(200).json({ url, order_nsu: orderNsu })
  } catch (error) {
    console.error('InfinitePay checkout error:', error)
    return res.status(500).json({ error: error.message || 'Erro ao gerar checkout.' })
  }
}
