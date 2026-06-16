export const APP_CONFIG = {
  appName: 'UnhaOS',
  hubName: 'SistemasOS',
  infiniteTag: 'sistemasos',
  gracePeriodDays: 3,
  supportWhatsApp: '',
  plans: {
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

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function checkoutUrl(planId, recurrenceId) {
  const params = new URLSearchParams({ plano: planId, recorrencia: recurrenceId, origem: APP_CONFIG.appName.toLowerCase() })
  return `https://checkout.infinitepay.io/${APP_CONFIG.infiniteTag}?${params.toString()}`
}
