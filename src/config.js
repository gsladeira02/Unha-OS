export const APP_CONFIG = {
  appName: 'UnhaOS',
  hubName: 'SistemasOS',
  infiniteTag: 'sistemasos',
  gracePeriodDays: 3,
  supportWhatsApp: '',
  adminEmails: ['gabriel.ladeira2003@gmail.com', 'gsousaladeira@icloud.com'],
  adminPlanId: 'admin',
  supabase: {
    url: 'https://ntptobetmqvqmolijpij.supabase.co',
    restUrl: 'https://ntptobetmqvqmolijpij.supabase.co/rest/v1/',
    publishableKey: 'sb_publishable_A-fFN4hlpcWJwsT51BPjXw_AOezFQuV'
  },
  plans: {
    admin: {
      id: 'admin',
      name: 'Admin',
      audience: 'Acesso interno SistemasOS sem cobrança e sem vencimento.',
      monthlyPrice: 0,
      limits: {
        locations: 'Ilimitados',
        professionals: 'Ilimitados',
        publicPhotos: 'Ilimitadas'
      },
      features: [
        'Acesso ilimitado',
        'Sem vencimento',
        'Profissionais ilimitados',
        'Locais de atendimento ilimitados',
        'Fotos ilimitadas na página pública',
        'Liberação interna para administração'
      ],
      recurrences: [
        { id: 'lifetime', label: 'Ilimitado', installments: 1, installmentPrice: 0, accessMonths: 1200 }
      ],
      hidden: true
    },
    individual: {
      id: 'individual',
      name: 'Individual',
      audience: 'Para manicure ou pedicure que trabalha sozinha.',
      monthlyPrice: 9.90,
      limits: {
        locations: 'Ilimitados',
        professionals: 1,
        publicPhotos: 3
      },
      features: [
        '1 profissional',
        'Locais de atendimento ilimitados',
        'Agenda e cadastro de clientes',
        'Cadastro de serviços',
        'Link de agendamento',
        'Página pública com até 3 fotos totais',
        'Financeiro básico',
        'Botão manual para WhatsApp'
      ],
      recurrences: [
        { id: 'monthly', label: 'Mensal', installments: 1, installmentPrice: 9.90, accessMonths: 1 },
        { id: 'quarterly', label: 'Trimestral', installments: 3, installmentPrice: 8.90, accessMonths: 3 },
        { id: 'semester', label: 'Semestral', installments: 6, installmentPrice: 7.90, accessMonths: 6 },
        { id: 'annual', label: 'Anual', installments: 12, installmentPrice: 4.90, accessMonths: 12 }
      ]
    },
    professional: {
      id: 'professional',
      name: 'Profissional',
      audience: 'Para studio, esmalteria ou equipe com várias profissionais.',
      monthlyPrice: 19.90,
      limits: {
        locations: 'Ilimitados',
        professionals: 'Ilimitados',
        publicPhotos: 5
      },
      features: [
        'Profissionais ilimitados',
        'Locais de atendimento ilimitados',
        'Agenda por profissional',
        'Serviços e horários por profissional',
        'Comissão por profissional',
        'Relatórios simples',
        'Página pública com até 5 fotos totais',
        'Botão manual para WhatsApp'
      ],
      recurrences: [
        { id: 'monthly', label: 'Mensal', installments: 1, installmentPrice: 19.90, accessMonths: 1 },
        { id: 'quarterly', label: 'Trimestral', installments: 3, installmentPrice: 17.90, accessMonths: 3 },
        { id: 'semester', label: 'Semestral', installments: 6, installmentPrice: 14.90, accessMonths: 6 },
        { id: 'annual', label: 'Anual', installments: 12, installmentPrice: 9.90, accessMonths: 12 }
      ]
    }
  }
}


export function checkoutPayload({ planId, recurrenceId, customer = {}, studioName = '' }) {
  const plan = APP_CONFIG.plans[planId] || APP_CONFIG.plans.individual
  const recurrence = plan.recurrences.find((item) => item.id === recurrenceId) || plan.recurrences[0]
  const amountCents = Math.round(recurrence.installments * recurrence.installmentPrice * 100)
  const orderNsu = `unhaos-${plan.id}-${recurrence.id}-${Date.now()}`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return {
    handle: APP_CONFIG.infiniteTag,
    order_nsu: orderNsu,
    redirect_url: origin ? `${origin}/pagamento-concluido` : undefined,
    itens: [
      {
        quantity: 1,
        price: amountCents,
        description: recurrenceDescription(plan.id, recurrence.id)
      }
    ],
    customer: {
      name: customer.name || '',
      email: customer.email || '',
      phone_number: customer.phone ? String(customer.phone) : undefined
    },
    metadata: {
      app: 'UnhaOS',
      studio_name: studioName || '',
      plan_id: plan.id,
      plan_name: plan.name,
      recurrence_id: recurrence.id,
      recurrence_label: recurrence.label,
      access_months: recurrence.accessMonths,
      installments: recurrence.installments,
      installment_cents: Math.round(recurrence.installmentPrice * 100),
      amount_cents: amountCents,
      grace_days: APP_CONFIG.gracePeriodDays
    },
    plan: {
      id: plan.id,
      name: `UnhaOS ${plan.name} - ${recurrence.label}`,
      price: amountCents,
      display: `${recurrence.installments}x de ${formatBRL(recurrence.installmentPrice)}`,
      recurrence: true,
      cycle_months: recurrence.accessMonths,
      installments: recurrence.installments
    }
  }
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function totalAmountCents(planId, recurrenceId) {
  const plan = APP_CONFIG.plans[planId]
  const recurrence = plan?.recurrences?.find((item) => item.id === recurrenceId)
  if (!plan || !recurrence) return 0
  return Math.round(recurrence.installments * recurrence.installmentPrice * 100)
}

export function recurrenceDescription(planId, recurrenceId) {
  const plan = APP_CONFIG.plans[planId]
  const recurrence = plan?.recurrences?.find((item) => item.id === recurrenceId)
  if (!plan || !recurrence) return 'Assinatura UnhaOS'
  return `UnhaOS ${plan.name} ${recurrence.label} - ${recurrence.installments}x de ${formatBRL(recurrence.installmentPrice)}`
}
