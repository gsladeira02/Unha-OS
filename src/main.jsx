import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CalendarDays, Check, CreditCard, ImagePlus, Link as LinkIcon, LogOut, MapPin, Scissors, Share2, Sparkles, Users, Wallet } from 'lucide-react'
import './styles.css'
import { APP_CONFIG, formatBRL, checkoutUrl } from './config.js'

const STORE_KEY = 'unhaos_sistemasos_v1'
const uid = () => Math.random().toString(36).slice(2, 10)
const todayISO = () => new Date().toISOString().slice(0, 10)

const starter = {
  account: null,
  profile: {
    studioName: 'Meu Studio de Unhas',
    phone: '',
    instagram: '',
    bio: 'Agenda online para manicure e pedicure.',
    plan: 'individual',
    recurrence: 'monthly',
    status: 'pending',
    dueDate: todayISO()
  },
  locations: [],
  professionals: [],
  services: [],
  clients: [],
  appointments: [],
  publicPhotos: []
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || starter } catch { return starter }
}
function saveState(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)) }
function daysAfter(dateStr) {
  const due = new Date(`${dateStr}T23:59:59`)
  const diff = Math.ceil((Date.now() - due.getTime()) / 86400000)
  return diff
}
function isBlocked(profile) {
  if (!profile) return true
  if (profile.plan === APP_CONFIG.adminPlanId) return false
  if (profile.status !== 'active') return true
  if (!profile.dueDate) return true
  return daysAfter(profile.dueDate) > APP_CONFIG.gracePeriodDays
}
function addMonths(date, months) {
  const d = new Date(`${date}T12:00:00`)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}
function isAdminEmail(email) {
  return APP_CONFIG.adminEmails.map(normalizeEmail).includes(normalizeEmail(email))
}
function buildProfileForSignup(email, studioName, selectedPlan, selectedRecurrence) {
  if (isAdminEmail(email)) {
    return {
      ...starter.profile,
      studioName: studioName || 'Admin SistemasOS',
      plan: APP_CONFIG.adminPlanId,
      recurrence: 'lifetime',
      status: 'active',
      dueDate: '2099-12-31'
    }
  }
  return {
    ...starter.profile,
    studioName: studioName || starter.profile.studioName,
    plan: selectedPlan,
    recurrence: selectedRecurrence,
    status: 'pending',
    dueDate: todayISO()
  }
}
function photoLimit(plan) {
  const limit = Number(plan?.limits?.publicPhotos)
  return Number.isFinite(limit) ? limit : 12
}

function publicSchedulePath(profile) {
  const base = normalizeEmail(profile?.studioName || 'unhaos').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'agenda'
  return `/agendar/${base}`
}
function publicScheduleUrl(profile) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://unha-os.vercel.app'
  return `${origin}${publicSchedulePath(profile)}`
}
function normalizeWhatsAppLink(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('https://wa.me/') || raw.startsWith('http://wa.me/') || raw.startsWith('wa.me/')) return raw.startsWith('http') ? raw : `https://${raw}`
  const digits = raw.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : raw
}
function normalizeInstagramLink(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const handle = raw.replace('@','')
  return `https://instagram.com/${handle}`
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}


function App() {
  const [data, setData] = useState(loadState)
  const [page, setPage] = useState(data.account ? 'dashboard' : 'auth')
  const blocked = isBlocked(data.profile)
  const plan = APP_CONFIG.plans[data.profile.plan]

  const update = (patch) => setData(prev => { const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }; saveState(next); return next })

  function signup(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = form.get('name')?.trim()
    const email = form.get('email')?.trim()
    const password = form.get('password')?.trim()
    const studioName = form.get('studioName')?.trim()
    const selectedPlan = form.get('plan') || 'individual'
    const selectedRecurrence = form.get('recurrence') || 'monthly'
    if (!name || !email || !password) return alert('Preencha nome, e-mail e senha.')
    const profile = buildProfileForSignup(email, studioName, selectedPlan, selectedRecurrence)
    update(prev => ({ ...prev, account: { name, email }, profile }))
    setPage(profile.plan === APP_CONFIG.adminPlanId ? 'dashboard' : 'planos')
  }

  function loginExisting(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = form.get('email')?.trim()
    const password = form.get('password')?.trim()
    if (!email || !password) return alert('Preencha e-mail e senha.')
    const currentName = data.account?.name || data.profile?.studioName || 'Cliente'
    const profile = isAdminEmail(email) ? buildProfileForSignup(email, 'Admin SistemasOS', APP_CONFIG.adminPlanId, 'lifetime') : data.profile
    update(prev => ({ ...prev, account: { name: currentName, email }, profile }))
    setPage('dashboard')
  }

  function logout() {
    update(prev => ({ ...prev, account: null }))
    setPage('auth')
  }

  function activate(recurrenceId) {
    const rec = APP_CONFIG.plans[data.profile.plan].recurrences.find(r => r.id === recurrenceId)
    update(prev => ({ ...prev, profile: { ...prev.profile, recurrence: recurrenceId, status: 'active', dueDate: addMonths(todayISO(), rec.accessMonths) } }))
    alert(`Plano ativado até ${addMonths(todayISO(), rec.accessMonths).split('-').reverse().join('/')}.`)
  }

  return <div className="app">
    <header className="topbar">
      <div className="logo"><span className="logo-mark"><Sparkles size={20}/></span><span>{APP_CONFIG.appName}</span><span className="pill">{APP_CONFIG.hubName}</span></div>
      <nav className="nav">
        {data.account && ['dashboard','agenda','clientes','config','pagina','planos'].map(id => <button key={id} className={page===id?'active':''} onClick={() => setPage(id)}>{labelPage(id)}</button>)}
        {data.account && <button className="logout-btn" onClick={logout}><LogOut size={16}/> Sair</button>}
      </nav>
    </header>

    <main className="wrap">
      {data.account && blocked && <div className="lock"><strong>Acesso bloqueado.</strong> O vencimento passou há mais de {APP_CONFIG.gracePeriodDays} dias. Regularize em Planos para liberar novamente.</div>}
      {!data.account && <AuthScreen signup={signup} loginExisting={loginExisting} setPage={setPage} />}
      {data.account && page === 'dashboard' && <Dashboard data={data} update={update} blocked={blocked} />}
      {data.account && page === 'agenda' && <Agenda data={data} update={update} blocked={blocked} />}
      {data.account && page === 'clientes' && <Clientes data={data} update={update} blocked={blocked} />}
      {data.account && page === 'config' && <Config data={data} update={update} blocked={blocked} />}
      {data.account && page === 'pagina' && <PublicPage data={data} update={update} blocked={blocked} />}
      {data.account && page === 'planos' && <Plans data={data} update={update} setPage={setPage} />}
    </main>
    <footer className="footer">{APP_CONFIG.appName} · {APP_CONFIG.hubName}</footer>
  </div>
}
function labelPage(id) { return ({dashboard:'Início', agenda:'Agenda', clientes:'Clientes', config:'Configuração', pagina:'Página pública', planos:'Planos'})[id] }


function AuthScreen({ signup, loginExisting }) {
  const [mode, setMode] = useState('login')
  return <section className="auth-shell">
    <div className="mobile-auth-logo"><span className="logo-mark"><Sparkles size={20}/></span><strong>UnhaOS</strong><span className="pill">SistemasOS</span></div>
    <div className="auth-hero card">
      <span className="badge"><Sparkles size={16}/> Sistema para manicure e pedicure</span>
      <h1>Organize sua agenda pelo celular.</h1>
      <p>Entre se você já é cliente ou crie sua conta para configurar profissionais, locais, serviços, agenda e página pública.</p>
      <div className="auth-highlights">
        <span><CalendarDays size={16}/> Agenda rápida</span>
        <span><Users size={16}/> Clientes e profissionais</span>
        <span><ImagePlus size={16}/> Página com fotos</span>
      </div>
    </div>

    <div className="auth-card card">
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Já sou cliente</button>
        <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Novo cliente</button>
      </div>
      {mode === 'login' ? <ExistingLogin loginExisting={loginExisting} /> : <Signup login={signup} />}
    </div>

    <div className="plan-grid auth-plans">
      {Object.values(APP_CONFIG.plans).filter(plan => !plan.hidden).map((plan) => <PlanCard key={plan.id} plan={plan} current={false} highlight={plan.id==='professional'} />)}
    </div>
  </section>
}

function ExistingLogin({ loginExisting }) {
  return <div>
    <h2>Entrar</h2>
    <form className="form" onSubmit={loginExisting}>
      <label>E-mail<input name="email" type="email" placeholder="voce@email.com" autoComplete="email" /></label>
      <label>Senha<input name="password" type="password" placeholder="Sua senha" autoComplete="current-password" /></label>
      <button className="primary">Entrar no sistema</button>
    </form>
  </div>
}

function Plans({ data, update, setPage }) {
  const [planId, setPlanId] = useState(data.profile.plan || 'individual')
  const [recurrenceId, setRecurrenceId] = useState(data.profile.recurrence || 'monthly')
  const selectedPlan = APP_CONFIG.plans[planId]
  const selectedRecurrence = selectedPlan.recurrences.find(r => r.id === recurrenceId) || selectedPlan.recurrences[0]

  function selectPlan(nextPlanId) {
    const nextPlan = APP_CONFIG.plans[nextPlanId]
    setPlanId(nextPlanId)
    if (!nextPlan.recurrences.some(r => r.id === recurrenceId)) setRecurrenceId('monthly')
  }

  function goToCheckout() {
    if (!data.account) return
    if (data.profile.plan === APP_CONFIG.adminPlanId) {
      alert('Conta admin já possui acesso ilimitado.')
      return
    }
    update(prev => ({ ...prev, profile: { ...prev.profile, plan: planId, recurrence: selectedRecurrence.id, status: prev.profile.status === 'active' ? 'active' : 'pending' } }))
    window.location.href = checkoutUrl(planId, selectedRecurrence.id)
  }

  return <>
    <section className="hero">
      <div className="card">
        <span className="badge"><Sparkles size={16}/> Sistema para manicure e pedicure</span>
        <h1>Agenda, clientes e página em um só lugar.</h1>
        <p>Planos configurados com locais de atendimento ilimitados nos dois planos, profissionais ilimitados no Profissional e limite de fotos totais na página pública.</p>
        {!data.account && <div className="actions"><button className="primary" onClick={() => setPage('auth')}>Entrar ou criar conta</button><button className="ghost" onClick={() => document.getElementById('planos')?.scrollIntoView({behavior:'smooth'})}>Ver preços</button></div>}
      </div>
      {data.account && <PlanSelector planId={planId} recurrenceId={recurrenceId} setPlanId={selectPlan} setRecurrenceId={setRecurrenceId} selectedPlan={selectedPlan} selectedRecurrence={selectedRecurrence} onCheckout={goToCheckout}/>} 
    </section>
    <section id="planos" style={{marginTop:20}} className="plan-grid">
      {Object.values(APP_CONFIG.plans).filter(plan => !plan.hidden).map((plan) => <PlanCard key={plan.id} plan={plan} current={data.profile.plan === plan.id} highlight={plan.id==='professional'} />)}
    </section>
  </>
}

function Signup({ login }) {
  const [planId, setPlanId] = useState('individual')
  const plan = APP_CONFIG.plans[planId]
  return <div className="card">
    <h2>Criar conta</h2>
    <form className="form" onSubmit={login}>
      <label>Nome completo<input name="name" placeholder="Seu nome" /></label>
      <label>E-mail<input name="email" type="email" placeholder="voce@email.com" /></label>
      <label>Senha<input name="password" type="password" placeholder="Crie uma senha" /></label>
      <label>Nome do studio ou perfil<input name="studioName" placeholder="Ex: Studio da Ana" /></label>
      <label>Plano<select name="plan" value={planId} onChange={(e)=>setPlanId(e.target.value)}><option value="individual">Individual · R$ 9,90/mês</option><option value="professional">Profissional · R$ 19,90/mês</option></select></label>
      <label>Recorrência<select name="recurrence">{plan.recurrences.map(r => <option key={r.id} value={r.id}>{r.label} · {r.installments}x de {formatBRL(r.installmentPrice)}</option>)}</select></label>
      <button className="primary">Criar conta</button>
      <p className="muted">Sem teste grátis. Após o vencimento, há tolerância de até {APP_CONFIG.gracePeriodDays} dias.</p>
    </form>
  </div>
}

function PlanSelector({ planId, recurrenceId, setPlanId, setRecurrenceId, selectedPlan, selectedRecurrence, onCheckout }) {
  return <div className="card">
    <h2>Escolher assinatura</h2>
    <div className="form">
      <label>Plano<select value={planId} onChange={(e)=>setPlanId(e.target.value)}><option value="individual">Individual</option><option value="professional">Profissional</option></select></label>
      <label>Recorrência<select value={recurrenceId} onChange={(e)=>setRecurrenceId(e.target.value)}>{selectedPlan.recurrences.map(r => <option key={r.id} value={r.id}>{r.label} · {r.installments}x de {formatBRL(r.installmentPrice)}</option>)}</select></label>
      <div className="kpi"><strong>{selectedRecurrence.installments}x de {formatBRL(selectedRecurrence.installmentPrice)}</strong><span>Acesso por {selectedRecurrence.accessMonths} {selectedRecurrence.accessMonths===1?'mês':'meses'} · Plano {selectedPlan.name}</span></div>
      <button className="primary" onClick={onCheckout}>Ir para pagamento</button>
      <p className="muted">Depois do pagamento, o acesso pode ser liberado pela administração.</p>
    </div>
  </div>
}

function PlanCard({ plan, current, highlight }) {
  return <div className={`card plan ${highlight ? 'highlight' : ''}`}>
    <h2>{plan.name}</h2>
    <p className="muted">{plan.audience}</p>
    <div className="price">{formatBRL(plan.monthlyPrice)} <small>/mês</small></div>
    <div className="grid">
      <div className="kpi col-4"><strong>{plan.limits.professionals}</strong><span>Profissionais</span></div>
      <div className="kpi col-4"><strong>{plan.limits.locations}</strong><span>Locais</span></div>
      <div className="kpi col-4"><strong>{plan.limits.publicPhotos}</strong><span>Fotos totais</span></div>
    </div>
    <div style={{marginTop:15}}>{plan.features.map(f => <div className="feature" key={f}><Check size={17}/><span>{f}</span></div>)}</div>
    <div className="recurrences">
      {plan.recurrences.map(r => <div className="recurrence" key={r.id}>
        <div><strong>{r.label}</strong><p className="muted" style={{margin:0}}>{r.installments}x de {formatBRL(r.installmentPrice)} · acesso {r.accessMonths} {r.accessMonths===1?'mês':'meses'}</p></div>
      </div>)}
    </div>
    {current && <p className="muted">Plano selecionado na conta atual.</p>}
  </div>
}

function Dashboard({ data, update, blocked }) {
  const totalHoje = data.appointments.filter(a=>a.date===todayISO()).reduce((s,a)=>s+Number(a.price||0),0)
  return <>
    <section className="card">
      <span className="badge"><Scissors size={16}/> {data.profile.studioName}</span>
      <h1 style={{fontSize:'clamp(2rem,6vw,4rem)', margin:'0 0 10px'}}>Bem-vinda ao UnhaOS</h1>
      <p className="muted">Configure locais, profissionais, serviços, horários e use a agenda. Mensagens automáticas não foram incluídas; há apenas botão manual para WhatsApp.</p>
    </section>
    <section className="grid" style={{marginTop:16}}>
      <Kpi icon={<CalendarDays/>} label="Atendimentos hoje" value={data.appointments.filter(a=>a.date===todayISO()).length}/>
      <Kpi icon={<Wallet/>} label="Vendas hoje" value={formatBRL(totalHoje)}/>
      <Kpi icon={<Users/>} label="Clientes" value={data.clients.length}/>
      <Kpi icon={<CreditCard/>} label="Plano" value={APP_CONFIG.plans[data.profile.plan].name}/>
    </section>
  </>
}
function Kpi({ icon, label, value }) { return <div className="kpi col-3">{icon}<strong>{value}</strong><span>{label}</span></div> }

function Config({ data, update, blocked }) {
  const plan = APP_CONFIG.plans[data.profile.plan]
  const addLocation = e => { e.preventDefault(); if(blocked) return; const f=new FormData(e.currentTarget); update(p=>({...p, locations:[...p.locations,{id:uid(),name:f.get('name'),address:f.get('address'),phone:f.get('phone')}]})); e.currentTarget.reset() }
  const addPro = e => { e.preventDefault(); if(blocked) return; if(plan.id==='individual' && data.professionals.length >= 1) return alert('O plano Individual permite 1 profissional.'); const f=new FormData(e.currentTarget); update(p=>({...p, professionals:[...p.professionals,{id:uid(),name:f.get('name'),phone:f.get('phone'),commission:f.get('commission')||0}]})); e.currentTarget.reset() }
  const addService = e => { e.preventDefault(); if(blocked) return; const f=new FormData(e.currentTarget); update(p=>({...p, services:[...p.services,{id:uid(),name:f.get('name'),duration:f.get('duration'),price:f.get('price'),professionalId:f.get('professionalId')}]})); e.currentTarget.reset() }
  return <section className="grid">
    <div className="card col-4"><h2><MapPin/> Locais ilimitados</h2><form className="form" onSubmit={addLocation}><label>Nome<input name="name" placeholder="Studio, domicílio, sala..."/></label><label>Endereço<input name="address"/></label><label>Telefone<input name="phone"/></label><button className="primary">Cadastrar local</button></form></div>
    <div className="card col-4"><h2><Users/> Profissionais</h2><p className="muted">Limite: {plan.limits.professionals}</p><form className="form" onSubmit={addPro}><label>Nome<input name="name"/></label><label>Celular<input name="phone"/></label><label>Comissão %<input name="commission" type="number" min="0" max="100"/></label><button className="primary">Cadastrar profissional</button></form></div>
    <div className="card col-4"><h2><Scissors/> Serviços</h2><form className="form" onSubmit={addService}><label>Serviço<input name="name" placeholder="Manicure + pedicure"/></label><label>Duração em minutos<input name="duration" type="number"/></label><label>Valor<input name="price" type="number" step="0.01"/></label><label>Profissional<select name="professionalId"><option value="">Todos/indefinido</option>{data.professionals.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="primary">Cadastrar serviço</button></form></div>
    <Lists data={data} update={update}/>
  </section>
}
function Lists({ data, update }) { return <div className="card col-12"><h2>Cadastros</h2><div className="grid"><MiniList title="Locais" items={data.locations}/><MiniList title="Profissionais" items={data.professionals}/><MiniList title="Serviços" items={data.services}/></div></div> }
function MiniList({ title, items }) { return <div className="col-4"><h3>{title}</h3><div className="list">{items.length?items.map(i=><div className="item" key={i.id}><div><h4>{i.name}</h4><p>{i.address || i.phone || (i.price ? formatBRL(Number(i.price)) : '')}</p></div></div>):<div className="empty">Nenhum cadastro ainda.</div>}</div></div> }

function Agenda({ data, update, blocked }) {
  const add = e => { e.preventDefault(); if(blocked) return; const f=new FormData(e.currentTarget); const service=data.services.find(s=>s.id===f.get('serviceId')); update(p=>({...p, appointments:[...p.appointments,{id:uid(),date:f.get('date'),time:f.get('time'),client:f.get('client'),phone:f.get('phone'),serviceId:f.get('serviceId'),professionalId:f.get('professionalId'),status:'Agendado',price:service?.price||0}]})); e.currentTarget.reset() }
  const sorted = [...data.appointments].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
  return <section className="grid"><div className="card col-5"><h2><CalendarDays/> Novo agendamento</h2><form className="form" onSubmit={add}><label>Data<input type="date" name="date" defaultValue={todayISO()}/></label><label>Hora<input type="time" name="time"/></label><label>Cliente<input name="client"/></label><label>WhatsApp<input name="phone"/></label><label>Serviço<select name="serviceId">{data.services.map(s=><option key={s.id} value={s.id}>{s.name} · {formatBRL(Number(s.price||0))}</option>)}</select></label><label>Profissional<select name="professionalId"><option value="">Selecionar</option>{data.professionals.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="primary">Agendar</button></form></div><div className="card col-7"><h2>Agenda</h2><div className="list">{sorted.length?sorted.map(a=><Appointment key={a.id} a={a} data={data} update={update}/>):<div className="empty">Nenhum agendamento ainda.</div>}</div></div></section>
}
function Appointment({ a, data, update }) {
  const service=data.services.find(s=>s.id===a.serviceId); const pro=data.professionals.find(p=>p.id===a.professionalId)
  const msg=encodeURIComponent(`Oi, ${a.client}! Seu horário para ${service?.name||'atendimento'} está marcado para ${a.date.split('-').reverse().join('/')} às ${a.time}.`)
  const phone=(a.phone||'').replace(/\D/g,'')
  return <div className="item"><div><h4>{a.date.split('-').reverse().join('/')} · {a.time} · {a.client}</h4><p>{service?.name} · {pro?.name||'Profissional não definida'} · {formatBRL(Number(a.price||0))}</p></div><div className="actions" style={{margin:0}}><span className="pill">{a.status}</span>{phone&&<a className="ghost" target="_blank" href={`https://wa.me/55${phone}?text=${msg}`}>WhatsApp</a>}<button className="primary" onClick={()=>update(p=>({...p,appointments:p.appointments.map(x=>x.id===a.id?{...x,status:'Finalizado'}:x)}))}>Finalizar</button></div></div>
}

function Clientes({ data, update, blocked }) {
  const add=e=>{e.preventDefault(); if(blocked) return; const f=new FormData(e.currentTarget); update(p=>({...p,clients:[...p.clients,{id:uid(),name:f.get('name'),phone:f.get('phone'),birthday:f.get('birthday'),notes:f.get('notes')}]})); e.currentTarget.reset()}
  return <section className="grid"><div className="card col-4"><h2>Nova cliente</h2><form className="form" onSubmit={add}><label>Nome<input name="name"/></label><label>Celular<input name="phone"/></label><label>Aniversário<input name="birthday" type="date"/></label><label>Observações<textarea name="notes" placeholder="Gosta de francesinha, alergias, preferências..."/></label><button className="primary">Cadastrar</button></form></div><div className="card col-8"><h2>Clientes</h2><div className="list">{data.clients.length?data.clients.map(c=><div className="item" key={c.id}><div><h4>{c.name}</h4><p>{c.phone} · {c.notes}</p></div></div>):<div className="empty">Nenhuma cliente cadastrada.</div>}</div></div></section>
}

function PublicPage({ data, update, blocked }) {
  const plan = APP_CONFIG.plans[data.profile.plan]
  const limit = photoLimit(plan)
  const scheduleUrl = publicScheduleUrl(data.profile)

  const saveProfile=e=>{
    e.preventDefault(); if(blocked) return
    const f=new FormData(e.currentTarget)
    update(p=>({...p,profile:{...p.profile,studioName:f.get('studioName'),phone:f.get('phone'),instagram:f.get('instagram'),bio:f.get('bio')}}))
  }

  const addPhoto=async e=>{
    e.preventDefault(); if(blocked) return
    if(data.publicPhotos.length>=limit) return alert(`Seu plano permite ${limit} fotos totais na página pública.`)
    const f=new FormData(e.currentTarget)
    const file=f.get('photo')
    if(!file || !file.size) return alert('Escolha uma foto da galeria.')
    const dataUrl = await readFileAsDataUrl(file)
    update(p=>({...p,publicPhotos:[...p.publicPhotos,{id:uid(),url:dataUrl,caption:f.get('caption')}]}))
    e.currentTarget.reset()
  }

  async function shareSchedule() {
    const title = `Agendamento ${data.profile.studioName}`
    const text = `Agende seu horário no ${data.profile.studioName}`
    try {
      if (navigator.share) await navigator.share({ title, text, url: scheduleUrl })
      else {
        await navigator.clipboard.writeText(scheduleUrl)
        alert('Link de agendamento copiado.')
      }
    } catch {}
  }

  const instagramLink = normalizeInstagramLink(data.profile.instagram)
  const whatsappLink = normalizeWhatsAppLink(data.profile.phone)

  return <section className="grid">
    <div className="card col-5">
      <h2><ImagePlus/> Página pública</h2>
      <p className="muted">Fotos totais permitidas no plano {plan.name}: {limit}.</p>

      <div className="share-box">
        <strong>Link de agendamento</strong>
        <p>{scheduleUrl}</p>
        <div className="actions">
          <button className="primary" type="button" onClick={shareSchedule}><Share2 size={16}/> Compartilhar página</button>
          <button className="ghost" type="button" onClick={() => navigator.clipboard?.writeText(scheduleUrl)}><LinkIcon size={16}/> Copiar link</button>
        </div>
      </div>

      <form className="form" onSubmit={saveProfile}>
        <label>Nome público<input name="studioName" defaultValue={data.profile.studioName} placeholder="Ex: Studio da Ana"/></label>
        <label>Link do WhatsApp<input name="phone" defaultValue={data.profile.phone} placeholder="Ex: wa.me/+5527999999999"/></label>
        <label>Link do Instagram<input name="instagram" defaultValue={data.profile.instagram} placeholder="Ex: https://instagram.com/seuusuario"/></label>
        <label>Bio<textarea name="bio" defaultValue={data.profile.bio} placeholder="Ex: Manicure, pedicure e nail designer."/></label>
        <button className="primary">Salvar página</button>
      </form>

      <hr style={{borderColor:'var(--line)', margin:'18px 0'}}/>

      <form className="form" onSubmit={addPhoto}>
        <label>Adicionar foto da galeria<input name="photo" type="file" accept="image/*" /></label>
        <label>Legenda<input name="caption" placeholder="Ex: Francesinha delicada"/></label>
        <button className="primary" type="submit">Adicionar foto</button>
      </form>
    </div>

    <div className="card col-7">
      <span className="badge">Prévia pública</span>
      <h1 style={{fontSize:'2.4rem', margin:'0 0 6px'}}>{data.profile.studioName}</h1>
      <p className="muted">{data.profile.bio}</p>
      <div className="public-links">
        {whatsappLink && <a className="ghost" href={whatsappLink} target="_blank">WhatsApp</a>}
        {instagramLink && <a className="ghost" href={instagramLink} target="_blank">Instagram</a>}
      </div>
      <div className="photo-grid">{Array.from({length:limit}).map((_,idx)=>{const ph=data.publicPhotos[idx]; return <div className="photo" key={idx}>{ph?<img src={ph.url} alt={ph.caption || 'Foto'} />:<span>Foto {idx+1}</span>}</div>})}</div>
      <h3>Serviços</h3>
      <div className="list">{data.services.length?data.services.map(s=><div className="item" key={s.id}><div><h4>{s.name}</h4><p>{s.duration} min</p></div><span className="pill">{formatBRL(Number(s.price||0))}</span></div>):<div className="empty">Cadastre seus serviços para aparecerem aqui.</div>}</div>
    </div>
  </section>
}

createRoot(document.getElementById('root')).render(<App />)
