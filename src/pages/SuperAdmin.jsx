import { useState, useEffect, useRef } from "react";

const SERVER = "http://localhost:8765";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#0d1117; --surface:#161b22; --surface2:#21262d;
    --border:#30363d; --text:#e6edf3; --text2:#8b949e;
    --green:#3fb950; --blue:#58a6ff; --rose:#f78166;
    --or:#d4a647; --purple:#a5d6ff;
    --ff-code:'JetBrains Mono',monospace;
    --ff-ui:'Inter',sans-serif;
  }
  html,body { height:100%; background:var(--bg); color:var(--text); font-family:var(--ff-ui); overflow:hidden; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideIn{ from{transform:translateX(-100%)} to{transform:none} }

  .spinner { width:16px;height:16px;border:2px solid rgba(255,255,255,.15);border-top-color:var(--blue);border-radius:50%;animation:spin .6s linear infinite; }

  /* Layout */
  .app { display:flex; height:100vh; }
  .sidebar { width:220px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto; }
  .main { flex:1;display:flex;flex-direction:column;overflow:hidden; }
  .topbar { height:48px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-shrink:0; }
  .content { flex:1;overflow:auto;padding:24px; }

  /* Sidebar */
  .sidebar-logo { padding:16px;border-bottom:1px solid var(--border); }
  .sidebar-section { padding:8px 12px 4px;font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--text2); }
  .nav-item { display:flex;align-items:center;gap:10px;padding:8px 16px;cursor:pointer;border-radius:0;font-size:.82rem;color:var(--text2);transition:all .2s;border-left:2px solid transparent; }
  .nav-item:hover { background:var(--surface2);color:var(--text); }
  .nav-item.active { background:rgba(88,166,255,.1);color:var(--blue);border-left-color:var(--blue); }
  .nav-badge { margin-left:auto;padding:2px 6px;background:var(--rose);border-radius:10px;font-size:.6rem;font-weight:700;color:#fff; }

  /* Cards */
  .card { background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px; }
  .card-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; }
  .card-title { font-size:.78rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text2); }

  /* Statuts */
  .status-ok  { color:var(--green); }
  .status-err { color:var(--rose); }
  .status-warn{ color:var(--or); }
  .dot { width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px; }
  .dot-green { background:var(--green);animation:pulse 2s ease-in-out infinite; }
  .dot-red   { background:var(--rose); }
  .dot-or    { background:var(--or); }

  /* Boutons */
  .btn { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-family:var(--ff-ui);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .2s; }
  .btn:hover { background:var(--border);border-color:#484f58; }
  .btn-blue { background:var(--blue);color:#0d1117;border-color:var(--blue); }
  .btn-blue:hover { background:#79c0ff;border-color:#79c0ff; }
  .btn-green { background:var(--green);color:#0d1117;border-color:var(--green); }
  .btn-green:hover { opacity:.85; }
  .btn-red { background:rgba(247,129,102,.15);color:var(--rose);border-color:rgba(247,129,102,.3); }
  .btn-red:hover { background:rgba(247,129,102,.25); }
  .btn:disabled { opacity:.5;cursor:not-allowed; }

  /* Éditeur */
  .editor-textarea {
    width:100%;height:100%;min-height:500px;
    background:#0d1117;color:#e6edf3;
    font-family:var(--ff-code);font-size:.8rem;line-height:1.6;
    border:none;outline:none;resize:none;padding:16px;
    tab-size:2;
  }
  .file-tree-item { display:flex;align-items:center;gap:8px;padding:5px 12px;cursor:pointer;font-size:.75rem;color:var(--text2);border-radius:4px;transition:all .15s; }
  .file-tree-item:hover { background:var(--surface2);color:var(--text); }
  .file-tree-item.selected { background:rgba(88,166,255,.1);color:var(--blue); }

  /* Terminal */
  .terminal { background:#000;border-radius:6px;padding:16px;font-family:var(--ff-code);font-size:.78rem;line-height:1.6;min-height:200px;max-height:400px;overflow-y:auto; }
  .term-output { color:#e6edf3;white-space:pre-wrap;word-break:break-all; }
  .term-prompt { color:var(--green); }
  .term-error  { color:var(--rose); }
  .term-input  { background:none;border:none;outline:none;color:var(--green);font-family:var(--ff-code);font-size:.78rem;width:100%;margin-top:8px; }

  /* Badges */
  .badge { padding:2px 8px;border-radius:100px;font-size:.65rem;font-weight:600;display:inline-block; }
  .badge-blue   { background:rgba(88,166,255,.15);color:var(--blue);border:1px solid rgba(88,166,255,.3); }
  .badge-green  { background:rgba(63,185,80,.15);color:var(--green);border:1px solid rgba(63,185,80,.3); }
  .badge-or     { background:rgba(212,166,71,.15);color:var(--or);border:1px solid rgba(212,166,71,.3); }
  .badge-red    { background:rgba(247,129,102,.15);color:var(--rose);border:1px solid rgba(247,129,102,.3); }

  /* Table */
  .table { width:100%;border-collapse:collapse;font-size:.8rem; }
  .table th { padding:8px 12px;text-align:left;font-size:.65rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);border-bottom:1px solid var(--border); }
  .table td { padding:10px 12px;border-bottom:1px solid rgba(48,54,61,.5);color:var(--text); }
  .table tr:hover td { background:rgba(255,255,255,.02); }

  /* Input */
  .input { background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);font-family:var(--ff-ui);font-size:.82rem;outline:none;transition:border .2s; }
  .input:focus { border-color:var(--blue); }
  .input::placeholder { color:var(--text2); }

  /* Scrollbar */
  ::-webkit-scrollbar { width:6px;height:6px; }
  ::-webkit-scrollbar-track { background:var(--bg); }
  ::-webkit-scrollbar-thumb { background:var(--border);border-radius:3px; }

  @media(max-width:768px) {
    .sidebar { position:fixed;left:0;top:0;bottom:0;z-index:100;transform:translateX(-100%);transition:transform .3s; }
    .sidebar.open { transform:none; }
  }
`;

/* ── Login ────────────────────────────────────────────── */
function Login({ onLogin }) {
  const [pwd, setPwd]   = useState("");
  const [err, setErr]   = useState("");
  const [loading, setL] = useState(false);

  async function submit(e) {
    e.preventDefault(); setL(true); setErr("");
    try {
      const res  = await fetch(`${SERVER}/auth/login`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (data.ok) { onLogin(data.token); }
      else         { setErr(data.error || "Mot de passe incorrect"); }
    } catch {
      setErr("Serveur inaccessible. Lance : python3 superadmin_server.py");
    }
    setL(false);
  }

  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <style>{STYLES}</style>
      <div style={{ width:"360px", animation:"fadeIn .4s both" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"2rem", marginBottom:"8px" }}>⚙️</div>
          <h1 style={{ font:"700 1.2rem var(--ff-ui)", marginBottom:"4px" }}>Super Admin</h1>
          <p style={{ font:"300 .8rem var(--ff-ui)", color:"var(--text2)" }}>Méta'Morph'Ose — Dev Interface</p>
        </div>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input className="input" type="password" placeholder="Mot de passe dev" value={pwd} onChange={e=>setPwd(e.target.value)} autoFocus style={{ width:"100%", padding:"12px 16px" }}/>
          {err && <p style={{ color:"var(--rose)", font:".75rem var(--ff-ui)", padding:"8px 12px", background:"rgba(247,129,102,.08)", border:"1px solid rgba(247,129,102,.2)", borderRadius:"6px" }}>{err}</p>}
          <button type="submit" className="btn btn-blue" disabled={loading} style={{ width:"100%", justifyContent:"center", padding:"12px" }}>
            {loading ? <span className="spinner"/> : "Accéder au panneau"}
          </button>
        </form>
        <p style={{ marginTop:"16px", textAlign:"center", font:".7rem var(--ff-ui)", color:"var(--text2)" }}>
          Serveur local requis sur le port 8765
        </p>
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────── */
function Dashboard({ token }) {
  const [tab,      setTab]      = useState("overview");
  const [status,   setStatus]   = useState(null);
  const [files,    setFiles]    = useState([]);
  const [pages,    setPages]    = useState([]);
  const [routes,   setRoutes]   = useState({ routes:[], content:"" });
  const [project,  setProject]  = useState("frontend");
  const [selFile,  setSelFile]  = useState(null);
  const [fileContent, setFC]   = useState("");
  const [modified, setModified] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [pushing,  setPushing]  = useState(false);
  const [pushMsg,  setPushMsg]  = useState("update via super-admin");
  const [pushLog,  setPushLog]  = useState("");
  const [termLog,  setTermLog]  = useState([]);
  const [termCmd,  setTermCmd]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gitLogs,  setGitLogs]  = useState([]);
  const headers = { "X-Super-Token": token, "Content-Type": "application/json" };

  async function fetchStatus() {
    try {
      const r = await fetch(`${SERVER}/status`, { headers });
      setStatus(await r.json());
    } catch {}
  }

  async function fetchFiles() {
    setLoading(true);
    try {
      const r = await fetch(`${SERVER}/files?project=${project}`, { headers });
      setFiles(await r.json());
    } catch {}
    setLoading(false);
  }

  async function fetchPages() {
    try {
      const r = await fetch(`${SERVER}/pages`, { headers });
      setPages(await r.json());
    } catch {}
  }

  async function fetchRoutes() {
    try {
      const r = await fetch(`${SERVER}/routes`, { headers });
      setRoutes(await r.json());
    } catch {}
  }

  async function fetchGitLog() {
    try {
      const r = await fetch(`${SERVER}/git/log?project=${project}`, { headers });
      const d = await r.json();
      setGitLogs(d.logs || []);
    } catch {}
  }

  async function openFile(file) {
    setSelFile(file);
    try {
      const r = await fetch(`${SERVER}/file?project=${project}&path=${encodeURIComponent(file.path)}`, { headers });
      const d = await r.json();
      setFC(d.content || "");
      setModified(false);
    } catch {}
  }

  async function saveFile() {
    setSaving(true);
    try {
      await fetch(`${SERVER}/file`, {
        method:"POST", headers,
        body: JSON.stringify({ project, path: selFile.path, content: fileContent })
      });
      setModified(false);
    } catch {}
    setSaving(false);
  }

  async function gitPush() {
    setPushing(true); setPushLog("");
    try {
      const r = await fetch(`${SERVER}/git/push`, {
        method:"POST", headers,
        body: JSON.stringify({ project, message: pushMsg })
      });
      const d = await r.json();
      setPushLog(d.commit + "\n" + d.push);
      fetchStatus(); fetchGitLog();
    } catch { setPushLog("Erreur réseau"); }
    setPushing(false);
  }

  async function gitPull() {
    try {
      const r = await fetch(`${SERVER}/git/pull`, {
        method:"POST", headers,
        body: JSON.stringify({ project })
      });
      const d = await r.json();
      setPushLog(d.output);
      fetchStatus(); fetchGitLog();
    } catch {}
  }

  async function runCmd() {
    if (!termCmd.trim()) return;
    const cmd = termCmd;
    setTermCmd("");
    setTermLog(prev => [...prev, { type:"prompt", text:`$ ${cmd}` }]);
    try {
      const r = await fetch(`${SERVER}/terminal`, {
        method:"POST", headers,
        body: JSON.stringify({ cmd, project })
      });
      const d = await r.json();
      if (d.error) setTermLog(prev => [...prev, { type:"error", text: d.error }]);
      else         setTermLog(prev => [...prev, { type:"output", text: d.output || "(aucun output)" }]);
    } catch {
      setTermLog(prev => [...prev, { type:"error", text:"Serveur inaccessible" }]);
    }
  }

  useEffect(() => { fetchStatus(); fetchPages(); fetchRoutes(); fetchGitLog(); }, []);
  useEffect(() => { if (tab === "files") fetchFiles(); if (tab === "git") fetchGitLog(); }, [tab, project]);

  const NAV = [
    { id:"overview", icon:"◈", label:"Vue d'ensemble" },
    { id:"files",    icon:"◧", label:"Fichiers" },
    { id:"editor",   icon:"⌨", label:"Éditeur" },
    { id:"pages",    icon:"◻", label:"Pages & Routes" },
    { id:"git",      icon:"⎇", label:"Git & Deploy" },
    { id:"terminal", icon:"$", label:"Terminal" },
  ];

  return (
    <div className="app">
      <style>{STYLES}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <p style={{ font:"700 .85rem var(--ff-ui)", marginBottom:"2px" }}>
            <span style={{color:"var(--blue)"}}>Meta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </p>
          <p style={{ font:"300 .65rem var(--ff-ui)", color:"var(--text2)" }}>Super Admin · Dev</p>
        </div>

        <div className="sidebar-section">Navigation</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
            <span style={{ fontFamily:"monospace", fontSize:".9rem" }}>{n.icon}</span>
            {n.label}
          </div>
        ))}

        <div style={{ marginTop:"auto", padding:"12px 16px", borderTop:"1px solid var(--border)" }}>
          <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
            <button className={`btn ${project==="frontend"?"btn-blue":""}`} onClick={()=>setProject("frontend")} style={{ flex:1, justifyContent:"center", fontSize:".68rem" }}>Frontend</button>
            <button className={`btn ${project==="backend"?"btn-blue":""}`} onClick={()=>setProject("backend")} style={{ flex:1, justifyContent:"center", fontSize:".68rem" }}>Backend</button>
          </div>
          <p style={{ font:".62rem var(--ff-ui)", color:"var(--text2)" }}>
            {status ? `Actif · ${status.server_time?.split(" ")[1]}` : "Connexion..."}
          </p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          <p style={{ font:"600 .82rem var(--ff-ui)" }}>
            {NAV.find(n=>n.id===tab)?.label}
            <span style={{ marginLeft:"8px", font:"300 .72rem var(--ff-ui)", color:"var(--text2)" }}>
              — {project === "frontend" ? "metamorphose-frontend" : "metamorphose-backend"}
            </span>
          </p>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            {status && (
              <>
                <span style={{ font:".7rem var(--ff-ui)", color:"var(--text2)" }}>
                  <span className="dot dot-green"/>Frontend
                </span>
                <span style={{ font:".7rem var(--ff-ui)", color:"var(--text2)" }}>
                  <span className="dot dot-green"/>Backend
                </span>
              </>
            )}
            <button className="btn" onClick={fetchStatus} style={{ fontSize:".7rem" }}>↻ Refresh</button>
          </div>
        </div>

        <div className="content">

          {/* ── VUE D'ENSEMBLE ── */}
          {tab === "overview" && (
            <div style={{ animation:"fadeIn .3s both" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"16px", marginBottom:"20px" }}>
                {[
                  { label:"Pages React", val: pages.length, color:"var(--blue)", icon:"◻" },
                  { label:"Routes",      val: routes.routes?.length || 0, color:"var(--green)", icon:"⎇" },
                  { label:"Projet actif",val: project, color:"var(--or)", icon:"◈" },
                  { label:"Serveur",     val: status ? "En ligne" : "...", color:"var(--green)", icon:"●" },
                ].map((s,i) => (
                  <div key={i} className="card" style={{ borderTop:`2px solid ${s.color}` }}>
                    <p style={{ font:".65rem var(--ff-ui)", color:"var(--text2)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:"8px" }}>{s.icon} {s.label}</p>
                    <p style={{ font:"700 1.4rem var(--ff-ui)", color:s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Status repos */}
              {status && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                  {["frontend","backend"].map(proj => {
                    const s = status[proj];
                    return (
                      <div key={proj} className="card">
                        <div className="card-header">
                          <p className="card-title">{proj}</p>
                          <span className="badge badge-green">{s.branch || "main"}</span>
                        </div>
                        <p style={{ font:".72rem var(--ff-code)", color: s.status === "Propre" ? "var(--green)" : "var(--or)", marginBottom:"10px" }}>
                          {s.status === "Propre" ? "✓ Propre" : `⚠ ${s.status}`}
                        </p>
                        <div>
                          {(s.commits || []).map((c,i) => (
                            <p key={i} style={{ font:".7rem var(--ff-code)", color:"var(--text2)", padding:"3px 0", borderBottom:"1px solid rgba(48,54,61,.3)" }}>
                              <span style={{color:"var(--blue)"}}>{c.split(" ")[0]}</span> {c.split(" ").slice(1).join(" ")}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── FICHIERS ── */}
          {tab === "files" && (
            <div style={{ animation:"fadeIn .3s both" }}>
              <div style={{ display:"flex", gap:"12px", marginBottom:"16px", alignItems:"center" }}>
                <p style={{ font:".8rem var(--ff-ui)", color:"var(--text2)" }}>{files.length} fichiers</p>
                <button className="btn" onClick={fetchFiles}>↻</button>
              </div>
              <div className="card" style={{ padding:0, maxHeight:"calc(100vh - 200px)", overflowY:"auto" }}>
                {loading ? (
                  <div style={{ padding:"40px", textAlign:"center" }}><span className="spinner"/></div>
                ) : files.map((f,i) => (
                  <div key={i} className="file-tree-item" onClick={()=>{ setSelFile(f); setTab("editor"); openFile(f); }}>
                    <span style={{ color:"var(--text2)", fontSize:".75rem" }}>
                      {f.path.endsWith(".jsx") ? "⚛" : f.path.endsWith(".py") ? "🐍" : f.path.endsWith(".css") ? "🎨" : "📄"}
                    </span>
                    <span style={{ flex:1, fontFamily:"var(--ff-code)" }}>{f.path}</span>
                    <span style={{ font:".62rem var(--ff-ui)", color:"var(--text2)" }}>{(f.size/1024).toFixed(1)}kb</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ÉDITEUR ── */}
          {tab === "editor" && (
            <div style={{ animation:"fadeIn .3s both", height:"calc(100vh - 120px)", display:"flex", flexDirection:"column" }}>
              {selFile ? (
                <>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"12px", flexWrap:"wrap" }}>
                    <span className="badge badge-blue" style={{ fontFamily:"var(--ff-code)" }}>{selFile.path}</span>
                    {modified && <span className="badge badge-or">Modifié</span>}
                    <div style={{ marginLeft:"auto", display:"flex", gap:"8px" }}>
                      <button className="btn" onClick={saveFile} disabled={saving || !modified}>
                        {saving ? <span className="spinner"/> : "💾 Sauvegarder"}
                      </button>
                      <button className="btn btn-green" onClick={()=>{ saveFile(); setTab("git"); }} disabled={!modified}>
                        Sauvegarder & Déployer
                      </button>
                    </div>
                  </div>
                  <div style={{ flex:1, border:"1px solid var(--border)", borderRadius:"8px", overflow:"hidden" }}>
                    <textarea
                      className="editor-textarea"
                      value={fileContent}
                      onChange={e=>{ setFC(e.target.value); setModified(true); }}
                      spellCheck={false}
                      style={{ height:"100%" }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"60px", color:"var(--text2)" }}>
                  <p style={{ fontSize:"3rem", marginBottom:"12px" }}>⌨</p>
                  <p style={{ font:".88rem var(--ff-ui)" }}>Sélectionne un fichier dans l'onglet Fichiers</p>
                </div>
              )}
            </div>
          )}

          {/* ── PAGES & ROUTES ── */}
          {tab === "pages" && (
            <div style={{ animation:"fadeIn .3s both" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                <div>
                  <p style={{ font:"600 .75rem var(--ff-ui)", marginBottom:"12px", color:"var(--text2)", textTransform:"uppercase", letterSpacing:".08em" }}>Pages ({pages.length})</p>
                  <div className="card" style={{ padding:0 }}>
                    <table className="table">
                      <thead><tr><th>Page</th><th>Taille</th><th>Modifié</th></tr></thead>
                      <tbody>
                        {pages.map((p,i) => (
                          <tr key={i} style={{ cursor:"pointer" }} onClick={()=>{ setSelFile({path:`src/pages/${p.file}`,full:""}); setTab("editor"); openFile({path:`src/pages/${p.file}`}); }}>
                            <td><span style={{ fontFamily:"var(--ff-code)", color:"var(--blue)" }}>{p.name}</span></td>
                            <td><span style={{ color:"var(--text2)", fontSize:".72rem" }}>{(p.size/1024).toFixed(1)}kb</span></td>
                            <td><span style={{ color:"var(--text2)", fontSize:".7rem" }}>{p.modified}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <p style={{ font:"600 .75rem var(--ff-ui)", marginBottom:"12px", color:"var(--text2)", textTransform:"uppercase", letterSpacing:".08em" }}>Routes ({routes.routes?.length || 0})</p>
                  <div className="card" style={{ padding:0 }}>
                    <table className="table">
                      <thead><tr><th>Route</th></tr></thead>
                      <tbody>
                        {(routes.routes || []).map((r,i) => (
                          <tr key={i}>
                            <td><span style={{ fontFamily:"var(--ff-code)", color:"var(--green)" }}>{r}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Éditeur App.jsx */}
              <div style={{ marginTop:"16px" }}>
                <p style={{ font:"600 .75rem var(--ff-ui)", marginBottom:"12px", color:"var(--text2)", textTransform:"uppercase", letterSpacing:".08em" }}>App.jsx — Éditeur de routes</p>
                <div className="card" style={{ padding:0 }}>
                  <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:"8px", alignItems:"center" }}>
                    <span className="badge badge-blue">src/App.jsx</span>
                    <button className="btn btn-green" onClick={async()=>{
                      try {
                        await fetch(`${SERVER}/routes`, { method:"POST", headers, body:JSON.stringify({content:routes.content}) });
                        fetchRoutes();
                      } catch {}
                    }} style={{ marginLeft:"auto", fontSize:".7rem" }}>
                      💾 Sauvegarder App.jsx
                    </button>
                  </div>
                  <textarea
                    className="editor-textarea"
                    value={routes.content || ""}
                    onChange={e=>setRoutes(prev=>({...prev,content:e.target.value}))}
                    style={{ height:"300px" }}
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── GIT & DEPLOY ── */}
          {tab === "git" && (
            <div style={{ animation:"fadeIn .3s both" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                <div>
                  <div className="card">
                    <div className="card-header">
                      <p className="card-title">⎇ Déployer</p>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      <input className="input" value={pushMsg} onChange={e=>setPushMsg(e.target.value)} placeholder="Message de commit" style={{ width:"100%" }}/>
                      <div style={{ display:"flex", gap:"8px" }}>
                        <button className="btn btn-blue" onClick={gitPush} disabled={pushing} style={{ flex:1, justifyContent:"center" }}>
                          {pushing ? <><span className="spinner"/> Push en cours…</> : "⬆ Git Push"}
                        </button>
                        <button className="btn" onClick={gitPull} style={{ flex:1, justifyContent:"center" }}>
                          ⬇ Git Pull
                        </button>
                      </div>
                    </div>
                    {pushLog && (
                      <div style={{ marginTop:"12px", padding:"10px 12px", background:"var(--bg)", borderRadius:"6px", fontFamily:"var(--ff-code)", fontSize:".72rem", color:"var(--green)", whiteSpace:"pre-wrap", maxHeight:"150px", overflowY:"auto" }}>
                        {pushLog}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="card">
                    <div className="card-header">
                      <p className="card-title">Historique commits</p>
                      <button className="btn" onClick={fetchGitLog} style={{ fontSize:".7rem" }}>↻</button>
                    </div>
                    {gitLogs.map((l,i) => (
                      <div key={i} style={{ display:"flex", gap:"10px", padding:"6px 0", borderBottom:"1px solid rgba(48,54,61,.4)" }}>
                        <span style={{ fontFamily:"var(--ff-code)", fontSize:".7rem", color:"var(--blue)", flexShrink:0 }}>{l.hash}</span>
                        <span style={{ fontFamily:"var(--ff-code)", fontSize:".7rem", color:"var(--text2)" }}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TERMINAL ── */}
          {tab === "terminal" && (
            <div style={{ animation:"fadeIn .3s both" }}>
              <div className="card" style={{ padding:0 }}>
                <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#ff5f56" }}/>
                  <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#ffbd2e" }}/>
                  <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#27c93f" }}/>
                  <span style={{ font:".7rem var(--ff-code)", color:"var(--text2)", marginLeft:"8px" }}>Terminal — {project}</span>
                  <button className="btn" onClick={()=>setTermLog([])} style={{ marginLeft:"auto", fontSize:".68rem" }}>Effacer</button>
                </div>
                <div className="terminal">
                  {termLog.map((l,i) => (
                    <div key={i} className={l.type==="prompt"?"term-prompt":l.type==="error"?"term-error":"term-output"}>
                      {l.text}
                    </div>
                  ))}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"8px" }}>
                    <span className="term-prompt">$</span>
                    <input
                      className="term-input"
                      value={termCmd}
                      onChange={e=>setTermCmd(e.target.value)}
                      onKeyDown={e=>{ if(e.key==="Enter") runCmd(); }}
                      placeholder="git status | npm run build | python manage.py..."
                    />
                  </div>
                </div>
              </div>
              <p style={{ marginTop:"8px", font:".68rem var(--ff-ui)", color:"var(--text2)" }}>
                Commandes autorisées : git, npm run, python manage.py, ls, cat, grep, wc, head, tail, pip
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── APP ──────────────────────────────────────────────── */
export default function SuperAdmin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("sa_token") || "");

  function handleLogin(t) {
    sessionStorage.setItem("sa_token", t);
    setToken(t);
  }

  if (!token) return <Login onLogin={handleLogin}/>;
  return <Dashboard token={token}/>;
}
