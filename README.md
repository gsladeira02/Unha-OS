# UnhaOS · SistemasOS

Sistema mobile-first para manicure e pedicure.

## Ajustes desta versão

- Ao clicar em **Criar conta e pagar**, a cliente é enviada automaticamente para o pagamento.
- O checkout usa a API oficial da InfinitePay para criar o link de pagamento com a handle `sistemasos`.
- Foi criada a rota `/api/create-checkout` para gerar o link.
- Foi adicionada a tela `/pagamento-concluido` para retorno após o pagamento.
- Foi adicionado cadastro de **horários por profissional**.
- Cada horário pode ter profissional, local, dia da semana, início, fim e intervalo.
- A rota `/agendar/...` continua funcionando na Vercel com rewrite.

## Configuração da InfinitePay

A integração do checkout é feita via POST para:

`https://api.checkout.infinitepay.io/links`

Payload usa:

- `handle`: `sistemasos`
- `order_nsu`
- `redirect_url`
- `items` com preço em centavos

Se a InfinitePay exigir credencial na sua conta, configure na Vercel:

`INFINITEPAY_API_TOKEN`

em:

`Project Settings -> Environment Variables`

## Vercel

Framework: Vite

Install Command:

`npm install --no-audit --no-fund`

Build Command:

`npm run build`

Output Directory:

`dist`

## Observação

O banco Supabase ainda depende do SQL já enviado anteriormente. Esta versão mantém o funcionamento visual/local e prepara o fluxo para conectar com banco e webhook depois.
