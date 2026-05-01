import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function token() { return localStorage.getItem('mmorphose_token') || ''; }
function headers() { return { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' }; }

const JOURS = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const STATUT_COLORS = {
  en_attente: { bg:'rgba(201,169,106,.1)', color:'#C9A96A', label:'En attente' },
  confirme:   { bg:'rgba(76,175,80,.1)',   color:'#4CAF50', label:'Confirmé'   },
  refuse:     { bg:'rgba(239,68,68,.1)',   color:'#f87171', label:'Refusé'     },
  annule:     { bg:'rgba(255,255,255,.06)',color:'rgba(248,245,242,.3)', label:'Annulé' },
};

// ── VUE DISPONIBILITÉS ────────────────────────────────────────────
function DispoView() {
  const [dispos,   setDispos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ jour:'lundi', heure_debut:'09:00', heure_fin:'12:00' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  function load() {
    setLoading(true);
    fetch(`${API_BASE}/api/rendezvous/admin/disponibilites/`, { headers: headers() })
      .then(r => r.json()).then(d => { setDispos(d); setLoading(false); })
      .catch(() => setLoading(false));
  }
  useEffect(load, []);

  async function ajouter(e) {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch(`${API_BASE}/api/rendezvous/admin/disponibilites/`, {
      method: 'POST', headers: headers(), body: JSON.stringify(form),
    });
    if (res.ok) { load(); setForm({ jour:'lundi', heure_debut:'09:00', heure_fin:'12:00' }); }
    else { setError('Erreur lors de l\'ajout.'); }
    setSaving(false);
  }

  async function supprimer(id) {
    if (!window.confirm('Supprimer cette disponibilité ?')) return;
    await fetch(`${API_BASE}/api/rendezvous/admin/disponibilites/${id}/`, { method:'DELETE', headers:headers() });
    load();
  }

  async function toggleActif(dispo) {
    await fetch(`${API_BASE}/api/rendezvous/admin/disponibilites/${dispo.id}/`, {
      method:'PATCH', headers:headers(), body: JSON.stringify({ actif: !dispo.actif }),
    });
    load();
  }

  return (
    <div>
      <h3 style={s.subTitle}>Gérer les disponibilités</h3>
      <p style={s.hint}>Définissez vos plages horaires. Les créneaux seront générés par tranche de 30 minutes.</p>

      {/* Formulaire ajout */}
      <div style={s.card}>
        <p style={s.cardLabel}>Ajouter une plage horaire</p>
        <form onSubmit={ajouter} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'end' }}>
          <div>
            <label style={s.label}>Jour</label>
            <select style={s.input} value={form.jour} onChange={e=>setForm(p=>({...p,jour:e.target.value}))}>
              {JOURS.map(j => <option key={j} value={j}>{j.charAt(0).toUpperCase()+j.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Début</label>
            <input style={s.input} type="time" value={form.heure_debut} onChange={e=>setForm(p=>({...p,heure_debut:e.target.value}))}/>
          </div>
          <div>
            <label style={s.label}>Fin</label>
            <input style={s.input} type="time" value={form.heure_fin} onChange={e=>setForm(p=>({...p,heure_fin:e.target.value}))}/>
          </div>
          <button type="submit" style={s.btnOr} disabled={saving}>{saving ? '...' : '+ Ajouter'}</button>
        </form>
        {error && <p style={s.error}>{error}</p>}
      </div>

      {/* Liste */}
      {loading ? <p style={s.hint}>Chargement...</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {JOURS.map(jour => {
            const items = dispos.filter(d => d.jour === jour);
            if (!items.length) return null;
            return (
              <div key={jour} style={s.card}>
                <p style={{ ...s.cardLabel, marginBottom:12 }}>{jour.charAt(0).toUpperCase()+jour.slice(1)}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {items.map(d => (
                    <div key={d.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:d.actif?'rgba(201,169,106,.06)':'rgba(255,255,255,.02)', border:`1px solid ${d.actif?'rgba(201,169,106,.25)':'rgba(255,255,255,.06)'}`, borderRadius:2 }}>
                      <span style={{ fontSize:13, color:d.actif?'#C9A96A':'rgba(248,245,242,.3)', fontWeight:500 }}>{d.heure_debut} — {d.heure_fin}</span>
                      <button onClick={() => toggleActif(d)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:d.actif?'rgba(76,175,80,.7)':'rgba(248,245,242,.2)', padding:'2px 6px' }}>{d.actif?'Actif':'Inactif'}</button>
                      <button onClick={() => supprimer(d.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'rgba(239,68,68,.5)', padding:'2px 4px' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {!dispos.length && <p style={s.hint}>Aucune disponibilité configurée.</p>}
        </div>
      )}
    </div>
  );
}

// ── VUE LISTE RDV ─────────────────────────────────────────────────
function ListeRdvView() {
  const [rdvs,     setRdvs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtre,   setFiltre]   = useState('en_attente');
  const [selected, setSelected] = useState(null);
  const [note,     setNote]     = useState('');
  const [lien,     setLien]     = useState('');
  const [saving,   setSaving]   = useState(false);

  function load() {
    setLoading(true);
    fetch(`${API_BASE}/api/rendezvous/admin/liste/?statut=${filtre}`, { headers:headers() })
      .then(r => r.json()).then(d => { setRdvs(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(() => setLoading(false));
  }
  useEffect(load, [filtre]);

  function ouvrir(rdv) {
    setSelected(rdv);
    setNote(rdv.note_admin || '');
    setLien(rdv.lien_reunion || '');
  }

  async function action(statut) {
    setSaving(true);
    await fetch(`${API_BASE}/api/rendezvous/admin/${selected.id}/`, {
      method:'PATCH', headers:headers(),
      body: JSON.stringify({ statut, note_admin:note, lien_reunion:lien }),
    });
    setSaving(false);
    setSelected(null);
    load();
  }

  const TYPE_LABELS = { decouverte:'Appel Découverte', coaching:'Séance Coaching', consultation:'Consultation Image & Style' };
  const MODE_LABELS = { en_ligne:'En ligne', presentiel:'En présentiel' };

  return (
    <div>
      <h3 style={s.subTitle}>Rendez-vous</h3>

      {/* Filtres */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {Object.entries(STATUT_COLORS).map(([k, v]) => (
          <button key={k} onClick={() => setFiltre(k)} style={{ padding:'8px 16px', border:`1px solid ${filtre===k?v.color:'rgba(255,255,255,.08)'}`, background:filtre===k?v.bg:'transparent', color:filtre===k?v.color:'rgba(248,245,242,.3)', fontFamily:"'Montserrat',sans-serif", fontSize:11, fontWeight:500, letterSpacing:'.08em', cursor:'pointer', borderRadius:2, transition:'all .2s' }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? <p style={s.hint}>Chargement...</p> : rdvs.length === 0 ? (
        <div style={{ ...s.card, textAlign:'center', padding:'40px 20px' }}>
          <p style={s.hint}>Aucun rendez-vous {STATUT_COLORS[filtre]?.label.toLowerCase()}.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {rdvs.map(rdv => (
            <div key={rdv.id} style={{ ...s.card, cursor:'pointer', transition:'all .2s' }} onClick={() => ouvrir(rdv)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:600, color:'#F8F5F2' }}>{rdv.prenom} {rdv.nom}</span>
                    <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.1em', padding:'3px 8px', background:STATUT_COLORS[rdv.statut]?.bg, color:STATUT_COLORS[rdv.statut]?.color, borderRadius:2 }}>
                      {STATUT_COLORS[rdv.statut]?.label}
                    </span>
                    {rdv.est_gratuit && <span style={{ fontSize:10, padding:'3px 8px', background:'rgba(76,175,80,.08)', color:'#4CAF50', borderRadius:2 }}>Gratuit</span>}
                  </div>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                    <span style={s.meta}>{TYPE_LABELS[rdv.type_rdv]}</span>
                    <span style={s.meta}>{MODE_LABELS[rdv.mode]}</span>
                    <span style={{ ...s.meta, color:'#C9A96A' }}>{rdv.date} à {rdv.heure}</span>
                    <span style={s.meta}>{rdv.email}</span>
                    <span style={s.meta}>{rdv.whatsapp}</span>
                  </div>
                </div>
                <span style={{ fontSize:11, color:'rgba(248,245,242,.2)', flexShrink:0 }}>{rdv.created_at}</span>
              </div>
              {rdv.message && <p style={{ fontSize:12, color:'rgba(248,245,242,.35)', marginTop:10, fontStyle:'italic', fontWeight:300 }}>"{rdv.message}"</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e=>{ if(e.target===e.currentTarget) setSelected(null); }}>
          <div style={{ background:'#0d0b10', border:'1px solid rgba(201,169,106,.15)', borderRadius:4, padding:36, maxWidth:540, width:'100%', maxHeight:'85vh', overflowY:'auto', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#C9A96A,#C2185B)' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
              <div>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:'.25em', textTransform:'uppercase', color:'rgba(201,169,106,.4)', marginBottom:6 }}>Rendez-vous #{selected.id}</p>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:600, color:'#F8F5F2' }}>{selected.prenom} {selected.nom}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'rgba(248,245,242,.3)', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>

            {/* Infos */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 20px', marginBottom:20 }}>
              {[
                ['Email',    selected.email],
                ['WhatsApp', selected.whatsapp],
                ['Pays',     selected.pays || '—'],
                ['Type',     TYPE_LABELS[selected.type_rdv]],
                ['Mode',     MODE_LABELS[selected.mode]],
                ['Date',     `${selected.date} à ${selected.heure}`],
                ['Durée',    `${selected.duree} min`],
                ['Tarif',    selected.est_gratuit ? 'Gratuit' : 'Payant'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(248,245,242,.22)', marginBottom:3 }}>{k}</p>
                  <p style={{ fontSize:13, color: k==='Date'?'#C9A96A':k==='Tarif'&&selected.est_gratuit?'#4CAF50':'#F8F5F2', fontWeight:500 }}>{v}</p>
                </div>
              ))}
            </div>

            {selected.message && (
              <div style={{ padding:'12px 14px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', marginBottom:20, borderRadius:2 }}>
                <p style={{ fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(248,245,242,.22)', marginBottom:6 }}>Message</p>
                <p style={{ fontSize:13, color:'rgba(248,245,242,.5)', fontStyle:'italic', fontWeight:300 }}>{selected.message}</p>
              </div>
            )}

            {/* Lien réunion */}
            <div style={{ marginBottom:14 }}>
              <label style={s.label}>Lien de réunion (Zoom/Meet)</label>
              <input style={s.input} type="url" placeholder="https://zoom.us/j/..." value={lien} onChange={e=>setLien(e.target.value)}/>
            </div>

            {/* Note admin */}
            <div style={{ marginBottom:20 }}>
              <label style={s.label}>Note pour le client</label>
              <textarea style={{ ...s.input, minHeight:80, resize:'vertical' }} placeholder="Message envoyé au client lors de la confirmation ou du refus..." value={note} onChange={e=>setNote(e.target.value)}/>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setSelected(null)} style={{ ...s.btnGhost }}>Annuler</button>
              {selected.statut !== 'refuse' && (
                <button onClick={() => action('refuse')} disabled={saving} style={{ padding:'11px 20px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)', color:'#f87171', fontFamily:"'Montserrat',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}>
                  Refuser
                </button>
              )}
              {selected.statut !== 'confirme' && (
                <button onClick={() => action('confirme')} disabled={saving} style={s.btnOr}>
                  {saving ? '...' : 'Confirmer'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── STYLES PARTAGÉS ───────────────────────────────────────────────
const s = {
  subTitle: { fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:600, color:'#F8F5F2', marginBottom:8 },
  hint:     { fontFamily:"'Montserrat',sans-serif", fontSize:12, fontWeight:300, color:'rgba(248,245,242,.35)', marginBottom:16, lineHeight:1.7 },
  card:     { padding:'20px 24px', background:'rgba(255,255,255,.018)', border:'1px solid rgba(255,255,255,.055)', borderRadius:2, marginBottom:0 },
  cardLabel:{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(201,169,106,.4)', marginBottom:16 },
  label:    { fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(248,245,242,.25)', display:'block', marginBottom:7 },
  input:    { width:'100%', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.07)', color:'#F8F5F2', fontFamily:"'Montserrat',sans-serif", fontSize:13, fontWeight:300, padding:'10px 13px', outline:'none', borderRadius:2, boxSizing:'border-box' },
  error:    { fontSize:12, color:'#f87171', marginTop:8 },
  meta:     { fontSize:12, color:'rgba(248,245,242,.35)', fontWeight:300 },
  btnOr:    { padding:'11px 22px', background:'#C9A96A', border:'none', color:'#060608', fontFamily:"'Montserrat',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 },
  btnGhost: { padding:'11px 18px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(248,245,242,.4)', fontFamily:"'Montserrat',sans-serif", fontSize:10, fontWeight:500, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 },
};

// ── EXPORT PRINCIPAL ──────────────────────────────────────────────
export function RendezVousAdminView() {
  const [onglet, setOnglet] = useState('rdv');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Onglets */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        {[{id:'rdv',label:'Rendez-vous'},{id:'dispos',label:'Disponibilités'}].map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{ padding:'12px 24px', background:'none', border:'none', borderBottom:`2px solid ${onglet===o.id?'#C9A96A':'transparent'}`, color:onglet===o.id?'#C9A96A':'rgba(248,245,242,.3)', fontFamily:"'Montserrat',sans-serif", fontSize:11, fontWeight:onglet===o.id?600:400, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', transition:'all .2s', marginBottom:-1 }}>
            {o.label}
          </button>
        ))}
      </div>

      {onglet === 'rdv'    && <ListeRdvView/>}
      {onglet === 'dispos' && <DispoView/>}
    </div>
  );
}
