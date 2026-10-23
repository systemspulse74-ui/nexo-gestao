import { identity, json, sameOrigin } from '../../lib/server';
import { bridge, bridgeConfigured } from '../../lib/whatsapp';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await identity();
  if (!user) return json({ error: 'Entre na sua conta.' }, 401);
  if (!bridgeConfigured()) return json({ state: 'unconfigured', configured: false });
  try { return json({ ...await bridge(user.owner, '/session'), configured: true }); }
  catch { return json({ state: 'unavailable', configured: true, error: 'Não foi possível acessar o servidor. Tente atualizar a conexão.' }); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem inválida.' }, 403);
  const user = await identity();
  if (!user) return json({ error: 'Entre na sua conta.' }, 401);
  try {
    const body = await request.json() as any;
    if (!['connect', 'disconnect'].includes(body.action)) return json({ error: 'Ação inválida.' }, 400);
    const result = await bridge(user.owner, '/session/' + body.action, 'POST', {});
    return json(result);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Não foi possível atualizar a conexão.' }, 503);
  }
}
