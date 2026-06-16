import { APP_CONFIG, totalAmountCents, recurrenceDescription } from '../src/config.js'

const allowedPlans = ['individual', 'professional']
const allowedRecurrences = ['monthly', 'quarterly', 'semester', 'annual']

function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const { planId, recurrenceId, customer = {} } = body

    if (!allowedPlans.includes(planId) || !allowedRecurrences.includes(recurrenceId)) {
      return json(res, 400, { error: 'Plano ou recorrência inválidos.' })
    }

    const amount = totalAmountCents(planId, recurrenceId)
    const description = recurrenceDescription(planId, recurrenceId)
    if (!amount) return json(res, 400, { error: 'Valor inválido.' })

    const origin = req.headers.origin || `https://${req.headers.host}`
    const orderNsu = `unhaos-${planId}-${recurrenceId}-${Date.now()}`

    const payload = {
      handle: APP_CONFIG.infiniteTag,
      order_nsu: orderNsu,
      redirect_url: `${origin}/pagamento-concluido?order_nsu=${encodeURIComponent(orderNsu)}`,
      items: [
        {
          quantity: 1,
          price: amount,
          description
        }
      ]
    }

    const cleanCustomer = {
      name: String(customer.name || '').trim(),
      email: String(customer.email || '').trim(),
      phone_number: String(customer.phone || '').trim()
    }
    if (cleanCustomer.name || cleanCustomer.email || cleanCustomer.phone_number) {
      payload.customer = cleanCustomer
    }

    const headers = { 'Content-Type': 'application/json' }
    if (process.env.INFINITEPAY_API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.INFINITEPAY_API_TOKEN}`
    }

    const checkoutResponse = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const text = await checkoutResponse.text()
    let data = {}
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!checkoutResponse.ok || !data.url) {
      return json(res, 502, {
        error: 'A InfinitePay não retornou um link válido. Confira sua InfiniteTag e, se sua conta exigir, configure o token da API na Vercel.',
        details: data
      })
    }

    return json(res, 200, { url: data.url, order_nsu: orderNsu })
  } catch (error) {
    return json(res, 500, { error: error.message || 'Erro interno ao criar checkout.' })
  }
}
