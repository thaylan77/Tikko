# Tikko

**Tikko** é um sistema de atendimento (multiatendimento) baseado em mensagens de
WhatsApp: cada nova conversa vira um **ticket**, vários atendentes compartilham o
mesmo número, e tudo fica organizado em filas com histórico, em tempo real.

> Fork modernizado do [Whaticket Community](https://github.com/canove/whaticket-community) (MIT).
> Stack atualizada, segurança reforçada e migração para versões atuais de Node, React e Sequelize.

---

## ✨ Funcionalidades

- 🧑‍🤝‍🧑 Múltiplos atendentes no mesmo número de WhatsApp
- 📱 Várias conexões de WhatsApp recebendo num só lugar
- 🎫 Tickets automáticos por contato, com filas e status (aberto/pendente/resolvido)
- 💬 Enviar e receber mensagens e mídia (imagem, áudio, vídeo, documento)
- 🔔 Atualizações em tempo real via WebSocket
- 🌙 Tema claro/escuro
- 👥 Gestão de contatos, usuários e filas

## 🧩 Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Node.js ≥ 18, TypeScript, Express, Sequelize 6 (`sequelize-typescript` 2), MySQL, Redis (ioredis), Socket.io 4, JWT |
| **Frontend** | React 18, Material UI (MUI) 5 + Emotion, Vite, Socket.io-client 4 |
| **WhatsApp** | [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) (`wwebjs`) ou [Baileys](https://github.com/WhiskeySockets/Baileys) (`whaileys`) |
| **Testes / CI** | Jest, GitHub Actions (lint + `npm audit` + testes com MySQL) |

### Provedores de WhatsApp

O backend abstrai a integração atrás de uma interface única e permite escolher a
implementação por variável de ambiente (`WHATSAPP_PROVIDER=wwebjs|whaileys`).
Veja os trade-offs em [`docs/whatsapp-providers.md`](docs/whatsapp-providers.md).

> ⚠️ Ambos são clientes **não-oficiais** do WhatsApp. Não há garantia contra
> bloqueio do número — use por sua conta e risco.

## ⚙️ Como funciona

A cada nova mensagem recebida, um **ticket** é criado e cai na fila da página de
Tickets, onde o atendente pode **aceitar**, responder e **resolver**. Mensagens
seguintes do mesmo contato são vinculadas ao ticket **aberto/pendente** existente.

---

## 🚀 Instalação (desenvolvimento)

### Pré-requisitos
- Node.js **18+**
- MySQL 8 (ou MariaDB) e Redis
- Para o provedor `wwebjs`: dependências do Puppeteer/Chromium

### 1. Banco de dados (via Docker)

```bash
docker run --name tikko-db \
  -e MYSQL_ROOT_PASSWORD=strongpassword \
  -e MYSQL_DATABASE=whaticket \
  --restart always -p 3306:3306 -d \
  mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_bin
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # edite as variáveis (veja abaixo)
npm install
npm run build
npm run db:migrate            # cria as tabelas
npm run db:seed               # dados iniciais (usuário admin)
npm run dev                   # ou: npm start (produção, após build)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # ajuste VITE_BACKEND_URL
npm install
npm run dev                   # http://localhost:3000
```

**Login padrão:** `admin@whaticket.com` / `admin` — **troque imediatamente** após o primeiro acesso.

---

## 🔐 Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|----------|-----------|
| `WHATSAPP_PROVIDER` | `wwebjs` (padrão) ou `whaileys` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | Conexão MySQL |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | **Obrigatórios.** Gere com `openssl rand -base64 32` |
| `BACKEND_URL` / `FRONTEND_URL` | URLs (CORS e links) |
| `IO_REDIS_SERVER` / `IO_REDIS_PORT` / `IO_REDIS_PASSWORD` | Conexão Redis |
| `CHROME_BIN` / `CHROME_ARGS` | Configuração do Chromium (provedor `wwebjs`) |

> 🛡️ A aplicação **falha na inicialização** se `JWT_SECRET`/`JWT_REFRESH_SECRET`
> não estiverem definidos — isso é intencional, para nunca assinar tokens com um
> segredo padrão conhecido.

### Frontend (`frontend/.env`)

| Variável | Descrição |
|----------|-----------|
| `VITE_BACKEND_URL` | URL do backend (ex.: `http://localhost:8080/`) |
| `VITE_HOURS_CLOSE_TICKETS_AUTO` | Horas para fechar tickets automaticamente |

---

## 🧪 Testes

```bash
cd backend
npm test     # requer MySQL acessível; roda migrate + seed + Jest
```

No GitHub Actions, o workflow `test-backend` sobe um MySQL e executa a suíte
automaticamente em cada PR/push.

---

## 🙏 Créditos

Tikko é um fork do **[Whaticket Community](https://github.com/canove/whaticket-community)**,
criado originalmente por **Cássio Santos** e mantido pela comunidade. Obrigado a
todos os contribuidores do projeto original.

Não afiliado ao WhatsApp/Meta. "WhatsApp" é marca registrada de seus respectivos donos.

## 📄 Licença

[MIT](LICENSE).
