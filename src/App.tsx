import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BookOpen, CheckCircle2, Cloud, GraduationCap, LayoutDashboard, LogIn, LogOut, Plus, RefreshCw, Settings, Trash2 } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase, CLOUD_ROW_ID } from './supabase'
import { defaultState, semesters } from './data'
import type { Assignment, Course, PlannerState } from './types'

type Page = 'dashboard' | 'planner' | 'assignments' | 'settings'
type SyncState = 'loading' | 'saved' | 'saving' | 'error' | 'offline'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [planner, setPlanner] = useState<PlannerState>(() => clone(defaultState))
  const [session, setSession] = useState<Session | null>(null)
  const [syncState, setSyncState] = useState<SyncState>('loading')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<number | undefined>(undefined)

  const loadCloud = useCallback(async () => {
    setSyncState('loading')
    const { data, error } = await supabase
      .from('planner_data')
      .select('data, updated_at')
      .eq('id', CLOUD_ROW_ID)
      .maybeSingle()

    if (error) {
      setSyncState('error')
      setLoaded(true)
      return
    }

    if (data?.data) {
      setPlanner(data.data as PlannerState)
      setLastUpdated(data.updated_at ?? '')
      setSyncState('saved')
    } else {
      setSyncState('offline')
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    void loadCloud()
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    const channel = supabase
      .channel('planner-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planner_data', filter: `id=eq.${CLOUD_ROW_ID}` }, () => {
        if (!session) void loadCloud()
      })
      .subscribe()
    return () => {
      listener.subscription.unsubscribe()
      void supabase.removeChannel(channel)
    }
  }, [loadCloud, session])

  const saveCloud = useCallback(async (next: PlannerState) => {
    if (!session?.user || !loaded) return
    setSyncState('saving')
    const { data, error } = await supabase
      .from('planner_data')
      .upsert({ id: CLOUD_ROW_ID, owner_id: session.user.id, data: next, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select('updated_at')
      .single()
    if (error) {
      setSyncState('error')
      return
    }
    setLastUpdated(data.updated_at)
    setSyncState('saved')
  }, [loaded, session])

  const updatePlanner = (updater: (current: PlannerState) => PlannerState) => {
    setPlanner(current => {
      const next = updater(clone(current))
      if (session?.user) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = window.setTimeout(() => void saveCloud(next), 700)
      }
      return next
    })
  }

  const completedCredits = useMemo(() => planner.settings.startCredits + planner.courses.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.credits, 0), [planner])
  const remaining = Math.max(0, planner.settings.degreeCredits - completedCredits)
  const degreePercent = Math.min(100, Math.round((completedCredits / planner.settings.degreeCredits) * 100))
  const certCodes = ['CRIM 120','CRIM 121','CMIT 135','CMIT 140','CFDI 240','CFDI 345']
  const certCompleted = planner.courses.filter(c => certCodes.includes(c.code) && c.status === 'completed').length

  const signUp = async () => {
    setAuthMessage('Creating account...')
    const { error } = await supabase.auth.signUp({ email, password })
    setAuthMessage(error ? error.message : 'Check your email to confirm your account, then sign in.')
  }
  const signIn = async () => {
    setAuthMessage('Signing in...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setAuthMessage(error ? error.message : 'Signed in. Your edits now save automatically.')
  }
  const signOut = async () => {
    await supabase.auth.signOut()
    setAuthMessage('Signed out. The app is now view-only.')
  }

  if (!loaded) return <div className="boot"><Cloud size={42}/><h1>Loading The Brief...</h1></div>

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>THE</span> BRIEF<div>YOUR MISSION CONTROL</div></div>
        <nav>
          <NavButton active={page==='dashboard'} icon={<LayoutDashboard/>} label="Dashboard" onClick={() => setPage('dashboard')} />
          <NavButton active={page==='planner'} icon={<GraduationCap/>} label="Academic" onClick={() => setPage('planner')} />
          <NavButton active={page==='assignments'} icon={<BookOpen/>} label="Assignments" onClick={() => setPage('assignments')} />
          <NavButton active={page==='settings'} icon={<Settings/>} label="Settings" onClick={() => setPage('settings')} />
        </nav>
        <div className={`sync-pill ${syncState}`}><Cloud size={16}/>{syncLabel(syncState)}</div>
      </aside>

      <main className="content">
        {page === 'dashboard' && <Dashboard completed={completedCredits} remaining={remaining} degreePercent={degreePercent} certCompleted={certCompleted} planner={planner} />}
        {page === 'planner' && <Planner planner={planner} editable={Boolean(session)} onChange={updatePlanner} />}
        {page === 'assignments' && <Assignments planner={planner} editable={Boolean(session)} onChange={updatePlanner} />}
        {page === 'settings' && (
          <SettingsPage planner={planner} editable={Boolean(session)} onChange={updatePlanner} session={session} email={email} password={password} setEmail={setEmail} setPassword={setPassword} signUp={signUp} signIn={signIn} signOut={signOut} authMessage={authMessage} lastUpdated={lastUpdated} refresh={loadCloud}/>
        )}
      </main>
    </div>
  )
}

function NavButton({active, icon, label, onClick}:{active:boolean; icon:ReactNode; label:string; onClick:()=>void}) {
  return <button className={active?'active':''} onClick={onClick}>{icon}<span>{label}</span></button>
}

function Dashboard({completed,remaining,degreePercent,certCompleted,planner}:{completed:number;remaining:number;degreePercent:number;certCompleted:number;planner:PlannerState}) {
  const upcoming = planner.assignments.filter(a => !a.completed).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,4)
  return <>
    <header className="page-header"><div><p className="eyebrow">ACADEMIC COMMAND CENTER</p><h1>Good morning, Kryss.</h1><p>Your plan is live, synced, and moving toward {planner.settings.graduationTarget}.</p></div><div className="live-badge">LIVE CLOUD DATA</div></header>
    <section className="metric-grid">
      <Metric label="Credits completed" value={String(completed)} detail={`${degreePercent}% of degree`} />
      <Metric label="Credits remaining" value={String(remaining)} detail="Including planned coursework" />
      <Metric label="Certificate" value={`${certCompleted}/6`} detail="Digital Forensics" />
      <Metric label="Graduation" value={planner.settings.graduationTarget} detail="Current target" compact />
    </section>
    <section className="two-column">
      <div className="panel"><div className="panel-title"><h2>Degree progress</h2><span>{degreePercent}%</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${degreePercent}%`}} /></div><p>{completed} of {planner.settings.degreeCredits} credits completed.</p></div>
      <div className="panel"><h2>Next assignments</h2>{upcoming.length ? upcoming.map(a => <div className="assignment-row" key={a.id}><CheckCircle2 size={18}/><div><strong>{a.title}</strong><small>{a.dueDate || 'No due date'}</small></div></div>) : <p className="muted">Nothing due yet.</p>}</div>
    </section>
  </>
}

function Metric({label,value,detail,compact=false}:{label:string;value:string;detail:string;compact?:boolean}) { return <div className="metric-card"><span>{label}</span><strong className={compact?'compact':''}>{value}</strong><small>{detail}</small></div> }

function Planner({planner,editable,onChange}:{planner:PlannerState;editable:boolean;onChange:(u:(p:PlannerState)=>PlannerState)=>void}) {
  const updateCourse = (id:string, patch:Partial<Course>) => onChange(p => ({...p,courses:p.courses.map(c=>c.id===id?{...c,...patch}:c)}))
  const addCourse = () => onChange(p => ({...p,courses:[...p.courses,{id:crypto.randomUUID(),code:'NEW 100',title:'New Course',semester:semesters[0],term:'7A',category:'core',credits:3,status:'planned',grade:'',notes:''}]}))
  const removeCourse = (id:string) => onChange(p => ({...p,courses:p.courses.filter(c=>c.id!==id)}))
  return <>
    <header className="page-header"><div><p className="eyebrow">ACADEMIC</p><h1>Semester Planner</h1><p>{editable?'Owner mode: edits save automatically.':'View-only mode. Sign in to make changes.'}</p></div>{editable&&<button className="primary" onClick={addCourse}><Plus size={18}/>Add course</button>}</header>
    <div className="semester-list">{semesters.map(semester => <section className="semester" key={semester}><h2>{semester}</h2><div className="term-grid">{(['7A','7B'] as const).map(term => <div className="term" key={term}><h3>{term}</h3>{planner.courses.filter(c=>c.semester===semester&&c.term===term).map(course => <article className={`course ${course.category}`} key={course.id}><div><strong>{course.code}</strong><span>{course.title}</span></div><div className="course-controls"><select disabled={!editable} value={course.status} onChange={e=>updateCourse(course.id,{status:e.target.value as Course['status']})}><option value="planned">Planned</option><option value="registered">Registered</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select><input disabled={!editable} value={course.grade} placeholder="Grade" onChange={e=>updateCourse(course.id,{grade:e.target.value})}/>{editable&&<button className="icon danger" onClick={()=>removeCourse(course.id)} aria-label="Delete course"><Trash2 size={16}/></button>}</div></article>)}</div>)}</div></section>)}</div>
  </>
}

function Assignments({planner,editable,onChange}:{planner:PlannerState;editable:boolean;onChange:(u:(p:PlannerState)=>PlannerState)=>void}) {
  const add = () => onChange(p => ({...p,assignments:[...p.assignments,{id:crypto.randomUUID(),courseId:p.courses[0]?.id??'',title:'New assignment',dueDate:'',completed:false}]}))
  const patch = (id:string, data:Partial<Assignment>) => onChange(p => ({...p,assignments:p.assignments.map(a=>a.id===id?{...a,...data}:a)}))
  const remove = (id:string) => onChange(p => ({...p,assignments:p.assignments.filter(a=>a.id!==id)}))
  return <><header className="page-header"><div><p className="eyebrow">ACADEMIC</p><h1>Assignments</h1><p>Deadlines that stay current across every device.</p></div>{editable&&<button className="primary" onClick={add}><Plus size={18}/>Add assignment</button>}</header><div className="panel table-panel">{planner.assignments.length===0?<p className="muted">No assignments yet.</p>:planner.assignments.map(a=><div className="assignment-edit" key={a.id}><input type="checkbox" disabled={!editable} checked={a.completed} onChange={e=>patch(a.id,{completed:e.target.checked})}/><input disabled={!editable} value={a.title} onChange={e=>patch(a.id,{title:e.target.value})}/><select disabled={!editable} value={a.courseId} onChange={e=>patch(a.id,{courseId:e.target.value})}>{planner.courses.map(c=><option key={c.id} value={c.id}>{c.code}</option>)}</select><input type="date" disabled={!editable} value={a.dueDate} onChange={e=>patch(a.id,{dueDate:e.target.value})}/>{editable&&<button className="icon danger" onClick={()=>remove(a.id)}><Trash2 size={16}/></button>}</div>)}</div></>
}

function SettingsPage(props:{planner:PlannerState;editable:boolean;onChange:(u:(p:PlannerState)=>PlannerState)=>void;session:Session|null;email:string;password:string;setEmail:(v:string)=>void;setPassword:(v:string)=>void;signUp:()=>void;signIn:()=>void;signOut:()=>void;authMessage:string;lastUpdated:string;refresh:()=>void}) {
  const {planner,editable,onChange,session,email,password,setEmail,setPassword,signUp,signIn,signOut,authMessage,lastUpdated,refresh}=props
  return <><header className="page-header"><div><p className="eyebrow">SYSTEM</p><h1>Settings & Cloud</h1><p>Public visitors can view. Only the owner can edit.</p></div></header><section className="two-column"><div className="panel"><h2>Planner settings</h2><label>Starting credits<input type="number" disabled={!editable} value={planner.settings.startCredits} onChange={e=>onChange(p=>({...p,settings:{...p.settings,startCredits:Number(e.target.value)}}))}/></label><label>Total degree credits<input type="number" disabled={!editable} value={planner.settings.degreeCredits} onChange={e=>onChange(p=>({...p,settings:{...p.settings,degreeCredits:Number(e.target.value)}}))}/></label><label>Graduation target<input disabled={!editable} value={planner.settings.graduationTarget} onChange={e=>onChange(p=>({...p,settings:{...p.settings,graduationTarget:e.target.value}}))}/></label></div><div className="panel"><h2>Cloud account</h2>{session?<><div className="status ok"><Cloud size={18}/>Signed in as {session.user.email}</div><button className="secondary" onClick={refresh}><RefreshCw size={18}/>Reload cloud data</button><button className="secondary danger" onClick={signOut}><LogOut size={18}/>Sign out</button></>:<><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><div className="button-row"><button className="primary" onClick={signIn}><LogIn size={18}/>Sign in</button><button className="secondary" onClick={signUp}>Create account</button></div></>}<p className="muted">{authMessage}</p>{lastUpdated&&<p className="muted">Last cloud update: {new Date(lastUpdated).toLocaleString()}</p>}</div></section></>
}

function syncLabel(state:SyncState) { return ({loading:'Loading cloud',saved:'Cloud synced',saving:'Saving...',error:'Sync error',offline:'No cloud row'})[state] }
