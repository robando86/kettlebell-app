import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// BELL SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const BELLS = {
  "12kg": {
    selected: { bg: "#1a3a6b", text: "#fff" },
    unselected: { bg: "#eef3fb", text: "#8aaac8" },
  },
  "16kg": {
    selected: { bg: "#f5cc00", text: "#1a1200" },
    unselected: { bg: "#fffbe6", text: "#a08800" },
  },
  "24kg": {
    selected: { bg: "#1a5c2a", text: "#fff" },
    unselected: { bg: "#eaf4ed", text: "#7ab08a" },
  },
  "—": {
    selected: { bg: "#444", text: "#fff" },
    unselected: { bg: "#f0f0f0", text: "#aaa" },
  },
};
const BELL_OPTIONS = ["12kg", "16kg", "24kg"];

function bellStyle(bell, isSelected) {
  const b = BELLS[bell] || BELLS["—"];
  return isSelected ? b.selected : b.unselected;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const FINISHERS = [
  { id:"fc", name:"Bicep Curls",               bell:"12kg", sets:3, reps:12,   note:"Slow & controlled" },
  { id:"fd", name:"Deep Goblet Squat Hold",    bell:"12kg", sets:3, reps:"45s",note:"Chest tall, breathe" },
  { id:"fp", name:"KB Push-Ups on Handles",    bell:"—",   sets:3, reps:10,   note:"Handles as parallettes" },
  { id:"ff", name:"Farmer Carry",              bell:"24kg", sets:3, reps:"40s",note:"One bell, switch sides" },
  { id:"fh", name:"Plank Hold",               bell:"—",   sets:3, reps:"45s",note:"Brace everything" },
  { id:"fq", name:"Goblet Squat + Curl Combo",bell:"12kg", sets:3, reps:10,   note:"Squat, stand, curl" },
];

const FLEX_MENU = [
  { id:"m1",  name:"Two-Handed Swings",  bell:"16kg", sets:3, reps:15, note:"Hip drive, hinge not squat" },
  { id:"m2",  name:"Single-Arm Swings",  bell:"16kg", sets:3, reps:10, note:"Per arm" },
  { id:"m3",  name:"Goblet Squat",       bell:"16kg", sets:3, reps:10, note:"Chest tall, knees out" },
  { id:"m4",  name:"Romanian Deadlift",  bell:"24kg", sets:3, reps:12, note:"Hinge, soft knees" },
  { id:"m5",  name:"Single-Arm Press",   bell:"12kg", sets:3, reps:10, note:"Per arm — brace hard" },
  { id:"m6",  name:"Bent-Over Row",      bell:"16kg", sets:3, reps:10, note:"Per arm, hinge 45°" },
  { id:"m7",  name:"Reverse Lunge",      bell:"16kg", sets:3, reps:8,  note:"Per leg, control descent" },
  { id:"m8",  name:"KB Halos",           bell:"12kg", sets:3, reps:8,  note:"Per direction — slow" },
  { id:"m9",  name:"Suitcase Carry",     bell:"24kg", sets:3, reps:"40s",note:"Per side, stand tall" },
  { id:"m10", name:"Floor Press",        bell:"12kg", sets:3, reps:10, note:"Per arm, slow lower" },
];

const DEFAULT_SESSIONS = {
  A: { name:"Session A", subtitle:"Hinge & Press",        tag:"Weekday", tagType:"weekday", color:"#1a3a6b", estimatedMin:25,
    exercises:[
      { id:"a1", name:"Romanian Deadlift", bell:"24kg", sets:3, reps:12, note:"3s lowering, 1s pause at bottom" },
      { id:"a2", name:"Goblet Squat",      bell:"16kg", sets:3, reps:12, note:"Chest tall, knees out" },
      { id:"a3", name:"Two-Handed Swings", bell:"16kg", sets:4, reps:20, note:"Hip drive — hinge not squat" },
      { id:"a4", name:"Single-Arm Press",  bell:"12kg", sets:3, reps:12, note:"Per arm — brace hard" },
    ]},
  B: { name:"Session B", subtitle:"Squat & Pull",         tag:"Weekday", tagType:"weekday", color:"#1a3a6b", estimatedMin:25,
    exercises:[
      { id:"b1", name:"Goblet Squat",      bell:"24kg", sets:4, reps:8,  note:"Chest tall, full depth" },
      { id:"b2", name:"Reverse Lunge",     bell:"16kg", sets:3, reps:8,  note:"Per leg — control descent" },
      { id:"b3", name:"Bent-Over Row",     bell:"16kg", sets:3, reps:10, note:"Per arm, hinge 45°" },
      { id:"b4", name:"Single-Arm Swings", bell:"16kg", sets:4, reps:10, note:"Per arm — drive with hip" },
    ]},
  C: { name:"Session C", subtitle:"Strength & Swings",    tag:"Weekend", tagType:"weekend", color:"#8a3a00", estimatedMin:35,
    exercises:[
      { id:"c1", name:"Goblet Squat",      bell:"24kg", sets:4, reps:8,  note:"Chest tall, knees out" },
      { id:"c2", name:"Romanian Deadlift", bell:"24kg", sets:3, reps:12, note:"3s lowering, 1s pause" },
      { id:"c3", name:"Single-Arm Press",  bell:"12kg", sets:4, reps:8,  note:"Per arm — brace hard" },
      { id:"c4", name:"Two-Handed Swings", bell:"16kg", sets:4, reps:20, note:"Hip drive, stay tall" },
    ]},
  D: { name:"Session D", subtitle:"Conditioning Circuit", tag:"Weekend", tagType:"weekend", color:"#8a3a00", estimatedMin:30,
    exercises:[
      { id:"d1", name:"Two-Handed Swings", bell:"16kg", sets:4, reps:15, note:"Hip drive, breathe" },
      { id:"d2", name:"Goblet Squat",      bell:"16kg", sets:4, reps:10, note:"Chest tall, push knees out" },
      { id:"d3", name:"Single-Arm Press",  bell:"12kg", sets:4, reps:8,  note:"Per arm — brace hard" },
      { id:"d4", name:"Bent-Over Row",     bell:"16kg", sets:3, reps:10, note:"Per arm, 45° hinge" },
    ]},
  E: { name:"Session E", subtitle:"Flex Day",             tag:"Any Day", tagType:"flex",    color:"#555",   estimatedMin:20,
    exercises:[] },
};

const TAG_STYLES = {
  weekday: { bg:"#e8eef8", text:"#1a3a6b" },
  weekend: { bg:"#fdf0e6", text:"#8a3a00" },
  flex:    { bg:"#f0f0f0", text:"#555" },
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────────────────────
async function loadData(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function saveData(key, val) {
  try { if (val===null) await window.storage.delete(key); else await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
function analyseHistory(history) {
  const insights = [];
  if (!history || history.length === 0) return insights;
  const now = Date.now(), week = 7*24*3600*1000;
  const thisWeek = history.filter(s=>now-s.timestamp<week).length;
  const prevWeek = history.filter(s=>now-s.timestamp>=week&&now-s.timestamp<2*week).length;
  if (thisWeek===0) {
    const days = Math.floor((now-history[0].timestamp)/(24*3600*1000));
    insights.push({type:"warning",icon:"⏸",title:"Training gap",body:`No sessions this week. Last session ${days} day${days===1?"":"s"} ago.`});
  } else if (thisWeek>prevWeek+1) {
    insights.push({type:"positive",icon:"↑",title:"Strong week",body:`${thisWeek} sessions this week vs ${prevWeek} last week.`});
  }
  const recent5 = history.slice(0,5).map(s=>s.sessionKey);
  const unique = [...new Set(recent5)];
  if (recent5.length>=4&&unique.length===1) {
    insights.push({type:"info",icon:"↻",title:"Low variety",body:`${DEFAULT_SESSIONS[unique[0]]?.name||unique[0]} done ${recent5.length} times in a row. Mix it up.`});
  }
  const feels = history.slice(0,5).map(s=>s.feel).filter(Boolean);
  if (feels.length>=3) {
    const avg = feels.reduce((a,b)=>a+b,0)/feels.length;
    if (avg<=2.5) insights.push({type:"warning",icon:"⚡",title:"Consider a deload",body:`Average feel ${avg.toFixed(1)}/5 over last ${feels.length} sessions.`});
    if (avg>=4.5) insights.push({type:"positive",icon:"★",title:"Feeling strong",body:`Average feel ${avg.toFixed(1)}/5 — consistent energy.`});
  }
  const exMap = {};
  history.slice(0,8).forEach(s=>{
    (s.exercises||[]).forEach(ex=>{
      if (!exMap[ex.name]) exMap[ex.name]=[];
      const tgt = ex.sets*(typeof ex.reps==="number"?ex.reps:0);
      const act = Object.entries(s.actualReps||{}).filter(([k])=>k.startsWith(ex.id+"-")).reduce((a,[,v])=>a+(typeof v==="number"?v:0),0);
      if (tgt>0) exMap[ex.name].push(act/tgt);
    });
  });
  Object.entries(exMap).forEach(([name,rs])=>{
    if (rs.length<3) return;
    if (rs.slice(0,3).every(r=>r<0.8)) insights.push({type:"adjust",icon:"▼",title:`${name}: consistently short`,body:"Hit <80% for 3+ sessions. Consider dropping the rep target."});
    if (rs.slice(0,3).every(r=>r>1.15)) insights.push({type:"adjust",icon:"▲",title:`${name}: exceeding target`,body:"Regularly beating target. Time to progress reps or add tempo."});
  });
  Object.keys(DEFAULT_SESSIONS).filter(k=>k!=="E").forEach(key=>{
    const last = history.find(s=>s.sessionKey===key);
    if (!last) return;
    const days = Math.floor((now-last.timestamp)/(24*3600*1000));
    if (days>=14) insights.push({type:"info",icon:"!",title:`${DEFAULT_SESSIONS[key].name} overdue`,body:`Last done ${days} days ago.`});
  });
  return insights.slice(0,5);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO
// ─────────────────────────────────────────────────────────────────────────────
function playTone(freq=880,dur=0.12,vol=0.35) {
  try {
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=freq;
    g.gain.setValueAtTime(vol,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.start();o.stop(ctx.currentTime+dur);
  } catch{}
}
function playLogBeep() { playTone(700,0.1,0.25); }
function playCountBeep() { playTone(880,0.08,0.3); }
function playRestDone() { playTone(550,0.1,0.4); setTimeout(()=>playTone(770,0.2,0.4),130); }

// ─────────────────────────────────────────────────────────────────────────────
// WAKE LOCK
// ─────────────────────────────────────────────────────────────────────────────
function useWakeLock() {
  const lock=useRef(null);
  const acquire=useCallback(async()=>{ try{if("wakeLock"in navigator)lock.current=await navigator.wakeLock.request("screen");}catch{} },[]);
  const release=useCallback(()=>{ try{if(lock.current){lock.current.release();lock.current=null;}}catch{} },[]);
  return{acquire,release};
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
function buildSummary(sessionKey, exercises, actualReps, bellsUsed, feel, notes, durationMin, finisher) {
  const def = DEFAULT_SESSIONS[sessionKey];
  const lines = [
    "KETTLEBELL SESSION REPORT",
    "─".repeat(33),
    `Session: ${def?.name} — ${def?.subtitle}`,
    `Duration: ${durationMin} min`,
    feel ? `Feel: ${"★".repeat(feel)}${"☆".repeat(5-feel)}` : "Feel: not rated",
    "",
    "EXERCISES:",
  ];
  exercises.forEach(ex=>{
    const actuals = Array.from({length:ex.sets},(_,i)=>actualReps[`${ex.id}-${i}`]??(typeof ex.reps==="number"?ex.reps:ex.reps));
    const firstBell = bellsUsed[`${ex.id}-0`]||ex.bell;
    const tgt = typeof ex.reps==="number"?ex.sets*ex.reps:null;
    const act = actuals.reduce((a,b)=>a+(typeof b==="number"?b:0),0);
    const diff = tgt!==null?act-tgt:null;
    const setsStr = actuals.map((r,i)=>{
      const b=bellsUsed[`${ex.id}-${i}`]||ex.bell;
      return (i>0&&b!==firstBell)?`${r}[${b}]`:`${r}`;
    }).join(" / ");
    lines.push(`  ${ex.name} · ${firstBell}`);
    lines.push(`  Sets: ${setsStr} (target ${ex.reps})`+(tgt!==null?` → total ${act} (${diff===0?"on target":diff>0?`+${diff} above target`:`${diff} below target`})`:""));
  });
  if (finisher) {
    lines.push("","FINISHER:", `  ${finisher.name} · ${finisher.bell} · ${finisher.sets}×${finisher.reps}`);
  }
  if (notes) { lines.push("", `NOTE: ${notes}`); }
  lines.push("─".repeat(33));
  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:"#f5f3ef", white:"#ffffff", text:"#1a1a1a", muted:"#888", faint:"#bbb",
  border:"#e8e4df", card:"#ffffff",
  weekday:"#1a3a6b", weekend:"#8a3a00",
};

const s = {
  app:{fontFamily:"'DM Sans',system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"},
  screen:{paddingBottom:80,minHeight:"100vh"},
  header:{padding:"14px 20px 12px",background:C.bg,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10},
  card:{background:C.white,borderRadius:16,padding:"14px 18px",marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"},
  navBar:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:20,paddingBottom:"env(safe-area-inset-bottom,0)"},
  navBtn:(a)=>({flex:1,padding:"10px 0 12px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:a?C.text:C.faint,fontFamily:"inherit"}),
  btn:(bg="#1a1a1a",full=false)=>({background:bg,color:"#fff",border:"none",borderRadius:12,padding:"14px 22px",fontSize:16,fontWeight:600,cursor:"pointer",width:full?"100%":"auto",fontFamily:"inherit",transition:"opacity 0.15s"}),
  btnOutline:{background:"transparent",color:C.text,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 18px",fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:"inherit"},
  sectionLabel:{fontSize:11,fontWeight:600,color:C.faint,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8},
  insightBg:{warning:["#fff8e1","#b45309"],positive:["#f0fdf4","#166534"],info:["#eff6ff","#1e40af"],adjust:["#fdf4ff","#7e22ce"]},
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function TagBadge({type,label}) {
  const ts=TAG_STYLES[type]||TAG_STYLES.flex;
  return <span style={{background:ts.bg,color:ts.text,borderRadius:8,padding:"2px 9px",fontSize:11,fontWeight:600}}>{label}</span>;
}

function BellBadge({bell}) {
  const bs=BELLS[bell]||BELLS["—"];
  return <span style={{background:bs.selected.bg,color:bs.selected.text,borderRadius:16,padding:"3px 10px",fontSize:12,fontWeight:700}}>{bell}</span>;
}

function InsightCard({ins}) {
  const [bg,tc]=s.insightBg[ins.type]||["#f5f5f5","#333"];
  return (
    <div style={{background:bg,borderRadius:12,padding:"11px 14px",marginBottom:8,borderLeft:`3px solid ${tc}`,display:"flex",gap:10,alignItems:"flex-start"}}>
      <span style={{fontSize:16,lineHeight:1.3}}>{ins.icon}</span>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{ins.title}</div>
        <div style={{fontSize:12,color:"#555",lineHeight:1.4}}>{ins.body}</div>
      </div>
    </div>
  );
}

function FeelStars({value,onChange}) {
  return (
    <div style={{display:"flex",gap:6,justifyContent:"center"}}>
      {[1,2,3,4,5].map(n=>(
        <button key={n} onClick={()=>onChange(n)} style={{background:"none",border:"none",fontSize:38,cursor:"pointer",opacity:value&&n<=value?1:0.2,lineHeight:1,padding:4,transition:"opacity 0.15s"}}>★</button>
      ))}
    </div>
  );
}

// Segmented progress bar: divided by exercises, subdivided by sets
function SegmentedProgress({exercises,exIdx,setIdx,setsLogged,totalSets,color}) {
  return (
    <div style={{padding:"0 20px",marginBottom:4}}>
      <div style={{display:"flex",gap:3,alignItems:"stretch",height:10}}>
        {exercises.map((ex,ei)=>(
          <div key={ex.id} style={{flex:ex.sets,display:"flex",gap:1.5,borderRadius:5,overflow:"hidden"}}>
            {Array.from({length:ex.sets},(_,si)=>{
              const done=(ei<exIdx)||(ei===exIdx&&si<setIdx);
              const current=ei===exIdx&&si===setIdx;
              return (
                <div key={si} style={{flex:1,background:done?color:current?"rgba(26,58,107,0.25)":"rgba(0,0,0,0.08)",borderRadius:2,transition:"background 0.3s",animation:current?"pulse 1.5s ease-in-out infinite":undefined}}/>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        {exercises.map((ex,ei)=>(
          <div key={ex.id} style={{flex:ex.sets,textAlign:"center",fontSize:9,color:ei===exIdx?color:C.faint,fontWeight:ei===exIdx?700:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:2}}>
            {ex.name.split(" ")[0]}
          </div>
        ))}
      </div>
    </div>
  );
}

// Circular rest timer overlay
function RestOverlay({secs,total=60,onSkip}) {
  const r=72, circ=2*Math.PI*r;
  const pct=secs/total;
  const dash=circ*pct;
  const urgent=secs<=10;
  const ringColor=urgent?"#e85d26":"#1a3a6b";
  const numColor=urgent?"#e85d26":"#fff";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,10,10,0.82)",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{color:"#aaa",fontSize:13,marginBottom:20,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>Rest</div>
      <div style={{position:"relative",width:180,height:180,marginBottom:28}}>
        <svg width="180" height="180" style={{transform:"rotate(-90deg)"}}>
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7"/>
          <circle cx="90" cy="90" r={r} fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{transition:"stroke-dasharray 0.9s linear, stroke 0.3s"}}
          />
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:68,fontWeight:800,color:numColor,fontFamily:"'DM Sans',system-ui",lineHeight:1,transition:"color 0.3s"}}>{secs}</span>
        </div>
      </div>
      <div style={{fontSize:13,color:"#888",marginBottom:16}}>
        {secs>0?"Next up soon...":"Time's up!"}
      </div>
      <button onClick={onSkip} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:10,padding:"10px 28px",fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
        Skip rest
      </button>
    </div>
  );
}

// Exercise transition card
function TransitionCard({nextEx,onContinue}) {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{ requestAnimationFrame(()=>setVisible(true)); const t=setTimeout(onContinue,2200); return()=>clearTimeout(t); },[]);
  return (
    <div style={{position:"fixed",inset:0,background:"#111",zIndex:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 0.3s",opacity:visible?1:0}}>
      <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#666",marginBottom:16,fontWeight:600}}>Next exercise</div>
      <div style={{fontSize:34,fontWeight:800,color:"#fff",textAlign:"center",padding:"0 32px",lineHeight:1.15,marginBottom:12}}>{nextEx?.name}</div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <BellBadge bell={nextEx?.bell||"—"}/>
        <span style={{fontSize:14,color:"#888"}}>{nextEx?.sets} × {nextEx?.reps}</span>
      </div>
    </div>
  );
}

// Pause overlay
function PauseOverlay({onResume,onExit}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,10,10,0.9)",zIndex:95,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:8}}>Paused</div>
      <button onClick={onResume} style={{background:"#f5cc00",color:"#1a1200",border:"none",borderRadius:12,padding:"14px 40px",fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"inherit",width:220}}>Resume</button>
      <button onClick={onExit} style={{background:"rgba(255,255,255,0.1)",color:"#aaa",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"12px 40px",fontSize:15,cursor:"pointer",fontFamily:"inherit",width:220}}>Exit session</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────────────

function HomeScreen({history,sessions,onStart,hasDraft,onResumeDraft}) {
  const insights=analyseHistory(history);
  const weekCount=history.filter(h=>Date.now()-h.timestamp<7*24*3600*1000).length;
  const streak=(()=>{
    if(!history.length)return 0;
    let n=0,prev=new Date();
    for(const h of history){const d=new Date(h.timestamp),diff=(prev-d)/(1000*3600*24);if(diff<2){n++;prev=d;}else break;}
    return n;
  })();
  return (
    <div style={s.screen}>
      <div style={{...s.header,flexDirection:"column",alignItems:"flex-start",gap:2}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Kettlebell</div>
        <div style={{fontSize:13,color:C.muted}}>{weekCount>0?`${weekCount} session${weekCount>1?"s":""} this week`:"No sessions yet this week"}{streak>1?` · ${streak}-day streak`:""}</div>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        {hasDraft&&(
          <div style={{...s.card,border:"2px solid #1a3a6b",marginBottom:14}}>
            <div style={{fontSize:13,color:"#1a3a6b",fontWeight:700,marginBottom:3}}>Session in progress</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:10}}>Resume where you left off?</div>
            <div style={{display:"flex",gap:8}}>
              <button style={s.btn("#1a3a6b")} onClick={()=>onResumeDraft(true)}>Resume</button>
              <button style={s.btnOutline} onClick={()=>onResumeDraft(false)}>Discard</button>
            </div>
          </div>
        )}
        {insights.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={s.sectionLabel}>Coaching notes</div>
            {insights.map((ins,i)=><InsightCard key={i} ins={ins}/>)}
          </div>
        )}
        <div style={s.sectionLabel}>Choose session</div>
        {Object.entries(sessions).map(([key,sess])=>{
          const last=history.find(h=>h.sessionKey===key);
          const daysAgo=last?Math.floor((Date.now()-last.timestamp)/(24*3600*1000)):null;
          return (
            <button key={key} onClick={()=>onStart(key)} style={{...s.card,width:"100%",textAlign:"left",cursor:"pointer",border:"none",display:"block"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:key!=="E"?8:0}}>
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:2}}>{sess.name}</div>
                  <div style={{fontSize:13,color:C.muted}}>{sess.subtitle}</div>
                </div>
                <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <TagBadge type={sess.tagType} label={sess.tag}/>
                  {daysAgo!==null&&<div style={{fontSize:11,color:C.faint}}>{daysAgo===0?"Today":daysAgo===1?"Yesterday":`${daysAgo}d ago`}</div>}
                </div>
              </div>
              {key!=="E"&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {sess.exercises.map(ex=>(
                    <span key={ex.id} style={{fontSize:11,color:C.muted,background:"#f5f3ef",borderRadius:6,padding:"2px 8px"}}>{ex.name}</span>
                  ))}
                </div>
              )}
              <div style={{fontSize:11,color:C.faint,marginTop:6}}>~{sess.estimatedMin} min</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewScreen({sessionKey,session,history,onStartWorkout,onBack,onSaveDefaults}) {
  const [exercises,setExercises]=useState(session.exercises.map(e=>({...e})));
  const [editIdx,setEditIdx]=useState(null);
  const [finisher,setFinisher]=useState(null);
  const [showFinisherPicker,setShowFinisherPicker]=useState(false);
  const [showAddExercise,setShowAddExercise]=useState(false);
  const [changed,setChanged]=useState(false);
  const [savePrompt,setSavePrompt]=useState(false);

  const last=history.filter(h=>h.sessionKey===sessionKey)[0];

  const update=(idx,field,val)=>{
    setExercises(prev=>prev.map((e,i)=>i===idx?{...e,[field]:field==="reps"||field==="sets"?Math.max(1,Number(val)):val}:e));
    setChanged(true);
  };

  const handleStart=()=>{
    if(changed){setSavePrompt(true);}
    else{onStartWorkout(exercises,finisher);}
  };

  if(showFinisherPicker) return (
    <div style={s.screen}>
      <div style={s.header}>
        <div style={{fontSize:18,fontWeight:700,color:C.text}}>Choose finisher</div>
        <button onClick={()=>setShowFinisherPicker(false)} style={{...s.btnOutline,padding:"8px 14px",fontSize:14}}>Done</button>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        <button onClick={()=>{setFinisher(null);setShowFinisherPicker(false);}}
          style={{...s.card,width:"100%",textAlign:"left",border:`2px solid ${!finisher?"#1a1a1a":"transparent"}`,cursor:"pointer",display:"block",marginBottom:10}}>
          <div style={{fontSize:15,fontWeight:600,color:C.muted}}>No finisher</div>
        </button>
        {FINISHERS.map(f=>(
          <button key={f.id} onClick={()=>{setFinisher(f);setShowFinisherPicker(false);}}
            style={{...s.card,width:"100%",textAlign:"left",border:`2px solid ${finisher?.id===f.id?"#1a1a1a":"transparent"}`,cursor:"pointer",display:"block"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>{f.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{f.sets}×{f.reps} · {f.note}</div>
              </div>
              <BellBadge bell={f.bell}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if(showAddExercise) return (
    <div style={s.screen}>
      <div style={s.header}>
        <div style={{fontSize:18,fontWeight:700,color:C.text}}>Add exercise</div>
        <button onClick={()=>setShowAddExercise(false)} style={{...s.btnOutline,padding:"8px 14px",fontSize:14}}>Done</button>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        {FLEX_MENU.filter(m=>!exercises.find(e=>e.name===m.name)).map(m=>(
          <button key={m.id} onClick={()=>{
            setExercises(prev=>[...prev,{...m,id:`custom-${Date.now()}`}]);
            setChanged(true);setShowAddExercise(false);
          }} style={{...s.card,width:"100%",textAlign:"left",cursor:"pointer",display:"block",border:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>{m.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{m.sets}×{m.reps} · {m.note}</div>
              </div>
              <BellBadge bell={m.bell}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.text}}>{session.name}</div>
          <div style={{fontSize:13,color:C.muted}}>{session.subtitle} · ~{session.estimatedMin} min</div>
        </div>
        <button onClick={onBack} style={{...s.btnOutline,padding:"8px 14px",fontSize:14}}>Back</button>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={s.sectionLabel}>Exercises {changed&&<span style={{color:"#b45309",fontStyle:"italic"}}>· edited</span>}</div>
        {exercises.map((ex,idx)=>{
          const prevSess=last?.exercises?.find(e=>e.name===ex.name);
          const prevTotal=prevSess?Object.entries(last.actualReps||{}).filter(([k])=>k.startsWith(prevSess.id+"-")).reduce((a,[,v])=>a+(typeof v==="number"?v:0),0):null;
          const isEdit=editIdx===idx;
          return (
            <div key={ex.id} style={{...s.card,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isEdit?10:0}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>{ex.name}</div>
                  {!isEdit&&<div style={{fontSize:13,color:C.muted}}>{ex.sets} sets × {ex.reps} reps · {ex.bell}</div>}
                  {!isEdit&&ex.note&&<div style={{fontSize:11,color:C.faint,fontStyle:"italic",marginTop:2}}>{ex.note}</div>}
                  {!isEdit&&prevTotal!==null&&(
                    <div style={{fontSize:11,color:"#888",marginTop:4}}>Last: {prevTotal} total reps</div>
                  )}
                </div>
                <button onClick={()=>setEditIdx(isEdit?null:idx)}
                  style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:C.muted,fontFamily:"inherit"}}>
                  {isEdit?"Done":"Edit"}
                </button>
              </div>
              {isEdit&&(
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                  <div style={{display:"flex",gap:12,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:C.faint,marginBottom:4}}>Sets</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <button onClick={()=>update(idx,"sets",ex.sets-1)} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:"none",fontSize:18,cursor:"pointer"}}>−</button>
                        <span style={{fontSize:18,fontWeight:700,minWidth:24,textAlign:"center"}}>{ex.sets}</span>
                        <button onClick={()=>update(idx,"sets",ex.sets+1)} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:"none",fontSize:18,cursor:"pointer"}}>+</button>
                      </div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:C.faint,marginBottom:4}}>Reps</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <button onClick={()=>update(idx,"reps",typeof ex.reps==="number"?ex.reps-1:ex.reps)} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:"none",fontSize:18,cursor:"pointer"}}>−</button>
                        <span style={{fontSize:18,fontWeight:700,minWidth:24,textAlign:"center"}}>{ex.reps}</span>
                        <button onClick={()=>update(idx,"reps",typeof ex.reps==="number"?ex.reps+1:ex.reps)} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:"none",fontSize:18,cursor:"pointer"}}>+</button>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:C.faint,marginBottom:6}}>Weight</div>
                  <div style={{display:"flex",gap:6}}>
                    {BELL_OPTIONS.map(b=>{
                      const sel=ex.bell===b;
                      const bs=bellStyle(b,sel);
                      return <button key={b} onClick={()=>update(idx,"bell",b)}
                        style={{flex:1,padding:"8px 0",border:"none",borderRadius:8,background:bs.bg,color:bs.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        {b}
                      </button>;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={()=>setShowAddExercise(true)}
          style={{...s.card,width:"100%",textAlign:"center",border:`1.5px dashed ${C.border}`,cursor:"pointer",color:C.muted,fontSize:14,display:"block",marginBottom:10,background:"transparent",boxShadow:"none"}}>
          + Add exercise
        </button>

        {/* Finisher row */}
        <button onClick={()=>setShowFinisherPicker(true)}
          style={{...s.card,width:"100%",textAlign:"left",cursor:"pointer",border:`1.5px solid ${finisher?"#1a1a1a":C.border}`,display:"block",marginBottom:16,boxShadow:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,color:C.faint,marginBottom:2}}>Finisher</div>
              <div style={{fontSize:14,fontWeight:600,color:finisher?C.text:C.muted}}>{finisher?finisher.name:"None selected"}</div>
            </div>
            <span style={{color:C.faint,fontSize:18}}>›</span>
          </div>
        </button>

        {savePrompt?(
          <div style={{...s.card,border:"2px solid #b45309",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:"#b45309",marginBottom:8}}>Save changes as new default?</div>
            <div style={{display:"flex",gap:8}}>
              <button style={s.btn("#b45309")} onClick={()=>{onSaveDefaults(sessionKey,exercises);setSavePrompt(false);onStartWorkout(exercises,finisher);}}>Save & start</button>
              <button style={s.btnOutline} onClick={()=>{setSavePrompt(false);onStartWorkout(exercises,finisher);}}>Just this session</button>
            </div>
          </div>
        ):(
          <button style={s.btn(session.color,true)} onClick={handleStart}>Start session →</button>
        )}
      </div>
    </div>
  );
}

function FlexPickerScreen({onConfirm,onBack}) {
  const [picked,setPicked]=useState([]);
  const toggle=(id)=>setPicked(p=>p.includes(id)?p.filter(x=>x!==id):p.length<6?[...p,id]:p);
  return (
    <div style={s.screen}>
      <div style={s.header}>
        <div><div style={{fontSize:18,fontWeight:700}}>Session E</div><div style={{fontSize:13,color:C.muted}}>Pick 4–6 exercises</div></div>
        <button onClick={onBack} style={{...s.btnOutline,padding:"8px 14px",fontSize:14}}>Back</button>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        {FLEX_MENU.map(ex=>{
          const sel=picked.includes(ex.id);
          return (
            <button key={ex.id} onClick={()=>toggle(ex.id)}
              style={{...s.card,width:"100%",textAlign:"left",border:`2px solid ${sel?"#1a1a1a":"transparent"}`,cursor:"pointer",display:"block"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>{ex.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{ex.sets}×{ex.reps} · {ex.note}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><BellBadge bell={ex.bell}/>{sel&&<span style={{fontSize:16}}>✓</span>}</div>
              </div>
            </button>
          );
        })}
        {picked.length>=4&&(
          <div style={{padding:"8px 0 0"}}>
            <button style={s.btn("#1a1a1a",true)} onClick={()=>onConfirm(FLEX_MENU.filter(e=>picked.includes(e.id)))}>
              Start with {picked.length} exercises →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutScreen({sessionKey,exercises,finisher,onDone,onExit,initialDraft}) {
  const def=DEFAULT_SESSIONS[sessionKey];
  const totalSets=exercises.reduce((a,e)=>a+e.sets,0);

  const [exIdx,setExIdx]       =useState(initialDraft?.exIdx??0);
  const [setIdx,setSetIdx]     =useState(initialDraft?.setIdx??0);
  const [actualReps,setActualReps]=useState(initialDraft?.actualReps??{});
  const [bellsUsed,setBellsUsed]  =useState(initialDraft?.bellsUsed??{});
  const [restSecs,setRestSecs] =useState(null);
  const [restTotal,setRestTotal]=useState(60);
  const [elapsed,setElapsed]   =useState(initialDraft?.elapsed??0);
  const [setsLogged,setSetsLogged]=useState(initialDraft?.setsLogged??0);
  const [paused,setPaused]     =useState(false);
  const [transition,setTransition]=useState(null);

  const {acquire,release}=useWakeLock();
  const restRef=useRef(null);
  const elapsedRef=useRef(null);
  const pausedRef=useRef(false);

  useEffect(()=>{acquire();return()=>release();},[]);

  useEffect(()=>{
    elapsedRef.current=setInterval(()=>{ if(!pausedRef.current) setElapsed(e=>e+1); },1000);
    return()=>clearInterval(elapsedRef.current);
  },[]);

  useEffect(()=>{pausedRef.current=paused;},[paused]);

  // Rest countdown with beeps
  useEffect(()=>{
    if(restSecs===null)return;
    if(restSecs===0){playRestDone();setRestSecs(null);return;}
    if(restSecs<=10)playCountBeep();
    restRef.current=setTimeout(()=>setRestSecs(r=>r-1),1000);
    return()=>clearTimeout(restRef.current);
  },[restSecs]);

  // Persist draft
  useEffect(()=>{
    saveData("kb_draft",{sessionKey,exercises,exIdx,setIdx,actualReps,bellsUsed,elapsed,setsLogged,finisher});
  },[exIdx,setIdx,actualReps,bellsUsed,setsLogged]);

  const ex=exercises[exIdx];
  const key=`${ex?.id}-${setIdx}`;
  const currentBell=bellsUsed[key]||ex?.bell||"—";
  const targetReps=typeof ex?.reps==="number"?ex.reps:0;
  const currentReps=actualReps.hasOwnProperty(key)?actualReps[key]:targetReps;
  const isTimeBased=typeof ex?.reps==="string";
  const repDiff=isTimeBased?null:currentReps-targetReps;

  const adjustReps=(d)=>setActualReps(prev=>({...prev,[key]:Math.max(0,(prev.hasOwnProperty(key)?prev[key]:targetReps)+d)}));

  const logSet=()=>{
    playLogBeep();
    // ensure current set is recorded
    setActualReps(prev=>prev.hasOwnProperty(key)?prev:{...prev,[key]:targetReps});
    setSetsLogged(n=>n+1);
    const nextSet=setIdx+1;
    if(nextSet<ex.sets){
      setSetIdx(nextSet);
      const nk=`${ex.id}-${nextSet}`;
      setBellsUsed(prev=>({...prev,[nk]:currentBell}));
      setRestSecs(60);setRestTotal(60);
    } else {
      const nextEx=exIdx+1;
      if(nextEx<exercises.length){
        setRestSecs(60);setRestTotal(60);
        setTransition(exercises[nextEx]);
        setTimeout(()=>{ setExIdx(nextEx);setSetIdx(0);setTransition(null); },2200);
      } else {
        clearInterval(elapsedRef.current);
        release();
        saveData("kb_draft",null);
        onDone({actualReps,bellsUsed,durationMin:Math.round(elapsed/60),finisher});
      }
    }
  };

  const elapsedStr=`${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,"0")}`;
  const isLastSetOfExercise=setIdx===ex?.sets-1;
  const isLastExercise=exIdx===exercises.length-1;
  const logLabel=isLastSetOfExercise&&isLastExercise?"Finish session ✓":isLastSetOfExercise?"Next exercise →":"Log set →";

  // Set dots
  const setDots=Array.from({length:ex?.sets||0},(_,i)=>{
    const done=i<setIdx;
    const current=i===setIdx;
    return {done,current};
  });

  return (
    <div style={{...s.screen,background:"#fff",paddingBottom:0}}>
      {/* Header */}
      <div style={{...s.header,background:"#fff",padding:"12px 20px"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:def?.color||C.text,letterSpacing:"0.02em"}}>
            Exercise {exIdx+1}/{exercises.length}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,textAlign:"center",letterSpacing:"0.01em"}}>{elapsedStr}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPaused(true)}
            style={{background:"#f5f3ef",border:"none",borderRadius:8,padding:"7px 12px",fontSize:14,cursor:"pointer",color:C.muted}}>
            ⏸
          </button>
          <button onClick={()=>{release();onExit();}}
            style={{background:"#f5f3ef",border:"none",borderRadius:8,padding:"7px 12px",fontSize:13,cursor:"pointer",color:C.muted}}>
            Exit
          </button>
        </div>
      </div>

      {/* Segmented progress */}
      <SegmentedProgress exercises={exercises} exIdx={exIdx} setIdx={setIdx} setsLogged={setsLogged} totalSets={totalSets} color={def?.color||"#1a1a1a"}/>

      <div style={{padding:"4px 20px 0"}}>
        {/* Exercise name + set dots */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:26,fontWeight:800,color:C.text,marginBottom:6,lineHeight:1.1}}>{ex?.name}</div>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
            {setDots.map((d,i)=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:d.done?"#1a1a1a":d.current?(def?.color||"#1a1a1a"):"#e0ddd8",transition:"background 0.3s",border:d.current?`2px solid ${def?.color||"#1a1a1a"}`:"none",animation:d.current?"pulse 1.5s ease-in-out infinite":undefined}}/>
            ))}
            <span style={{fontSize:12,color:C.muted,marginLeft:4}}>Set {setIdx+1} of {ex?.sets}</span>
          </div>
          {ex?.note&&<div style={{fontSize:13,color:C.muted,fontStyle:"italic"}}>{ex.note}</div>}
        </div>

        {/* Bell selector */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:C.faint,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Weight</div>
          <div style={{display:"flex",gap:8}}>
            {BELL_OPTIONS.map(b=>{
              const sel=currentBell===b;
              const bs=bellStyle(b,sel);
              return (
                <button key={b} onClick={()=>{
                  const newBells={...bellsUsed,[key]:b};
                  for(let si=setIdx+1;si<ex.sets;si++){const k2=`${ex.id}-${si}`;if(!newBells[k2])newBells[k2]=b;}
                  setBellsUsed(newBells);
                }}
                  style={{flex:1,padding:"11px 0",border:"none",borderRadius:10,background:bs.bg,color:bs.text,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rep counter */}
        {isTimeBased?(
          <div style={{textAlign:"center",padding:"16px 0 20px"}}>
            <div style={{fontSize:52,fontWeight:800,color:C.text}}>{ex.reps}</div>
            <div style={{fontSize:14,color:C.muted}}>hold / carry for prescribed duration</div>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0 16px"}}>
            <button onClick={()=>adjustReps(-1)}
              style={{width:72,height:72,borderRadius:"50%",border:`2px solid ${C.border}`,background:"transparent",fontSize:30,fontWeight:700,cursor:"pointer",color:C.text,fontFamily:"inherit"}}>
              −
            </button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:88,fontWeight:800,lineHeight:1,color:repDiff===0||repDiff===null?"#1a1a1a":repDiff>0?"#166534":"#991b1b",transition:"color 0.2s"}}>
                {currentReps}
              </div>
              <div style={{fontSize:13,color:C.faint}}>target {ex.reps}</div>
              {repDiff!==0&&repDiff!==null&&(
                <div style={{fontSize:13,fontWeight:700,color:repDiff>0?"#166534":"#991b1b"}}>{repDiff>0?"+":""}{repDiff}</div>
              )}
            </div>
            <button onClick={()=>adjustReps(1)}
              style={{width:72,height:72,borderRadius:"50%",border:`2px solid ${C.border}`,background:"transparent",fontSize:30,fontWeight:700,cursor:"pointer",color:C.text,fontFamily:"inherit"}}>
              +
            </button>
          </div>
        )}

        {/* Up next */}
        <div style={{background:"#f5f3ef",borderRadius:10,padding:"9px 13px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,color:C.faint,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>Up next</div>
          <div style={{fontSize:13,color:"#555"}}>
            {setIdx+1<ex?.sets?`${ex.name} · Set ${setIdx+2} of ${ex.sets}`:exIdx+1<exercises.length?`${exercises[exIdx+1].name} — ${exercises[exIdx+1].sets}×${exercises[exIdx+1].reps}`:"Last set — finish strong"}
          </div>
        </div>

        <button style={{...s.btn(def?.color||"#1a1a1a",true),marginBottom:6}} onClick={logSet}>
          {logLabel} <span style={{fontSize:13,opacity:0.7,fontWeight:400}}>· 60s rest</span>
        </button>
      </div>

      {restSecs!==null&&<RestOverlay secs={restSecs} total={restTotal} onSkip={()=>{ clearTimeout(restRef.current);setRestSecs(null); }}/>}
      {transition&&<TransitionCard nextEx={transition} onContinue={()=>setTransition(null)}/>}
      {paused&&<PauseOverlay onResume={()=>setPaused(false)} onExit={()=>{release();saveData("kb_draft",null);onExit();}}/>}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

function DoneScreen({sessionKey,exercises,actualReps,bellsUsed,durationMin,finisher,onSave}) {
  const [feel,setFeel]=useState(null);
  const [notes,setNotes]=useState("");
  const [copied,setCopied]=useState(false);
  const [showWellDone,setShowWellDone]=useState(true);
  const def=DEFAULT_SESSIONS[sessionKey];

  useEffect(()=>{ const t=setTimeout(()=>setShowWellDone(false),1800);return()=>clearTimeout(t); },[]);

  if(showWellDone) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#111"}}>
      <div style={{fontSize:52,marginBottom:16}}>✓</div>
      <div style={{fontSize:28,fontWeight:800,color:"#fff"}}>Session done</div>
      <div style={{fontSize:15,color:"#666",marginTop:6}}>{durationMin} min · {exercises.reduce((a,e)=>a+e.sets,0)} sets</div>
    </div>
  );

  const summary=buildSummary(sessionKey,exercises,actualReps,bellsUsed,feel,notes,durationMin,finisher);

  return (
    <div style={s.screen}>
      <div style={{...s.header,flexDirection:"column",alignItems:"flex-start",gap:1}}>
        <div style={{fontSize:13,color:def?.color||C.text,fontWeight:700}}>Complete</div>
        <div style={{fontSize:20,fontWeight:800,color:C.text}}>{def?.name}</div>
        <div style={{fontSize:13,color:C.muted}}>{durationMin} min · {exercises.reduce((a,e)=>a+e.sets,0)} sets{finisher?` · ${finisher.name}`:""}</div>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={{...s.card,marginBottom:14}}>
          {exercises.map(ex=>{
            const acts=Array.from({length:ex.sets},(_,i)=>actualReps[`${ex.id}-${i}`]??(typeof ex.reps==="number"?ex.reps:ex.reps));
            const tgt=typeof ex.reps==="number"?ex.sets*ex.reps:null;
            const act=acts.reduce((a,b)=>a+(typeof b==="number"?b:0),0);
            const diff=tgt!==null?act-tgt:null;
            const firstBell=bellsUsed[`${ex.id}-0`]||ex.bell;
            return (
              <div key={ex.id} style={{borderBottom:`1px solid #f0ede9`,paddingBottom:10,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{ex.name}</div>
                  <BellBadge bell={firstBell}/>
                </div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}>
                  {acts.map((r,i)=>{
                    const b=bellsUsed[`${ex.id}-${i}`]||ex.bell;
                    const devBell=i>0&&b!==firstBell;
                    return <span key={i} style={{fontSize:13,fontWeight:600,color:typeof r==="number"&&r>ex.reps?"#166534":typeof r==="number"&&r<ex.reps?"#991b1b":"#555"}}>
                      {r}{devBell?<span style={{fontSize:10,color:C.muted}}>[{b}]</span>:""}{i<acts.length-1?<span style={{color:"#ddd"}}> /</span>:""}
                    </span>;
                  })}
                </div>
                {diff!==null&&<div style={{fontSize:12,color:diff>0?"#166534":diff<0?"#991b1b":C.muted}}>{act} total · {diff===0?"on target":diff>0?`+${diff} above`:diff<0?`${diff} below`:""} target</div>}
              </div>
            );
          })}
        </div>

        <div style={{...s.card,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>How did it feel?</div>
          <FeelStars value={feel} onChange={setFeel}/>
          {!feel&&<div style={{fontSize:12,color:C.faint,textAlign:"center",marginTop:6}}>Tap to rate</div>}
        </div>

        <div style={{...s.card,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>Notes</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything to note..."
            style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:10,fontSize:14,fontFamily:"inherit",resize:"none",minHeight:68,boxSizing:"border-box",background:"#f9f7f4",color:C.text}}/>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button style={s.btn(def?.color||"#1a1a1a",true)} onClick={()=>onSave({feel,notes})}>Save session</button>
          <button style={{...s.btnOutline,width:"100%"}} onClick={()=>{
            navigator.clipboard?.writeText(summary).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
          }}>{copied?"Copied ✓":"Copy summary for Claude"}</button>
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({history,onDelete}) {
  const [expanded,setExpanded]=useState(null);
  const [longPress,setLongPress]=useState(null);
  const pressTimer=useRef(null);
  const insights=analyseHistory(history);

  const startPress=(ts)=>{ pressTimer.current=setTimeout(()=>setLongPress(ts),600); };
  const endPress=()=>{ clearTimeout(pressTimer.current); };

  if(!history.length) return (
    <div style={{...s.screen,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:80}}>
      <div style={{fontSize:40,marginBottom:14}}>📋</div>
      <div style={{fontSize:18,fontWeight:700,color:C.text}}>No sessions yet</div>
      <div style={{fontSize:14,color:C.muted,marginTop:4}}>Complete your first session to see history</div>
    </div>
  );

  const weeks={};
  history.forEach(h=>{
    const d=new Date(h.timestamp);
    const ws=new Date(d);ws.setDate(d.getDate()-d.getDay());
    const k=ws.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    if(!weeks[k])weeks[k]=[];
    weeks[k].push(h);
  });

  return (
    <div style={s.screen}>
      <div style={s.header}><div style={{fontSize:20,fontWeight:800,color:C.text}}>History</div></div>
      <div style={{padding:"16px 20px 0"}}>
        {insights.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={s.sectionLabel}>Coaching notes</div>
            {insights.map((ins,i)=><InsightCard key={i} ins={ins}/>)}
          </div>
        )}
        {history.length>=3&&(
          <div style={{...s.card,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Feel trend</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:56}}>
              {history.slice(0,12).reverse().map((h,i)=>{
                const pct=((h.feel||0)/5)*100;
                const col=h.feel>=4?"#166534":h.feel<=2?"#991b1b":"#1a3a6b";
                return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",height:`${pct}%`,background:col,borderRadius:"3px 3px 0 0",minHeight:4}}/>
                  <div style={{fontSize:9,color:C.faint}}>{new Date(h.timestamp).getDate()}</div>
                </div>;
              })}
            </div>
          </div>
        )}
        {Object.entries(weeks).map(([week,sessions])=>(
          <div key={week}>
            <div style={{...s.sectionLabel,marginTop:8}}>Week of {week} · {sessions.length} session{sessions.length>1?"s":""}</div>
            {sessions.map((h,i)=>{
              const def=DEFAULT_SESSIONS[h.sessionKey];
              const isOpen=expanded===h.timestamp;
              return (
                <div key={i}>
                  <button
                    onMouseDown={()=>startPress(h.timestamp)} onMouseUp={endPress}
                    onTouchStart={()=>startPress(h.timestamp)} onTouchEnd={endPress}
                    onClick={()=>setExpanded(isOpen?null:h.timestamp)}
                    style={{...s.card,width:"100%",textAlign:"left",border:"none",cursor:"pointer",display:"block",marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:C.text}}>{def?.name||h.sessionKey}</div>
                        <div style={{fontSize:12,color:C.muted}}>
                          {new Date(h.timestamp).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}
                          {h.durationMin?` · ${h.durationMin} min`:""}
                          {h.finisher?` · ${h.finisher}`:""}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {h.feel?<span style={{color:"#f59e0b",fontSize:14}}>{"★".repeat(h.feel)}</span>:<span style={{color:C.faint,fontSize:12}}>—</span>}
                        <span style={{color:C.faint,fontSize:13}}>{isOpen?"▲":"▼"}</span>
                      </div>
                    </div>
                    {isOpen&&(
                      <div style={{marginTop:10,borderTop:`1px solid #f0ede9`,paddingTop:10}}>
                        {(h.exercises||[]).map((ex,j)=>{
                          const acts=Object.entries(h.actualReps||{}).filter(([k])=>k.startsWith(ex.id+"-")).map(([,v])=>v);
                          const t=ex.sets*(typeof ex.reps==="number"?ex.reps:0);
                          const a=acts.reduce((x,b)=>x+(typeof b==="number"?b:0),0);
                          const d=a-t;
                          return <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                            <span style={{color:"#555"}}>{ex.name}</span>
                            <span style={{fontWeight:600,color:d>0?"#166534":d<0?"#991b1b":C.muted}}>{a}{d!==0?` (${d>0?"+":""}${d})`:""}</span>
                          </div>;
                        })}
                        {h.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic",borderTop:`1px solid #f0ede9`,paddingTop:8,marginTop:8}}>{h.notes}</div>}
                      </div>
                    )}
                  </button>
                  {longPress===h.timestamp&&(
                    <div style={{...s.card,border:"2px solid #991b1b",marginTop:-4,marginBottom:8}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#991b1b",marginBottom:6}}>Delete this session?</div>
                      <div style={{display:"flex",gap:8}}>
                        <button style={s.btn("#991b1b")} onClick={()=>{onDelete(h.timestamp);setLongPress(null);}}>Delete</button>
                        <button style={s.btnOutline} onClick={()=>setLongPress(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressScreen({history,sessions}) {
  const exNames=[...new Set(Object.values(sessions).flatMap(s=>s.exercises.map(e=>e.name)))];
  const [selected,setSelected]=useState(exNames[0]||"");

  const dataPoints=history.map(h=>{
    const ex=h.exercises?.find(e=>e.name===selected);
    if(!ex)return null;
    const acts=Object.entries(h.actualReps||{}).filter(([k])=>k.startsWith(ex.id+"-")).map(([,v])=>v);
    const total=acts.reduce((a,b)=>a+(typeof b==="number"?b:0),0);
    const tgt=ex.sets*(typeof ex.reps==="number"?ex.reps:0);
    return{date:h.timestamp,total,target:tgt,ratio:tgt>0?total/tgt:1};
  }).filter(Boolean).reverse().slice(-10);

  const maxVal=Math.max(...dataPoints.map(d=>d.total),1);

  return (
    <div style={s.screen}>
      <div style={s.header}><div style={{fontSize:20,fontWeight:800,color:C.text}}>Progress</div></div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={s.sectionLabel}>Exercise</div>
        <div style={{overflowX:"auto",display:"flex",gap:8,marginBottom:16,paddingBottom:4}}>
          {exNames.map(n=>(
            <button key={n} onClick={()=>setSelected(n)}
              style={{whiteSpace:"nowrap",padding:"7px 14px",borderRadius:20,border:`1.5px solid ${selected===n?C.text:C.border}`,background:selected===n?C.text:"transparent",color:selected===n?"#fff":C.muted,fontSize:13,fontWeight:selected===n?700:400,cursor:"pointer",fontFamily:"inherit"}}>
              {n}
            </button>
          ))}
        </div>
        {dataPoints.length===0?(
          <div style={{...s.card,textAlign:"center",padding:"32px 20px"}}>
            <div style={{color:C.muted,fontSize:14}}>No data for {selected} yet</div>
          </div>
        ):(
          <>
            <div style={s.card}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Total reps per session</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,marginBottom:8}}>
                {dataPoints.map((d,i)=>{
                  const h=(d.total/maxVal)*100;
                  const col=d.ratio>=1?"#166534":d.ratio>=0.8?"#1a3a6b":"#991b1b";
                  return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:10,color:col,fontWeight:700}}>{d.total}</div>
                    <div style={{width:"100%",height:`${h}%`,background:col,borderRadius:"4px 4px 0 0",minHeight:4}}/>
                    <div style={{fontSize:9,color:C.faint}}>{new Date(d.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"}).replace(" ","")}</div>
                  </div>;
                })}
              </div>
              <div style={{display:"flex",gap:12,fontSize:11}}>
                <span style={{color:"#166534"}}>● on/above target</span>
                <span style={{color:"#1a3a6b"}}>● near target</span>
                <span style={{color:"#991b1b"}}>● below target</span>
              </div>
            </div>
            <div style={{...s.card,display:"flex",gap:0}}>
              {[["Best",Math.max(...dataPoints.map(d=>d.total))],["Latest",dataPoints[dataPoints.length-1]?.total],["Avg",Math.round(dataPoints.reduce((a,d)=>a+d.total,0)/dataPoints.length)]].map(([l,v])=>(
                <div key={l} style={{flex:1,textAlign:"center",borderRight:l!=="Avg"?`1px solid ${C.border}`:"none",padding:"0 8px"}}>
                  <div style={{fontSize:24,fontWeight:800,color:C.text}}>{v}</div>
                  <div style={{fontSize:11,color:C.faint}}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsScreen({settings,onUpdate}) {
  return (
    <div style={s.screen}>
      <div style={s.header}><div style={{fontSize:20,fontWeight:800,color:C.text}}>Settings</div></div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={s.sectionLabel}>Rest timer</div>
        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:15,fontWeight:600,color:C.text}}>Duration</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>onUpdate("restDuration",Math.max(15,settings.restDuration-15))} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:"none",fontSize:18,cursor:"pointer"}}>−</button>
              <span style={{fontSize:16,fontWeight:700,minWidth:40,textAlign:"center"}}>{settings.restDuration}s</span>
              <button onClick={()=>onUpdate("restDuration",Math.min(180,settings.restDuration+15))} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:"none",fontSize:18,cursor:"pointer"}}>+</button>
            </div>
          </div>
        </div>
        <div style={s.sectionLabel}>Audio</div>
        <div style={s.card}>
          {[["soundEnabled","Rest timer beeps"],["logBeep","Set logged beep"]].map(([k,label])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:15,color:C.text}}>{label}</div>
              <button onClick={()=>onUpdate(k,!settings[k])}
                style={{width:48,height:26,borderRadius:13,background:settings[k]?"#1a3a6b":"#e0ddd8",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:settings[k]?24:3,transition:"left 0.2s"}}/>
              </button>
            </div>
          ))}
        </div>
        <div style={s.sectionLabel}>About</div>
        <div style={{...s.card,color:C.muted,fontSize:13,lineHeight:1.6}}>
          Kettlebell Trainer · Personal use<br/>
          Sessions: A–D structured · E flex<br/>
          Paste "Copy summary" output into Claude for coaching feedback.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]           =useState("home");
  const [screen,setScreen]     =useState("home");
  const [sessionKey,setSessionKey]=useState(null);
  const [exercises,setExercises]=useState([]);
  const [finisher,setFinisher] =useState(null);
  const [history,setHistory]   =useState([]);
  const [sessions,setSessions] =useState(DEFAULT_SESSIONS);
  const [draft,setDraft]       =useState(null);
  const [doneData,setDoneData] =useState(null);
  const [settings,setSettings] =useState({restDuration:60,soundEnabled:true,logBeep:true});
  const [loading,setLoading]   =useState(true);

  useEffect(()=>{
    Promise.all([
      loadData("kb_history"),
      loadData("kb_draft"),
      loadData("kb_sessions"),
      loadData("kb_settings"),
    ]).then(([h,d,sess,sett])=>{
      if(h)setHistory(h);
      if(d)setDraft(d);
      if(sess)setSessions({...DEFAULT_SESSIONS,...sess});
      if(sett)setSettings(prev=>({...prev,...sett}));
      setLoading(false);
    });
  },[]);

  const updateSetting=(k,v)=>{
    const updated={...settings,[k]:v};
    setSettings(updated);
    saveData("kb_settings",updated);
  };

  const handleStart=(key)=>{ setSessionKey(key); setScreen("preview"); };

  const handleResumeDraft=(resume)=>{
    if(resume&&draft){
      setSessionKey(draft.sessionKey);
      setExercises(draft.exercises);
      setFinisher(draft.finisher||null);
      setScreen("workout");
    } else {
      saveData("kb_draft",null);
      setDraft(null);
    }
  };

  const handleStartWorkout=(exs,fin)=>{
    setExercises(exs);
    setFinisher(fin||null);
    setScreen("workout");
  };

  const handleSaveDefaults=(key,exs)=>{
    const updated={...sessions,[key]:{...sessions[key],exercises:exs}};
    setSessions(updated);
    const toSave={};
    Object.entries(updated).forEach(([k,v])=>{ toSave[k]={...v}; });
    saveData("kb_sessions",toSave);
  };

  const handleDone=(data)=>{ setDoneData(data); setScreen("done"); };

  const handleSaveSession=async({feel,notes})=>{
    const entry={
      sessionKey,timestamp:Date.now(),
      exercises:exercises.map(ex=>({...ex})),
      actualReps:doneData.actualReps,
      bellsUsed:doneData.bellsUsed,
      durationMin:doneData.durationMin,
      feel,notes,
      finisher:finisher?.name||null,
    };
    const updated=[entry,...history];
    setHistory(updated);
    await saveData("kb_history",updated);
    setDraft(null);setDoneData(null);setSessionKey(null);setExercises([]);setFinisher(null);
    setScreen("home");setTab("home");
  };

  const handleDelete=(ts)=>{
    const updated=history.filter(h=>h.timestamp!==ts);
    setHistory(updated);
    saveData("kb_history",updated);
  };

  if(loading) return (
    <div style={{...s.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{fontSize:15,color:C.faint}}>Loading…</div>
    </div>
  );

  const inWorkout=screen==="workout";
  const NAV=[["home","Home","⌂"],["history","History","▤"],["progress","Progress","↗"],["settings","Settings","⚙"]];

  return (
    <div style={s.app}>
      {screen==="home"&&tab==="home"&&<HomeScreen history={history} sessions={sessions} onStart={handleStart} hasDraft={!!draft} onResumeDraft={handleResumeDraft}/>}
      {screen==="home"&&tab==="history"&&<HistoryScreen history={history} onDelete={handleDelete}/>}
      {screen==="home"&&tab==="progress"&&<ProgressScreen history={history} sessions={sessions}/>}
      {screen==="home"&&tab==="settings"&&<SettingsScreen settings={settings} onUpdate={updateSetting}/>}
      {screen==="preview"&&sessionKey&&(
        sessionKey==="E"
          ?<FlexPickerScreen onConfirm={(exs)=>handleStartWorkout(exs,null)} onBack={()=>setScreen("home")}/>
          :<PreviewScreen sessionKey={sessionKey} session={sessions[sessionKey]} history={history} onStartWorkout={handleStartWorkout} onBack={()=>setScreen("home")} onSaveDefaults={handleSaveDefaults}/>
      )}
      {screen==="workout"&&<WorkoutScreen sessionKey={sessionKey} exercises={exercises} finisher={finisher} onDone={handleDone} onExit={()=>setScreen("home")} initialDraft={draft?.exIdx!==undefined?draft:null}/>}
      {screen==="done"&&doneData&&<DoneScreen sessionKey={sessionKey} exercises={exercises} actualReps={doneData.actualReps} bellsUsed={doneData.bellsUsed} durationMin={doneData.durationMin} finisher={finisher} onSave={handleSaveSession}/>}

      {!inWorkout&&(
        <nav style={s.navBar}>
          {NAV.map(([t,label,icon])=>(
            <button key={t} style={s.navBtn(tab===t&&screen==="home")} onClick={()=>{setTab(t);setScreen("home");}}>
              <span style={{fontSize:18,lineHeight:1}}>{icon}</span>
              <span style={{fontSize:10,fontWeight:tab===t&&screen==="home"?700:400}}>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
