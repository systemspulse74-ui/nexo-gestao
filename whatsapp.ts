import { config, hash } from './server';

export function bridgeConfigured() {
  const c = config();
  return !!(c.WHATSAPP_BRIDGE_URL && c.WHATSAPP_BRIDGE_KEY);
}

export async function bridge(owner: string, path: string, method = 'GET', body?: unknown) {
  if (!bridgeConfigured()) throw new Error('Servidor de WhatsApp ainda não conectado.');
  const c = config();
  const base = new URL(c.WHATSAPP_BRIDGE_URL);
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Endereço do servidor inválido.');
  const response = await fetch(new URL(path, base.origin), {
    method,
    headers: {
      Authorization: 'Bearer ' + c.WHATSAPP_BRIDGE_KEY,
      'X-Nexo-Account': await hash(owner),
      'Content-Type': 'application/json',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000),
    redirect: 'error',
  });
  const result = await response.json() as any;
  if (!response.ok) throw Object.assign(new Error(typeof result.error === 'string' ? result.error : 'Servidor de WhatsApp indisponível.'), { status: response.status });
  return result;
}

export const jobLabels: Record<string, string> = {
  queued: 'Na fila', sending: 'Enviando', sent: 'Enviada ao WhatsApp',
  delivered: 'Entregue', read: 'Lida', failed: 'Falhou', unknown: 'Resultado incerto', cancelled: 'Cancelada',
};
