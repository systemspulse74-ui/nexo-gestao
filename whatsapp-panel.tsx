'use client';
import { useEffect, useState } from 'react';
import WhatsAppInbox from './whatsapp-inbox';
import { MessageCircle, QrCode, RefreshCw, Unplug, Check, Send, Smartphone, Server } from 'lucide-react';

const names: Record<string,string> = {
  unconfigured:'Servidor ainda não conectado', unavailable:'Servidor indisponível', disconnected:'WhatsApp desconectado',
  connecting:'Preparando conexão…', authenticated:'Finalizando conexão…', qr:'Escaneie o QR code', connected:'WhatsApp conectado',
};

export default function WhatsAppPanel({settings,setSettings,save,busy,messages,refresh}:any) {
  const [connection,setConnection]=useState<any>({state:'loading'});
  const [working,setWorking]=useState(false);
  const [notice,setNotice]=useState('');
  const [confirmDisconnect,setConfirmDisconnect]=useState(false);
  async function status() {
    try {
      const r=await fetch('/api/whatsapp');
      if(!r.ok) throw Error('Não foi possível consultar a conexão.');
      setConnection(await r.json());
    } catch { setConnection({state:'unavailable',configured:true}); }
  }
  useEffect(()=>{let mounted=true;async function poll(){try{const r=await fetch('/api/whatsapp');if(r.ok&&mounted)setConnection(await r.json());}catch{if(mounted)setConnection({state:'unavailable',configured:true});}}poll();const timer=setInterval(poll,5000);return()=>{mounted=false;clearInterval(timer)}},[]);
  async function action(kind:string) {
    setWorking(true);setNotice('');
    try {
      const r=await fetch('/api/whatsapp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:kind})});
      const result:any=await r.json();
      if(!r.ok)throw Error(result.error||'Não foi possível atualizar.');
      setConnection({...result,configured:true});
      if(result.error)setNotice(result.error);
      setConfirmDisconnect(false);
    }catch(e:any){setNotice(e.message)}finally{setWorking(false)}
  }
  return <>
    {connection.state==='connected'&&<WhatsAppInbox/>}
    <div className="integration-banner"><span className="stat-icon green"><MessageCircle size={23}/></span><div><strong>Seu WhatsApp, conectado ao seu negócio</strong><p>Conecte pelo QR code e envie a mensagem de boas-vindas ao cadastrar um cliente.</p></div><span className="tag">Conexão por QR code</span></div>
    <div className="qr-layout"><section className="card"><div className="card-heading"><div><h2>Conectar WhatsApp</h2><p>Use o WhatsApp do seu celular</p></div><QrCode size={22}/></div><div className="qr-content">
      <span className={'connection-state '+(connection.state==='connected'?'online':'')}>{names[connection.state]||'Consultando conexão…'}</span>
      {connection.state==='unconfigured'?<div className="qr-placeholder"><Server size={40}/><h3>Aguardando ativação do servidor</h3><p>A tela está preparada. Assim que a hospedagem estiver conectada, você poderá gerar seu QR code aqui.</p><span className="tag">Nenhum número conectado</span></div>:connection.state==='connected'?<div className="qr-placeholder connected"><Check size={44}/><h3>Pronto para começar as conversas</h3><p>{connection.phone?'Número conectado: +'+connection.phone:'Sua sessão está ativa.'}</p><small>{connection.queued||0} mensagem(ns) aguardando envio.</small></div>:connection.qr?<div className="qr-code"><img width={260} height={260} src={connection.qr} alt="QR code para conectar seu WhatsApp"/><p>O código é atualizado automaticamente. Escaneie pelo WhatsApp do seu celular.</p></div>:<div className="qr-placeholder"><QrCode size={48}/><h3>{['connecting','authenticated','qr'].includes(connection.state)?'Aguardando o WhatsApp…':'Conecte seu número'}</h3><p>{connection.state==='unavailable'?'O servidor não respondeu. Atualize para tentar novamente.':connection.state==='qr'?'O código expirou. Aguardando um novo QR code.':'Clique em gerar QR code e siga as instruções abaixo.'}</p></div>}
      {notice&&<div className="notice" role="status">{notice}</div>}{connection.error&&<div className="notice">{connection.error}</div>}
      {connection.configured&&<div className="qr-actions"><button className="button" disabled={working} onClick={status}><RefreshCw size={15}/>Atualizar</button>{['disconnected','unavailable'].includes(connection.state)&&<button className="button primary" disabled={working} onClick={()=>action('connect')}><QrCode size={16}/>{working?'Conectando…':'Gerar QR code'}</button>}{['connected','qr','connecting','authenticated'].includes(connection.state)&&<button className="button" disabled={working} onClick={()=>setConfirmDisconnect(true)}><Unplug size={15}/>Desconectar</button>}</div>}
      {confirmDisconnect&&<div className="notice">Desconectar cancela as mensagens que ainda estiverem na fila.<div className="qr-actions"><button className="button" disabled={working} onClick={()=>setConfirmDisconnect(false)}>Voltar</button><button className="button danger" disabled={working} onClick={()=>action('disconnect')}>Confirmar desconexão</button></div></div>}
      <ol className="qr-steps"><li>Abra o WhatsApp no celular.</li><li>Acesse <strong>Aparelhos conectados</strong> e toque em <strong>Conectar aparelho</strong>.</li><li>Aponte a câmera para o QR code e aguarde a confirmação.</li></ol>
      <p className="field-note">Esta conexão usa o WhatsApp Web e não é uma integração oficial da Meta. Pode exigir reconexão ou sofrer bloqueio do número.</p>
    </div></section>
    <section className="card"><div className="card-heading"><div><h2>Mensagem automática</h2><p>O primeiro contato com a cara do seu negócio</p></div><Send size={20}/></div><form className="settings-form" onSubmit={e=>{e.preventDefault();save('settings',settings)}}><label>Nome do seu negócio<input required maxLength={120} value={settings.business} onChange={e=>setSettings({...settings,business:e.target.value})}/></label><label>Mensagem de boas-vindas<textarea required rows={6} maxLength={1500} value={settings.message} onChange={e=>setSettings({...settings,message:e.target.value})}/></label><div className="variable-hint"><span>{'{{nome}}'}</span> nome do cliente <span>{'{{empresa}}'}</span> seu negócio</div><div className="qr-preview"><span>PRÉVIA DA MENSAGEM</span><p>{settings.message.replaceAll('{{nome}}','Mariana').replaceAll('{{empresa}}',settings.business)}</p></div><label className="toggle-row"><div><strong>Enviar ao cadastrar um cliente</strong><small>Somente contatos com autorização registrada.</small></div><input type="checkbox" checked={!!settings.automated} onChange={e=>setSettings({...settings,automated:e.target.checked?1:0})}/></label>{!!settings.automated&&connection.state!=='connected'&&<div className="notice">Salve o texto agora e conecte o WhatsApp antes de cadastrar clientes para envio automático. Cadastros sem conexão não são reenviados automaticamente.</div>}<button disabled={busy} className="button primary"><Check size={16}/>{busy?'Salvando…':'Salvar automação'}</button><p className="field-note">Após entrar na fila, a mensagem será enviada pelo servidor mesmo com o site fechado. A fila expira após 24 horas; resultados incertos não são reenviados automaticamente.</p></form></section></div>
    <section className="card"><div className="card-heading"><div><h2>Histórico de envios</h2><p>O resultado de cada mensagem</p></div><button className="text-button" onClick={refresh}><RefreshCw size={14}/>Atualizar histórico</button></div>{messages.length?<div className="table-scroll"><table><thead><tr><th>Cliente</th><th>Status</th><th>Detalhes</th><th>Data</th></tr></thead><tbody>{messages.map((m:any)=><tr key={m.id}><td><strong>{m.name}</strong><small>+{m.phone}</small></td><td><span className="tag">{m.status}</span></td><td className="message-detail">{m.detail}</td><td>{new Date(m.created).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}</td></tr>)}</tbody></table></div>:<div className="empty"><span className="empty-icon"><Send size={24}/></span><h3>As próximas conversas começam aqui</h3><p>Conecte o WhatsApp, ative a automação e cadastre um cliente que autorizou o contato.</p></div>}</section>
  </>;
}
