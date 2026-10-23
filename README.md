# Nexo na Vercel

Versão Next.js independente de Cloudflare/Sites. Nenhum dado da instalação antiga foi copiado.

Configure as variáveis seguras na Vercel e publique novamente:
- APP_URL: origem HTTPS final do site
- TURSO_DATABASE_URL e TURSO_AUTH_TOKEN: banco remoto Turso/libSQL
- GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET: OAuth Google Web
- WHATSAPP_BRIDGE_URL e WHATSAPP_BRIDGE_KEY: serviço externo de WhatsApp

No Google, cadastre APP_URL/api/auth/google/callback como redirect URI. As tabelas são criadas automaticamente no banco. O acesso fica bloqueado até configurar banco e Google. Cabeçalhos de identidade do Sites nunca são aceitos nesta versão. Não coloque segredos no Git. A conexão WhatsApp continua em servidor persistente separado.
