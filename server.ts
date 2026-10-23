import {cookies} from 'next/headers';
import {database,databaseConfigured} from './database';
export const config=()=>process.env as Record<string,string>;
export const db=database;
export function authConfigured(){return databaseConfigured()&&!!(config().GOOGLE_CLIENT_ID&&config().GOOGLE_CLIENT_SECRET&&config().APP_URL);}
export async function hash(v:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(v=>v.toString(16).padStart(2,'0')).join('')}
export async function identity(){if(!authConfigured())return null;const token=(await cookies()).get('nexo_session')?.value;if(!token)return null;const row=await db().prepare('SELECT * FROM sessions WHERE token=? AND expires>?').bind(await hash(token),Date.now()).first();return row?{owner:String(row.owner),email:String(row.email),name:String(row.name),provider:'Google'}:null;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export function sameOrigin(r:Request){return !!config().APP_URL&&r.headers.get('origin')===new URL(config().APP_URL).origin;}
export const defaults={business:'Meu negócio',message:'Olá, {{nome}}! Seja bem-vindo(a) à {{empresa}}. É um prazer ter você por aqui! Como podemos ajudar?',template:'',language:'pt_BR',automated:0};
