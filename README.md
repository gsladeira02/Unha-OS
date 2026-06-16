# UnhaOS · SistemasOS

Sistema inicial para manicure e pedicure inspirado no BellaOS.

## Configurações incluídas

- Supabase configurado:
  - URL: `https://ntptobetmqvqmolijpij.supabase.co`
  - REST: `https://ntptobetmqvqmolijpij.supabase.co/rest/v1/`
  - Publishable key configurada no projeto
- Sem teste grátis
- Sem mensagens automáticas por enquanto
- Botão manual para WhatsApp nos agendamentos
- Locais de atendimento ilimitados nos dois planos
- Fotos limitadas como fotos totais na página pública
- Profissionais ilimitados no plano Profissional
- Regra de tolerância: acesso até 3 dias após vencimento
- Tela de planos com seleção de plano + recorrência
- Conta admin com acesso ilimitado para os e-mails configurados em `src/config.js`
- Pagamento configurado para links diretos por plano/recorrência, sem cair na página de produtos

## Planos configurados

### Individual
- Mensal: R$ 9,90
- Trimestral: 3x de R$ 8,90
- Semestral: 6x de R$ 7,90
- Anual: 12x de R$ 4,90
- 1 profissional
- Locais ilimitados
- 3 fotos totais na página pública

### Profissional
- Mensal: R$ 19,90
- Trimestral: 3x de R$ 17,90
- Semestral: 6x de R$ 14,90
- Anual: 12x de R$ 9,90
- Profissionais ilimitados
- Locais ilimitados
- 5 fotos totais na página pública


## Pagamento InfinitePay

Esta versão segue o padrão usado nos outros apps: o app gera um checkout diretamente pela API da InfinitePay usando a InfiniteTag `sistemasos`.

Não precisa cadastrar manualmente 8 links de planos. Ao criar conta ou clicar em pagamento, o sistema envia o plano escolhido para:

```txt
/api/infinitepay-checkout
```

A API interna chama a InfinitePay e devolve o link direto de pagamento.

## Como rodar

```bash
npm install
npm run dev
```

## Como subir na Vercel

1. Suba a pasta no GitHub.
2. Importe o repositório na Vercel.
3. Framework: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.

## Variáveis na Vercel

O projeto já tem fallback no código, mas o ideal é cadastrar estas variáveis na Vercel:

```env
VITE_SUPABASE_URL=https://ntptobetmqvqmolijpij.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A-fFN4hlpcWJwsT51BPjXw_AOezFQuV
```

## Onde alterar preços, admin e regras

Edite o arquivo:

```txt
src/config.js
```

No campo `adminEmails`, coloque os e-mails que devem ter acesso ilimitado.
