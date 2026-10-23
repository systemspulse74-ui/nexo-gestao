import { createClient, type Client, type InValue } from '@libsql/client';
let client:Client|undefined;
let initialized:Promise<unknown>|undefined;
const schema=["CREATE TABLE IF NOT EXISTS `clients` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`owner` text NOT NULL,\n\t`name` text NOT NULL,\n\t`email` text NOT NULL,\n\t`phone` text NOT NULL,\n\t`company` text NOT NULL,\n\t`status` text NOT NULL,\n\t`consent` integer NOT NULL,\n\t`created` text NOT NULL\n);","CREATE TABLE IF NOT EXISTS `messages` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`owner` text NOT NULL,\n\t`client_id` text NOT NULL,\n\t`name` text NOT NULL,\n\t`phone` text NOT NULL,\n\t`status` text NOT NULL,\n\t`detail` text NOT NULL,\n\t`created` text NOT NULL\n);","CREATE TABLE IF NOT EXISTS `oauth_states` (\n\t`token` text PRIMARY KEY NOT NULL,\n\t`owner` text NOT NULL,\n\t`verifier` text NOT NULL,\n\t`expires` integer NOT NULL\n);","CREATE TABLE IF NOT EXISTS `sessions` (\n\t`token` text PRIMARY KEY NOT NULL,\n\t`owner` text NOT NULL,\n\t`subject` text NOT NULL,\n\t`email` text NOT NULL,\n\t`name` text NOT NULL,\n\t`expires` integer NOT NULL\n);","CREATE TABLE IF NOT EXISTS `settings` (\n\t`owner` text PRIMARY KEY NOT NULL,\n\t`business` text NOT NULL,\n\t`message` text NOT NULL,\n\t`template` text NOT NULL,\n\t`language` text NOT NULL,\n\t`automated` integer NOT NULL\n);","CREATE TABLE IF NOT EXISTS `transactions` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`owner` text NOT NULL,\n\t`description` text NOT NULL,\n\t`amount` integer NOT NULL,\n\t`type` text NOT NULL,\n\t`category` text NOT NULL,\n\t`date` text NOT NULL,\n\t`client_id` text\n);"];
export function databaseConfigured(){return !!(process.env.TURSO_DATABASE_URL&&process.env.TURSO_AUTH_TOKEN);}
function getClient(){
 if(!databaseConfigured())throw new Error('Banco de dados ainda não configurado.');
 if(!client){const url=process.env.TURSO_DATABASE_URL!;if(!/^(libsql|https):\/\//.test(url))throw new Error('Use um banco remoto persistente.');client=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN});}
 return client;
}
export function database(){return {prepare(sql:string){
 const statement=(args:InValue[]=[])=>{
  async function execute(){const c=getClient();if(!initialized)initialized=c.batch(schema,'write').catch(error=>{initialized=undefined;throw error;});await initialized;return c.execute({sql,args});}
  return {bind(...values:InValue[]){return statement(values);},async all(){return {results:(await execute()).rows as Record<string,any>[]};},async first(){return (await execute()).rows[0] as Record<string,any>||null;},async run(){return execute();}};
 };return statement();
}};}
