# UnhaOS · SistemasOS

Sistema inicial para manicure e pedicure inspirado no BellaOS.

## Configurações incluídas

- Infinitetag: `sistemasos`
- Sem mensagens automáticas por enquanto
- Botão manual para WhatsApp nos agendamentos
- Locais de atendimento ilimitados nos dois planos
- Fotos limitadas como fotos totais na página pública
- Profissionais ilimitados no plano Profissional
- Regra de tolerância: acesso até 3 dias após vencimento

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

## Onde alterar preços e regras

Edite o arquivo:

```txt
src/config.js
```

Os links de checkout são gerados assim:

```txt
https://checkout.infinitepay.io/sistemasos?plano=individual&recorrencia=monthly&origem=unhaos
```

A ativação por pagamento real ainda precisa ser ligada ao retorno/webhook do gateway. O botão "Simular pago" existe apenas para teste do fluxo.
