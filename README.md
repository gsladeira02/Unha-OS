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
- Fluxo de pagamento online temporariamente desativado para evitar erro no checkout

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

No campo `adminEmails`, coloque os e-mails que devem ter acesso ilimitado:

```js
adminEmails: ['gabriel.ladeira2003@gmail.com', 'gsousaladeira@icloud.com']
```

Quando uma conta for criada com um desses e-mails, o sistema libera automaticamente o plano Admin, sem vencimento e sem cobrança.

## Pagamento

O pagamento online foi temporariamente desativado porque o checkout estava dando erro. Por enquanto, a cliente escolhe o plano e a recorrência, e a liberação pode ser feita manualmente. Depois, o ideal é conectar o gateway via webhook para ativar a assinatura automaticamente.


## Pagamento InfinitePay

Esta versão usa o mesmo formato dos outros apps: ao criar conta ou clicar em pagamento, o sistema redireciona direto para:

```txt
https://loja.infinitepay.io/sistemasos
```

A cliente escolhe o pagamento na sua Loja Online da InfinitePay. Não usa API, token ou rota `/api/create-checkout`.

Se você criar links específicos na InfinitePay para cada plano/recorrência, cole em `src/config.js` dentro de `paymentLinks`.
