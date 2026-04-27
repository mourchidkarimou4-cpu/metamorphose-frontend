import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

function LiveAdminView({ api, toast, refreshKey = 0 }) {
  const [reunions, setReunions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', duree: 60, date_debut: '' });
  const token = localStorage.getItem('mmorphose_token');

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none', boxSizing:'border-box' };
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' };

  function load() {
    setLoading(true);
    fetch(`${API_BASE}/api/zoom/mes-reunions/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setReunions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function creer() {
    if (!form.titre.trim()) { toast('Titre requis', 'error'); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/zoom/creer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast('Réunion Zoom créée ✓', 'success');
        setForm({ titre: '', description: '', duree: 60, date_debut: '' });
        load();
      } else toast(data.error || 'Erreur', 'error');
    } catch { toast('Erreur serveur', 'error'); }
    setCreating(false);
  }

  async function terminer(id) {
    if (!confirm('Terminer cette session ?')) return;
    await fetch(`${API_BASE}/api/zoom/${id}/terminer/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    toast('Session terminée', 'success');
    load();
  }

  function copier(texte, label) {
    navigator.clipboard.writeText(texte);
    toast(`${label} copié ✓`, 'success');
  }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ marginBottom:'32px' }}>
        <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Live & Visioconférence</h2>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>
          Créez une session Zoom — les clientes rejoignent directement depuis le site
        </p>
      </div>

      {/* Formulaire création */}
      <div style={{ padding:'24px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'6px', marginBottom:'32px' }}>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--or)', marginBottom:'20px', fontWeight:600 }}>
          Nouvelle session
        </p>
        <div style={{ display:'grid', gap:'14px' }}>
          <div>
            <label style={lbl}>Titre *</label>
            <input style={inp} type="text" placeholder="Ex: Masterclass Confiance en soi" value={form.titre} onChange={e => setForm(p => ({...p, titre: e.target.value}))}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div>
              <label style={lbl}>Durée (minutes)</label>
              <input style={inp} type="number" min="15" max="480" value={form.duree} onChange={e => setForm(p => ({...p, duree: parseInt(e.target.value)}))}/>
            </div>
            <div>
              <label style={lbl}>Date (optionnelle)</label>
              <input style={inp} type="datetime-local" value={form.date_debut} onChange={e => setForm(p => ({...p, date_debut: e.target.value}))}/>
            </div>
          </div>
          <div>
            <label style={lbl}>Description (optionnelle)</label>
            <input style={inp} type="text" placeholder="Brève description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}/>
          </div>
          <button onClick={creer} disabled={creating} style={{ padding:'12px 24px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.72rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:creating?0.6:1, alignSelf:'flex-start' }}>
            {creating ? 'Création...' : '+ Créer la session'}
          </button>
        </div>
      </div>

      {/* Liste réunions */}
      {loading ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem' }}>Chargement...</p>
      ) : reunions.length === 0 ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontStyle:'italic' }}>Aucune session créée.</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {reunions.map(r => (
            <div key={r.id} style={{ padding:'20px 24px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'6px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px', marginBottom:'14px' }}>
                <div>
                  <p style={{ fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.95rem', marginBottom:'4px' }}>{r.titre}</p>
                  <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>{r.created_at}</p>
                </div>
                <span style={{ fontFamily:'var(--ff-b)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color: r.statut==='active'?'#4CAF50':r.statut==='attente'?'var(--or)':'var(--text-sub)', padding:'4px 10px', border:`1px solid ${r.statut==='active'?'#4CAF50':r.statut==='attente'?'var(--or)':'var(--border)'}`, borderRadius:'2px' }}>
                  {r.statut}
                </span>
              </div>

              {/* Infos réunion */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                <div style={{ padding:'10px 14px', background:'rgba(201,169,106,.06)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px' }}>
                  <p style={{ fontFamily:'var(--ff-b)', fontSize:'.6rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--or)', marginBottom:'4px' }}>Meeting ID</p>
                  <p style={{ fontFamily:'var(--ff-b)', fontSize:'.95rem', fontWeight:700, letterSpacing:'.1em', color:'var(--or)' }}>{r.meeting_id}</p>
                </div>
                {r.password && (
                  <div style={{ padding:'10px 14px', background:'rgba(194,24,91,.06)', border:'1px solid rgba(194,24,91,.2)', borderRadius:'4px' }}>
                    <p style={{ fontFamily:'var(--ff-b)', fontSize:'.6rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--rose)', marginBottom:'4px' }}>Password</p>
                    <p style={{ fontFamily:'var(--ff-b)', fontSize:'.95rem', fontWeight:700, letterSpacing:'.1em', color:'var(--rose)' }}>{r.password}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <button onClick={() => copier(r.meeting_id, 'Meeting ID')} style={{ padding:'8px 14px', background:'rgba(201,169,106,.1)', border:'1px solid rgba(201,169,106,.3)', borderRadius:'3px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  Copier ID
                </button>
                {r.password && (
                  <button onClick={() => copier(r.password, 'Password')} style={{ padding:'8px 14px', background:'rgba(194,24,91,.1)', border:'1px solid rgba(194,24,91,.3)', borderRadius:'3px', color:'var(--rose)', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase' }}>
                    Copier Password
                  </button>
                )}
                {r.start_url && r.statut !== 'terminee' && (
                  <a href={r.start_url} target="_blank" rel="noreferrer" style={{ padding:'8px 14px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.65rem', fontWeight:600, cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
                    Démarrer (hôte)
                  </a>
                )}
                {r.statut !== 'terminee' && (
                  <button onClick={() => terminer(r.id)} style={{ padding:'8px 14px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer' }}>
                    Terminer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { LiveAdminView };
