import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

function LiveAdminView({ api, toast, refreshKey = 0 }) {
  const navigate = useNavigate();
  const [salles,   setSalles]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', mode: 'live', code_acces: '' });
  const token = localStorage.getItem('mmorphose_token');

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none', boxSizing:'border-box' };
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' };
  const STATUT_COLOR = { attente:'var(--or)', active:'#4CAF50', terminee:'var(--text-sub)' };

  function load() {
    setLoading(true);
    fetch(`${API_BASE}/api/live/mes-salles/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setSalles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function creer() {
    if (!form.titre.trim()) { toast('Titre requis', 'error'); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/live/creer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast('Session LiveKit créée ✓', 'success');
        setForm({ titre: '', description: '', mode: 'live', code_acces: '' });
        load();
        // Rejoindre immédiatement la salle
        if (data.token && data.livekit_url) {
          navigate('/live/room', { state: { token: data.token, livekit_url: data.livekit_url, titre: data.titre } });
        }
      } else toast(data.detail || data.error || 'Erreur', 'error');
    } catch { toast('Erreur serveur', 'error'); }
    setCreating(false);
  }

  async function rejoindre(salle) {
    try {
      const res = await fetch(`${API_BASE}/api/live/${salle.id}/livekit-token/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.token) {
        navigate('/live/room', { state: { token: data.token, livekit_url: data.livekit_url, titre: salle.titre } });
      } else toast('Erreur connexion', 'error');
    } catch { toast('Erreur réseau', 'error'); }
  }

  async function terminer(id) {
    if (!confirm('Terminer cette session ?')) return;
    await fetch(`${API_BASE}/api/live/${id}/terminer/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    toast('Session terminée', 'success');
    load();
  }

  function copierCode(code) {
    navigator.clipboard.writeText(code);
    toast('Code copié ✓', 'success');
  }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ marginBottom:'32px' }}>
        <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Live & Visioconférence</h2>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>
          Créez une session LiveKit — partagez le code aux clientes pour qu'elles rejoignent
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
              <label style={lbl}>Mode</label>
              <select style={{...inp}} value={form.mode} onChange={e => setForm(p => ({...p, mode: e.target.value}))}>
                <option value="live">Live</option>
                <option value="webinaire">Webinaire</option>
                <option value="reunion">Réunion</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Code d'accès (optionnel)</label>
              <input style={{...inp, letterSpacing:'.2em', textTransform:'uppercase'}} type="text" placeholder="Auto-généré" value={form.code_acces} onChange={e => setForm(p => ({...p, code_acces: e.target.value.toUpperCase()}))} maxLength={6}/>
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

      {/* Liste des salles */}
      {loading ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem' }}>Chargement...</p>
      ) : salles.length === 0 ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontStyle:'italic' }}>Aucune session créée.</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {salles.map(s => (
            <div key={s.id} style={{ padding:'20px 24px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'6px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px' }}>
                <div>
                  <p style={{ fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.95rem', marginBottom:'4px' }}>{s.titre}</p>
                  <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>{s.mode} · {s.created_at}</p>
                </div>
                <span style={{ fontFamily:'var(--ff-b)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:STATUT_COLOR[s.statut] || 'var(--text-sub)', padding:'4px 10px', border:`1px solid ${STATUT_COLOR[s.statut] || 'var(--border)'}`, borderRadius:'2px' }}>
                  {s.statut}
                </span>
              </div>

              {/* Code d'accès */}
              {s.code_acces && (
                <div style={{ marginTop:'12px', padding:'10px 14px', background:'rgba(201,169,106,.06)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontFamily:'var(--ff-b)', fontSize:'.6rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--or)', marginBottom:'2px' }}>Code d'accès</p>
                    <p style={{ fontFamily:'var(--ff-b)', fontSize:'1.2rem', fontWeight:700, letterSpacing:'.3em', color:'var(--or)' }}>{s.code_acces}</p>
                  </div>
                  <button onClick={() => copierCode(s.code_acces)} style={{ padding:'8px 14px', background:'rgba(201,169,106,.1)', border:'1px solid rgba(201,169,106,.3)', borderRadius:'3px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase' }}>
                    Copier
                  </button>
                </div>
              )}

              {/* Actions */}
              <div style={{ display:'flex', gap:'10px', marginTop:'14px', flexWrap:'wrap' }}>
                {s.statut !== 'terminee' && (
                  <button onClick={() => rejoindre(s)} style={{ padding:'9px 18px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.7rem', fontWeight:600, cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase' }}>
                    Rejoindre le live
                  </button>
                )}
                {s.statut !== 'terminee' && (
                  <button onClick={() => terminer(s.id)} style={{ padding:'9px 18px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.7rem', cursor:'pointer' }}>
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
