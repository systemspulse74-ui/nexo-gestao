import Dashboard from './dashboard';
import { identity } from './lib/server';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Home(){if(!await identity())redirect('/login');return <Dashboard/>}
