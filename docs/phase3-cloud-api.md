# Fase 3 — Canal oficial WhatsApp Cloud API (multi-tenant)

> Objetivo: adicionar o **WhatsApp Cloud API oficial da Meta** como canal,
> encaixando na abstração `WhatsappProvider` existente, e preparar o terreno
> multi-tenant (SaaS). Depois: Instagram Direct e Messenger pela mesma base.

## 1. Como a Cloud API encaixa na arquitetura atual

A Cloud API é **assimétrica** em relação aos provedores atuais (wwebjs/whaileys):

| Direção | wwebjs / whaileys | Cloud API |
|---------|-------------------|-----------|
| **Saída** (enviar) | métodos do provider | mesma interface → chamadas HTTP à Graph API |
| **Entrada** (receber) | listeners de sessão/QR | **webhook HTTP** (push da Meta) |
| **Conexão** | QR Code / sessão | credenciais (token + phone_number_id), sem QR |

➡️ **Saída**: implementar `CloudApiProvider` cumprindo a interface `WhatsappProvider`
(`sendMessage`, `sendMedia`, `checkNumber`, `getProfilePicUrl`, etc.) via Graph API.
➡️ **Entrada**: um **controller de webhook** novo (não passa pelo provider) que
converte o payload da Meta para os tipos já existentes (`MessagePayload`,
`ContactPayload`, `WhatsappContextPayload`, `MediaPayload`) e chama `handleMessage`.

## 2. Decisão de arquitetura: provider **por conexão**, não global

Hoje o provider é escolhido por env global (`WHATSAPP_PROVIDER`). Para SaaS, cada
tenant/conexão pode usar um provider diferente. Mudança necessária:

- Adicionar campo **`provider`** ao model de conexão (`wwebjs|whaileys|cloudapi`).
- `whatsappProvider.ts` passa a resolver o provider **a partir da conexão**, não do env.

## 3. Mudanças no modelo de dados

### 3.1 Multi-tenancy (fundação — ver §6)
- Novo model **`Company`** (tenant).
- `companyId` em **todas** as tabelas de domínio (Contact, Ticket, Message, Queue,
  User, Whatsapp/Channel…), com escopo aplicado em todas as queries.

### 3.2 Conexão / Canal (generalizar `Whatsapp` → conceito de `Channel`)
Novos campos (Cloud API), credenciais **criptografadas em repouso**:
- `provider` — wwebjs | whaileys | cloudapi
- `channel` — whatsapp | instagram | messenger (preparando multicanal)
- `cloudPhoneNumberId`, `cloudWabaId`
- `cloudAccessToken` (cifrado), `cloudAppSecret` (cifrado), `cloudVerifyToken`
- Migration Sequelize adicionando as colunas (nullable, retrocompatível).

### 3.3 Templates (HSM)
- Model **`MessageTemplate`** — mensagens ativas fora da janela de 24h exigem
  template aprovado pela Meta.

## 4. Componentes a construir

```
backend/src/
  libs/cloudApi/
    client.ts            # cliente Graph API (fetch nativo do Node 18+)
                         #   sendText, sendMedia, sendTemplate, getMediaUrl, downloadMedia
    types.ts             # tipos do payload do webhook da Meta
  providers/WhatsApp/Implementations/
    cloudapi.ts          # CloudApiProvider implements WhatsappProvider (saída)
  controllers/
    MetaWebhookController.ts   # GET (verificação) + POST (eventos)
  routes/
    metaWebhookRoutes.ts       # /webhooks/meta/whatsapp
  services/CloudApiServices/
    ProcessCloudApiWebhook.ts  # payload Meta -> handleMessage
```

### 4.1 Webhook de entrada (segurança)
- `GET /webhooks/meta/whatsapp` → responde `hub.challenge` se `hub.verify_token` confere.
- `POST /webhooks/meta/whatsapp` → **valida `X-Hub-Signature-256`** (HMAC-SHA256 com o
  App Secret) **antes** de processar. Resolve a conexão pelo `phone_number_id` do
  payload → daí o `companyId` (roteamento multi-tenant).
- Mapeia mensagens e *status updates* (sent/delivered/read → `MessageAck`).

### 4.2 Provider de saída (`cloudapi.ts`)
- `init(channel)`: sem QR; valida credenciais e marca `status = CONNECTED`.
- `sendMessage/sendMedia`: POST `/{phoneNumberId}/messages` (texto / mídia / template).
- `checkNumber`, `getProfilePicUrl`, `fetchChatMessages`: a Cloud API **não** oferece
  tudo que o wwebjs oferece — métodos sem equivalente retornam fallback documentado.

## 5. Pré-requisitos da Meta (fora do código — você fornece)
- Conta **Meta Business verificada** + **WABA** (WhatsApp Business Account).
- Número aprovado + **access token permanente** (System User).
- App no Meta for Developers com produto WhatsApp; **App Secret** e **Verify Token**.
- **App Review** para as permissões (`whatsapp_business_messaging`, etc.).
- Webhook precisa de **URL pública HTTPS** (em dev: túnel tipo ngrok/cloudflared).

## 6. Sequência recomendada de incrementos

O multi-tenant é fundação e "encosta" em tudo. Duas estratégias:

**Opção A — Fundação primeiro (mais limpo p/ SaaS):**
1. `3.0` Multi-tenancy: model `Company` + `companyId` em todos os models + auth/queries com escopo de tenant.
2. `3.1` Canal por conexão: campo `provider`/`channel` + colunas Cloud API (cifradas) + migration.
3. `3.2` Saída: `CloudApiProvider` + cliente Graph API.
4. `3.3` Entrada: webhook + validação de assinatura + mapeamento → `handleMessage`.
5. `3.4` Templates (HSM).
6. `3.5` (opcional) Embedded Signup — tenants conectam a própria WABA.

**Opção B — Prova da Cloud API primeiro (valida o integração externa mais difícil):**
- Fazer `3.1`→`3.4` em modo single-org, validar com a Meta, depois aplicar `3.0`
  (multi-tenancy) por cima. Risco: retrabalho ao adicionar `companyId` nas entidades novas.

> **Recomendação:** Opção A. Como o produto será SaaS, adicionar `companyId`
> depois de modelar canais/templates custa mais caro que fazer a fundação agora.
> Cada incremento é verificável por compilação; a verificação ponta-a-ponta com a
> Meta exige as credenciais do §5.

## 7. Verificação
- Por incremento: `tsc` (compila) + testes Jest dos services novos.
- Ponta-a-ponta (real): número de teste da Meta + túnel HTTPS para o webhook.
