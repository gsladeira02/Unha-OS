export const APP_CONFIG = {
  appName: 'UnhaOS',
  hubName: 'SistemasOS',
  infiniteTag: 'sistemasos',
  // Pagamento por link direto de cobrança/assinatura.
  // Para não cair na página de produtos da loja, cole aqui o LINK DIRETO de cada plano criado na InfinitePay.
  // Caminho na InfinitePay: Vendas > Planos e Recorrência > Criar assinatura/Novo plano > copiar link de inscrição.
  // Enquanto algum link estiver vazio, o app avisa em vez de mandar a cliente para a loja de produtos.
  paymentLinks: {
    individual: {
      monthly: '',      // Individual mensal - R$ 9,90
      quarterly: '',    // Individual trimestral - 3x R$ 8,90
      semester: '',     // Individual semestral - 6x R$ 7,90
      annual: ''        // Individual anual - 12x R$ 4,90
    },
    professional: {
      monthly: '',      // Profissional mensal - R$ 19,90
      quarterly: '',    // Profissional trimestral - 3x R$ 17,90
      semester: '',     // Profissional semestral - 6x R$ 14,90
      annual: ''        // Profissional anual - 12x R$ 9,90
    }
  },
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


export function paymentUrl(planId, recurrenceId) {
  const direct = APP_CONFIG.paymentLinks?.[planId]?.[recurrenceId]
  if (direct && String(direct).trim()) return String(direct).trim()
  return ''
}

export function missingPaymentLinkText(planId, recurrenceId) {
  const plan = APP_CONFIG.plans[planId]
  const recurrence = plan?.recurrences?.find((item) => item.id === recurrenceId)
  const planName = plan?.name || planId
  const recName = recurrence?.label || recurrenceId
  return `O link direto de pagamento do plano ${planName} ${recName} ainda não foi configurado. Cole o link da cobrança em src/config.js > paymentLinks.${planId}.${recurrenceId}.`
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
