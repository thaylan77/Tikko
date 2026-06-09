# Provedores de WhatsApp

O backend abstrai a integração com o WhatsApp atrás de uma única interface
(`src/providers/WhatsApp/whatsappProvider.ts`) e permite trocar a implementação
por variável de ambiente. **As duas implementações são mantidas** — escolha a que
melhor se encaixa no seu ambiente.

## Como escolher

Defina no `.env` do backend:

```env
# Valores suportados: wwebjs | whaileys
WHATSAPP_PROVIDER=wwebjs
```

A seleção acontece em tempo de inicialização
(`providersMap[process.env.WHATSAPP_PROVIDER]`), com fallback para `wwebjs`.

## Trade-offs

| Critério | `wwebjs` (whatsapp-web.js) | `whaileys` (Baileys) |
|----------|---------------------------|----------------------|
| Tecnologia | Automatiza o WhatsApp Web real via **Chromium headless** (Puppeteer) | Fala o **protocolo multi-device** direto via WebSocket |
| Dependências de sistema | Precisa de Chromium + libs do Puppeteer | Não precisa de navegador |
| Consumo de recursos | Maior (um Chromium por sessão) | Menor / mais rápido |
| Estabilidade de comportamento | Próxima do cliente oficial | Boa, mas mais sujeita a quebras quando o protocolo muda |
| Risco de banimento | Existe (cliente não-oficial) | Existe, historicamente um pouco maior |

> Ambos são bibliotecas **não-oficiais** (engenharia reversa). Para uso crítico,
> avalie no futuro um provedor adicional usando a **WhatsApp Cloud API oficial**,
> implementando a mesma interface `WhatsappProvider`.

## Padrão do projeto

- **Default:** `wwebjs` (mantém o comportamento histórico do projeto).
- Use `whaileys` quando quiser um deploy **sem Chromium** / mais leve.
- Trocar de provedor é só mudar a env e reiniciar — a interface é a mesma.

## Adicionando um novo provedor

1. Implemente a interface `WhatsappProvider` em
   `src/providers/WhatsApp/Implementations/<seu-provedor>.ts`.
2. Registre no `providersMap` em `whatsappProvider.ts`.
3. Documente o novo valor aceito em `WHATSAPP_PROVIDER`.
