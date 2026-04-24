import { useState, useEffect } from 'react';
import { FORMULES, SECTIONS_CONFIG } from '../constants';
const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
function ReplaysView({ api, toast, refreshKey = 0 }) {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | "add" | replay obj
  const [form,    setForm]    = useState({ titre:"", video_url:"", semaine:1, formules:"F1,F2,F3,F4", actif:true });

  useEffect(() => {
    api("GET", "/replays/").then(d => { if(d) setReplays(d); setLoading(false); });
  }, [refreshKey]);

  function openAdd()  { setForm({ titre:"", video_url:"", semaine:1, formules:"F1,F2,F3,F4", actif:true }); setModal("add"); }
  function openEdit(r){ setForm(r); setModal(r); }

  async function save() {
    if (modal === "add") {
      const created = await api("POST", "/replays/", form);
      if (created) { setReplays(p => [...p, created]); toast("Replay ajouté ", "success"); }
    } else {
      const updated = await api("PATCH", `/replays/${modal.id}/`, form);
      if (updated) { setReplays(p => p.map(x => x.id===modal.id ? updated : x)); toast("Replay modifié ", "success"); }
    }
    setModal(null);
  }

  async function del(r) {
    if (!confirm(`Supprimer "${r.titre}" ?`)) return;
    await api("DELETE", `/replays/${r.id}/`);
    setReplays(p => p.filter(x => x.id!==r.id));
    toast("Replay supprimé", "error");
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Replays</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>Ajouter un replay</button>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        replays.map(r => (
          <div key={r.id} className="row-item">
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(168,200,224,.1)", border:"1px solid rgba(168,200,224,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#A8C8E0", fontSize:".8rem", flexShrink:0 }}>
              S{r.semaine}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)", marginBottom:"2px" }}>{r.titre}</p>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.video_url}</p>
            </div>
            <span className={`badge ${r.actif?"badge-green":"badge-red"}`}>{r.actif?"Actif":"Inactif"}</span>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openEdit(r)} style={{padding:"7px 14px"}}>Modifier</button>
            <button className="admin-btn admin-btn-danger" onClick={()=>del(r)} style={{padding:"7px 12px"}}></button>
          </div>
        ))
      )}

      {/* Modal ajout/édition */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>{modal==="add"?"Ajouter un replay":"Modifier le replay"}</h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {[["Titre", "titre","text"],["URL vidéo","video_url","url"]].map(([label,key,type]) => (
                <div key={key}>
                  <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>{label}</label>
                  <input className="admin-input" type={type} value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={label}/>
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Semaine</label>
                  <input className="admin-input" type="number" min="1" max="8" value={form.semaine} onChange={e=>setForm(f=>({...f,semaine:parseInt(e.target.value)}))}/>
                </div>
                <div>
                  <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Formules accès</label>
                  <input className="admin-input" value={form.formules||""} onChange={e=>setForm(f=>({...f,formules:e.target.value}))} placeholder="F1,F2,F3,F4"/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <input type="checkbox" id="actif-r" checked={form.actif||false} onChange={e=>setForm(f=>({...f,actif:e.target.checked}))} style={{accentColor:"var(--rose)"}}/>
                <label htmlFor="actif-r" style={{ fontSize:".82rem", color:"var(--text-sub)", cursor:"pointer" }}>Visible par les membres</label>
              </div>
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button className="admin-btn admin-btn-primary" onClick={save} style={{flex:1, padding:"12px"}}>
                  {modal==="add" ? "Ajouter" : "Enregistrer"}
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={()=>setModal(null)} style={{flex:1, padding:"12px"}}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── GUIDES ─────────────────────────────────────────────────── */
function GuidesView({ api, toast, refreshKey = 0 }) {
  const [guides,  setGuides]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({ titre:"", numero:1, actif:true });

  useEffect(() => {
    api("GET", "/guides/").then(d => { if(d) setGuides(d); setLoading(false); });
  }, [refreshKey]);

  async function save() {
    if (modal === "add") {
      const created = await api("POST", "/guides/", form);
      if (created) { setGuides(p => [...p, created]); toast("Guide ajouté ", "success"); }
    } else {
      const updated = await api("PATCH", `/guides/${modal.id}/`, { titre:form.titre, numero:form.numero, actif:form.actif });
      if (updated) { setGuides(p => p.map(x => x.id===modal.id ? updated : x)); toast("Guide modifié ", "success"); }
    }
    setModal(null);
  }

  async function del(g) {
    if (!confirm(`Supprimer "${g.titre}" ?`)) return;
    await api("DELETE", `/guides/${g.id}/`);
    setGuides(p => p.filter(x => x.id!==g.id));
    toast("Guide supprimé", "error");
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Guides PDF · Bonus</h2>
        <button className="admin-btn admin-btn-primary" onClick={()=>{ setForm({titre:"",numero:guides.length+1,actif:true}); setModal("add"); }}>Ajouter un guide</button>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        guides.map(g => (
          <div key={g.id} className="row-item">
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--or)", fontSize:".75rem", fontWeight:700, flexShrink:0 }}>
              {g.numero}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)", marginBottom:"2px" }}>{g.titre}</p>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300 }}>
                {g.fichier ? "Fichier PDF uploadé " : "Pas encore de fichier"}
              </p>
            </div>
            <span className={`badge ${g.actif?"badge-green":"badge-red"}`}>{g.actif?"Actif":"Inactif"}</span>
            <button className="admin-btn admin-btn-secondary" onClick={()=>{ setForm(g); setModal(g); }} style={{padding:"7px 14px"}}>Modifier</button>
            <button className="admin-btn admin-btn-danger" onClick={()=>del(g)} style={{padding:"7px 12px"}}></button>
          </div>
        ))
      )}

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>{modal==="add"?"Ajouter un guide":"Modifier le guide"}</h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div>
                <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Titre du guide</label>
                <input className="admin-input" value={form.titre||""} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="Titre du guide PDF"/>
              </div>
              <div>
                <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Numéro (ordre)</label>
                <input className="admin-input" type="number" min="1" max="7" value={form.numero||1} onChange={e=>setForm(f=>({...f,numero:parseInt(e.target.value)}))}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <input type="checkbox" id="actif-g" checked={form.actif||false} onChange={e=>setForm(f=>({...f,actif:e.target.checked}))} style={{accentColor:"var(--rose)"}}/>
                <label htmlFor="actif-g" style={{ fontSize:".82rem", color:"var(--text-sub)", cursor:"pointer" }}>Visible par les membres</label>
              </div>
              <div style={{ padding:"12px", background:"rgba(255,255,255,.03)", border:"1px solid var(--border)", borderRadius:"3px", fontSize:".78rem", color:"var(--text-sub)", fontStyle:"italic" }}>
                Pour uploader le fichier PDF, utilisez l'interface admin Django :<br/>
                <a href="https://metamorphose-backend.onrender.com/admin" target="_blank" rel="noreferrer" style={{color:"var(--or)"}}>Accéder à l'admin Django</a>
              </div>
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button className="admin-btn admin-btn-primary" onClick={save} style={{flex:1,padding:"12px"}}>{modal==="add"?"Ajouter":"Enregistrer"}</button>
                <button className="admin-btn admin-btn-secondary" onClick={()=>setModal(null)} style={{flex:1,padding:"12px"}}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CONFIG SITE ────────────────────────────────────────────── */
function ConfigView({ api, toast, sectionFilter = null, refreshKey = 0 }) {
  const [configs,  setConfigs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [section,  setSection]  = useState(sectionFilter || "hero");
  const [edits,    setEdits]    = useState({});
  const [saving,   setSaving]   = useState({});

  // ── Schéma complet de tous les champs du site ─────────────────
  const SCHEMA = {
    hero: [
      { cle:"hero_titre",      label:"Titre principal",        type:"textarea", placeholder:"De l'ombre à la lumière" },
      { cle:"hero_sous_titre", label:"Sous-titre",             type:"textarea", placeholder:"Programme de transformation féminine" },
      { cle:"hero_mention",    label:"Mention sous le titre",  type:"text",     placeholder:"Un programme créé par Prélia APEDO AHONON" },
      { cle:"hero_btn1",       label:"Texte bouton 1",         type:"text",     placeholder:"Je m'inscris" },
      { cle:"hero_btn2",       label:"Texte bouton 2",         type:"text",     placeholder:"Découvrir le programme" },
      { cle:"image_hero",      label:"Image Hero (URL)",       type:"url",      placeholder:"https://res.cloudinary.com/..." },
      { cle:"slide_1",         label:"Slide 1 (URL image)",    type:"url",      placeholder:"https://res.cloudinary.com/..." },
      { cle:"slide_2",         label:"Slide 2 (URL image)",    type:"url",      placeholder:"https://res.cloudinary.com/..." },
      { cle:"slide_3",         label:"Slide 3 (URL image)",    type:"url",      placeholder:"https://res.cloudinary.com/..." },
      { cle:"slide_4",         label:"Slide 4 (URL image)",    type:"url",      placeholder:"https://res.cloudinary.com/..." },
      { cle:"slide_5",         label:"Slide 5 (URL image)",    type:"url",      placeholder:"https://res.cloudinary.com/..." },
    ],
    probleme: [
      { cle:"probleme_titre",    label:"Titre de la section",   type:"text",     placeholder:"Vous reconnaissez-vous ?" },
      { cle:"probleme_intro",    label:"Texte d'introduction",  type:"textarea", placeholder:"..." },
      { cle:"probleme_citation", label:"Citation mise en avant", type:"textarea", placeholder:"..." },
    ],
    methode: [
      { cle:"methode_titre",  label:"Titre Méthode",       type:"text",     placeholder:"La méthode MÉTA/MORPH/OSE" },
      { cle:"meta_titre",     label:"Titre MÉTA",          type:"text",     placeholder:"MÉTA" },
      { cle:"meta_desc",      label:"Description MÉTA",    type:"textarea", placeholder:"..." },
      { cle:"meta_semaines",  label:"Semaines MÉTA",       type:"text",     placeholder:"Semaines 1-2" },
      { cle:"meta_items",     label:"Points MÉTA (séparés par |)", type:"textarea", placeholder:"Point 1|Point 2|Point 3" },
      { cle:"morph_titre",    label:"Titre MORPH",         type:"text",     placeholder:"MORPH" },
      { cle:"morph_desc",     label:"Description MORPH",   type:"textarea", placeholder:"..." },
      { cle:"morph_semaines", label:"Semaines MORPH",      type:"text",     placeholder:"Semaines 3-5" },
      { cle:"morph_items",    label:"Points MORPH (séparés par |)", type:"textarea", placeholder:"Point 1|Point 2" },
      { cle:"ose_titre",      label:"Titre OSE",           type:"text",     placeholder:"OSE" },
      { cle:"ose_desc",       label:"Description OSE",     type:"textarea", placeholder:"..." },
      { cle:"ose_semaines",   label:"Semaines OSE",        type:"text",     placeholder:"Semaines 6-8" },
      { cle:"ose_items",      label:"Points OSE (séparés par |)", type:"textarea", placeholder:"Point 1|Point 2" },
    ],
    programme: [
      { cle:"programme_titre", label:"Titre section Programme", type:"text",     placeholder:"8 semaines pour vous transformer" },
      { cle:"inclus_items",    label:"Ce qui est inclus (séparés par |)", type:"textarea", placeholder:"Item 1|Item 2|Item 3" },
    ],
    avant_apres: [
      { cle:"aa_titre", label:"Titre Avant/Après",       type:"text",     placeholder:"Avant & Après" },
      { cle:"aa_intro", label:"Introduction Avant/Après", type:"textarea", placeholder:"..." },
    ],
    pour_qui: [
      { cle:"pq_titre",     label:"Titre Pour qui",           type:"text",     placeholder:"Ce programme est fait pour vous si…" },
      { cle:"pq_items",     label:"Points Pour qui (séparés par |)", type:"textarea", placeholder:"Vous vous sentez perdue|..." },
      { cle:"pq_non_titre", label:"Titre Pour qui PAS",       type:"text",     placeholder:"Ce programme n'est pas pour vous si…" },
      { cle:"pq_non_texte", label:"Texte Pour qui PAS",       type:"textarea", placeholder:"..." },
    ],
    prelia: [
      { cle:"prelia_titre",          label:"Titre section Prélia",        type:"text",     placeholder:"Votre coach" },
      { cle:"prelia_texte1",         label:"Paragraphe 1",                type:"textarea", placeholder:"..." },
      { cle:"prelia_texte2",         label:"Paragraphe 2",                type:"textarea", placeholder:"..." },
      { cle:"prelia_citation",       label:"Citation de Prélia",          type:"textarea", placeholder:"Je sais ce que cela fait…" },
      { cle:"prelia_signature",      label:"Signature",                   type:"text",     placeholder:"Prélia APEDO AHONON" },
      { cle:"prelia_certifications", label:"Certifications (séparées par |)", type:"textarea", placeholder:"Coach certifiée|Styliste certifiée" },
      { cle:"photo_prelia",          label:"Photo de Prélia (URL)",       type:"url",      placeholder:"https://res.cloudinary.com/..." },
    ],
    valeurs: [
      { cle:"valeurs_titre", label:"Titre section Valeurs",          type:"text",     placeholder:"Nos valeurs" },
      { cle:"valeurs_intro", label:"Introduction Valeurs",           type:"textarea", placeholder:"..." },
      { cle:"valeurs_items", label:"Valeurs (format Nom:Desc séparés par |)", type:"textarea", placeholder:"Authenticité:Description|Bienveillance:Description" },
    ],
    temoignages: [
      { cle:"temo_titre",     label:"Titre section Témoignages",  type:"text",     placeholder:"Elles ont osé" },
      { cle:"temo_intro",     label:"Introduction Témoignages",   type:"textarea", placeholder:"..." },
      { cle:"temo_video_url", label:"URL vidéo témoignage",       type:"url",      placeholder:"https://youtube.com/..." },
    ],
    formules: [
      { cle:"formules_titre", label:"Titre section Formules",    type:"text",     placeholder:"Choisissez votre formule" },
      { cle:"formules_intro", label:"Introduction Formules",     type:"textarea", placeholder:"Toutes les formules incluent…" },
      { cle:"f1_label",       label:"Nom Formule 1",             type:"text",     placeholder:"ESSENTIELLE" },
      { cle:"f1_prix",        label:"Prix Formule 1 (sans FCFA)", type:"text",    placeholder:"70 000" },
      { cle:"f2_label",       label:"Nom Formule 2",             type:"text",     placeholder:"PERSONNALISÉE" },
      { cle:"f2_prix",        label:"Prix Formule 2 (sans FCFA)", type:"text",    placeholder:"160 000" },
      { cle:"f3_label",       label:"Nom Formule 3",             type:"text",     placeholder:"IMMERSION" },
      { cle:"f3_prix",        label:"Prix Formule 3 (sans FCFA)", type:"text",    placeholder:"267 000" },
      { cle:"f4_label",       label:"Nom Formule 4",             type:"text",     placeholder:"VIP" },
      { cle:"f4_prix",        label:"Prix Formule 4 (sans FCFA)", type:"text",    placeholder:"370 000" },
    ],
    faq: [
      { cle:"faq_titre", label:"Titre section FAQ",  type:"text", placeholder:"Questions fréquentes" },
      { cle:"faq_q1",    label:"Question 1",          type:"text", placeholder:"..." },
      { cle:"faq_r1",    label:"Réponse 1",           type:"textarea", placeholder:"..." },
      { cle:"faq_q2",    label:"Question 2",          type:"text", placeholder:"..." },
      { cle:"faq_r2",    label:"Réponse 2",           type:"textarea", placeholder:"..." },
      { cle:"faq_q3",    label:"Question 3",          type:"text", placeholder:"..." },
      { cle:"faq_r3",    label:"Réponse 3",           type:"textarea", placeholder:"..." },
      { cle:"faq_q4",    label:"Question 4",          type:"text", placeholder:"..." },
      { cle:"faq_r4",    label:"Réponse 4",           type:"textarea", placeholder:"..." },
      { cle:"faq_q5",    label:"Question 5",          type:"text", placeholder:"..." },
      { cle:"faq_r5",    label:"Réponse 5",           type:"textarea", placeholder:"..." },
      { cle:"faq_q6",    label:"Question 6",          type:"text", placeholder:"..." },
      { cle:"faq_r6",    label:"Réponse 6",           type:"textarea", placeholder:"..." },
    ],
    cta: [
      { cle:"cta_titre",  label:"Titre CTA final",     type:"text",     placeholder:"Prête à vous transformer ?" },
      { cle:"cta_texte",  label:"Texte CTA",           type:"textarea", placeholder:"..." },
      { cle:"cta_phrase", label:"Phrase d'accroche",   type:"text",     placeholder:"..." },
      { cle:"cta_btn1",   label:"Texte bouton 1",      type:"text",     placeholder:"Je m'inscris" },
      { cle:"cta_btn2",   label:"Texte bouton 2",      type:"text",     placeholder:"En savoir plus" },
    ],
    footer: [
      { cle:"footer_email",     label:"Email de contact",    type:"text", placeholder:"contact@metamorphose.com" },
      { cle:"footer_tel1",      label:"Téléphone 1",         type:"text", placeholder:"+229 01 96 11 40 93" },
      { cle:"footer_tel2",      label:"Téléphone 2",         type:"text", placeholder:"..." },
      { cle:"footer_signature", label:"Signature footer",    type:"text", placeholder:"© 2026 Méta'Morph'Ose" },
    ],
    images: [
      { cle:"logo_site",        label:"Logo principal (URL)",       type:"url", placeholder:"https://res.cloudinary.com/..." },
      { cle:"logo_white_black", label:"Logo White & Black (URL)",   type:"url", placeholder:"https://res.cloudinary.com/..." },
    ],
    vague: [
      { cle:"vague_nom",            label:"Nom de la vague",          type:"text", placeholder:"Vague 1" },
      { cle:"vague_active",         label:"Vague active (true/false)", type:"text", placeholder:"true" },
      { cle:"vague_places_total",   label:"Places totales",           type:"text", placeholder:"20" },
      { cle:"vague_places_prises",  label:"Places prises",            type:"text", placeholder:"0" },
      { cle:"vague_date_fermeture", label:"Date fermeture (ISO)",     type:"text", placeholder:"2026-05-01T00:00:00Z" },
    ],
    stats_site: [
      { cle:"stat_femmes",       label:"Nombre de femmes accompagnées", type:"text", placeholder:"200+" },
      { cle:"stat_satisfaction", label:"Taux de satisfaction",         type:"text", placeholder:"98%" },
      { cle:"stat_semaines",     label:"Durée programme",              type:"text", placeholder:"8 semaines" },
      { cle:"stat_pays",         label:"Nombre de pays",               type:"text", placeholder:"5 pays" },
      { cle:"stat_label1",       label:"Label stat 1",                 type:"text", placeholder:"Femmes transformées" },
      { cle:"stat_label2",       label:"Label stat 2",                 type:"text", placeholder:"Satisfaction" },
      { cle:"stat_label3",       label:"Label stat 3",                 type:"text", placeholder:"Programme" },
      { cle:"stat_label4",       label:"Label stat 4",                 type:"text", placeholder:"Pays" },
    ],
    contact: [
      { cle:"contact_titre",     label:"Titre page Contact",        type:"text",     placeholder:"Contactez-nous" },
      { cle:"contact_intro",     label:"Introduction Contact",      type:"textarea", placeholder:"Nous sommes à votre écoute…" },
      { cle:"contact_delai",     label:"Délai de réponse",          type:"text",     placeholder:"Nous répondons dans 24 à 48h." },
      { cle:"contact_email1",    label:"Email principal",           type:"text",     placeholder:"contact@preliaapedo.com" },
      { cle:"contact_email2",    label:"Email secondaire",          type:"text",     placeholder:"whiteblackdress22@gmail.com" },
      { cle:"contact_citation",  label:"Citation finale",           type:"textarea", placeholder:"Chaque message est important…" },
      { cle:"contact_signature", label:"Signature finale",          type:"text",     placeholder:"Métamorphose — Révéler la femme…" },
      { cle:"whatsapp_numero",   label:"Numéro WhatsApp",           type:"text",     placeholder:"+22901961493" },
      { cle:"whatsapp_message",  label:"Message WhatsApp auto",     type:"text",     placeholder:"Bonjour, je souhaite m'inscrire…" },
    ],
    diagnostic: [
      { cle:"res_section_titre", label:"Titre section Ressources",  type:"text",     placeholder:"Ressources offertes" },
      { cle:"res_section_desc",  label:"Description Ressources",    type:"textarea", placeholder:"..." },
      { cle:"res_chanson_titre", label:"Titre de la chanson",       type:"text",     placeholder:"..." },
      { cle:"res_chanson_artiste",label:"Artiste de la chanson",    type:"text",     placeholder:"..." },
      { cle:"res_chanson_desc",  label:"Description chanson",       type:"textarea", placeholder:"..." },
      { cle:"res_audio_url",     label:"URL audio (mp3)",           type:"url",      placeholder:"https://..." },
      { cle:"res_guide_titre",   label:"Titre du guide PDF",        type:"text",     placeholder:"..." },
      { cle:"res_guide_sous",    label:"Sous-titre du guide",       type:"text",     placeholder:"..." },
      { cle:"res_guide_desc",    label:"Description du guide",      type:"textarea", placeholder:"..." },
      { cle:"res_guide_point1",  label:"Point 1 du guide",          type:"text",     placeholder:"..." },
      { cle:"res_guide_point2",  label:"Point 2 du guide",          type:"text",     placeholder:"..." },
      { cle:"res_guide_point3",  label:"Point 3 du guide",          type:"text",     placeholder:"..." },
      { cle:"res_pdf_url",       label:"URL du guide PDF",          type:"url",      placeholder:"https://..." },
      { cle:"res_citation_finale",label:"Citation finale",          type:"textarea", placeholder:"..." },
    ],
    paiement: [
      { cle:"paiement_lien_f1", label:"Lien paiement ESSENTIELLE (70 000 FCFA)",   type:"url", placeholder:"https://..." },
      { cle:"paiement_lien_f2", label:"Lien paiement PERSONNALISÉE (160 000 FCFA)", type:"url", placeholder:"https://..." },
      { cle:"paiement_lien_f3", label:"Lien paiement IMMERSION (267 000 FCFA)",     type:"url", placeholder:"https://..." },
      { cle:"paiement_lien_f4", label:"Lien paiement VIP (370 000 FCFA)",           type:"url", placeholder:"https://..." },
    ],
    masterclass: [
      { cle:"mc_titre",         label:"Titre Masterclass",          type:"text",     placeholder:"Masterclass GRATUITE" },
      { cle:"mc_sous_titre",    label:"Sous-titre",                 type:"textarea", placeholder:"..." },
      { cle:"mc_date",          label:"Date de la masterclass",     type:"text",     placeholder:"Dimanche 26 avril · 17h GMT" },
      { cle:"mc_places",        label:"Nombre de places",           type:"text",     placeholder:"50" },
      { cle:"mc_btn_inscription",label:"Texte bouton inscription",  type:"text",     placeholder:"Je réserve ma place" },
      { cle:"mc_whatsapp",      label:"Lien groupe WhatsApp",       type:"url",      placeholder:"https://chat.whatsapp.com/..." },
      { cle:"mc_programme_titre",label:"Titre section programme",   type:"text",     placeholder:"Au programme" },
      { cle:"mc_programme_items",label:"Points programme (séparés par |)", type:"textarea", placeholder:"Item 1|Item 2" },
    ],
    evenements: [
      { cle:"evt_titre",        label:"Titre page Événements",      type:"text",     placeholder:"Nos Événements" },
      { cle:"evt_intro",        label:"Introduction Événements",    type:"textarea", placeholder:"..." },
      { cle:"brunch_titre",     label:"Titre Brunch",               type:"text",     placeholder:"Brunch Métamorphose" },
      { cle:"brunch_intro",     label:"Introduction Brunch",        type:"textarea", placeholder:"..." },
      { cle:"brunch_date",      label:"Date du Brunch",             type:"text",     placeholder:"..." },
      { cle:"brunch_lieu",      label:"Lieu du Brunch",             type:"text",     placeholder:"Cotonou, Bénin" },
      { cle:"brunch_prix",      label:"Prix du Brunch",             type:"text",     placeholder:"15 000 FCFA" },
      { cle:"brunch_lien_paiement",      label:"Lien paiement Brunch (général)",       type:"url",  placeholder:"https://..." },
      { cle:"brunch_lien_metamorphosee",  label:"Lien paiement Pass Métamorphosée",    type:"url",  placeholder:"https://..." },
      { cle:"brunch_lien_decouverte",     label:"Lien paiement Pass Découverte",        type:"url",  placeholder:"https://..." },
      { cle:"brunch_lien_vip",            label:"Lien paiement Pass VIP",               type:"url",  placeholder:"https://..." },
      { cle:"brunch_whatsapp_groupe",     label:"Lien groupe WhatsApp Brunch (SECRET)", type:"url",  placeholder:"https://chat.whatsapp.com/..." },
    ],
    learning: [
      { cle:"learning_label",  label:"Label au-dessus du titre",   type:"text",     placeholder:"Méta'Morph'Ose · Académie" },
      { cle:"learning_titre",  label:"Titre MMO Learning",         type:"text",     placeholder:"MMO Learning" },
      { cle:"learning_intro1", label:"Paragraphe d'intro 1",       type:"textarea", placeholder:"Cet espace a été conçu…" },
      { cle:"learning_intro2", label:"Paragraphe d'intro 2",       type:"textarea", placeholder:"Ici, tu trouveras…" },
      { cle:"learning_intro3", label:"Paragraphe d'intro 3",       type:"textarea", placeholder:"Chaque contenu est…" },
    ],
    cartes: [
      { cle:"cartes_label",    label:"Label au-dessus du titre",   type:"text",     placeholder:"Offrir une transformation" },
      { cle:"cartes_titre",    label:"Titre Cartes Cadeaux",       type:"text",     placeholder:"La Carte Cadeau" },
      { cle:"cartes_intro",    label:"Introduction",               type:"textarea", placeholder:"Offrez à une femme…" },
    ],
    communaute: [
      { cle:"comm_label",          label:"Label cercle privé",         type:"text",     placeholder:"Cercle privé — Réservé aux Métamorphosées" },
      { cle:"comm_titre1",         label:"Titre ligne 1",              type:"text",     placeholder:"Bienvenue dans" },
      { cle:"comm_titre2",         label:"Titre ligne 2 (italique or)", type:"text",    placeholder:"un espace d'exception." },
      { cle:"comm_intro",          label:"Texte d'introduction",       type:"textarea", placeholder:"Cette communauté est un cercle privé…" },
      { cle:"comm_principes_intro",label:"Intro des principes",        type:"textarea", placeholder:"Pour préserver la qualité…" },
      { cle:"comm_btn",            label:"Texte bouton rejoindre",     type:"text",     placeholder:"Rejoindre la communauté MMO" },
    ],
    communaute_abos: [
      { cle:"communaute_lien_elevation",    label:"Lien paiement Abonnement Élévation",    type:"url", placeholder:"https://..." },
      { cle:"communaute_lien_rayonnement",  label:"Lien paiement Abonnement Rayonnement",  type:"url", placeholder:"https://..." },
      { cle:"communaute_lien_influence",    label:"Lien paiement Abonnement Influence",    type:"url", placeholder:"https://..." },
      { cle:"communaute_lien_paiement",     label:"Lien paiement général (fallback)",      type:"url", placeholder:"https://..." },
    ],
    don: [
      { cle:"don_titre",        label:"Titre page Don",             type:"text",     placeholder:"Soutenir Métamorphose" },
      { cle:"don_intro",        label:"Introduction Don",           type:"textarea", placeholder:"..." },
      { cle:"don_citation",     label:"Citation motivante",         type:"textarea", placeholder:"..." },
      { cle:"don_lien_paiement",label:"Lien de paiement pour les dons", type:"url", placeholder:"https://..." },
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token");
    fetch(`${API_BASE}/api/admin/config/`, {
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => {
        if (Array.isArray(d)) {
          setConfigs(d);
          const e = {};
          d.forEach(c => { e[c.cle] = c.valeur; });
          setEdits(e);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  async function saveField(cle, sectionId) {
    setSaving(s => ({...s, [cle]:true}));
    await api("POST", "/config/update/", { cle, valeur: edits[cle] || "", section: sectionId });
    setSaving(s => ({...s, [cle]:false}));
    toast(`Enregistré ✓`, "success");
  }

  async function saveAll(sectionId) {
    const fields = SCHEMA[sectionId] || [];
    for (const f of fields) {
      await api("POST", "/config/update/", { cle: f.cle, valeur: edits[f.cle] || "", section: sectionId });
    }
    toast("Toute la section enregistrée ✓", "success");
  }

  const activeSectionId = sectionFilter || section;
  const fields = SCHEMA[activeSectionId] || [];

  return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Contenu du site</h2>
        <p style={{ fontSize:".82rem", color:"var(--text-sub)", fontWeight:300 }}>Modifiez les textes et informations affichés sur le site en temps réel.</p>
      </div>

      {/* Onglets sections */}
      {!sectionFilter && (
        <div style={{ display:"flex", gap:"6px", marginBottom:"24px", flexWrap:"wrap" }}>
          {SECTIONS_CONFIG.map(s => (
            <button key={s.id} onClick={()=>setSection(s.id)}
              className="admin-btn"
              style={{ background:section===s.id?"var(--rose)":"rgba(255,255,255,.05)", color:section===s.id?"#fff":"var(--text-sub)" }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>
      ) : (
        <>
          {/* Bouton tout enregistrer */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"20px" }}>
            <button className="admin-btn admin-btn-primary" onClick={()=>saveAll(activeSectionId)}>
              Tout enregistrer
            </button>
          </div>

          {/* Champs prédéfinis */}
          {fields.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {fields.map(f => (
                <div key={f.cle} style={{ padding:"20px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"4px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <div>
                      <label style={{ fontSize:".72rem", fontWeight:600, color:"var(--text)", display:"block" }}>{f.label}</label>
                      <span style={{ fontSize:".6rem", letterSpacing:".12em", color:"var(--text-sub)", fontFamily:"monospace" }}>{f.cle}</span>
                    </div>
                    <button className="admin-btn admin-btn-primary" onClick={()=>saveField(f.cle, activeSectionId)}
                      style={{ padding:"7px 16px", opacity: saving[f.cle]?.8:1, flexShrink:0 }}>
                      {saving[f.cle] ? "…" : "Enregistrer"}
                    </button>
                  </div>
                  {f.type === "textarea" ? (
                    <textarea className="admin-input" rows={3}
                      value={edits[f.cle] || ""}
                      placeholder={f.placeholder}
                      onChange={e=>setEdits(ed=>({...ed,[f.cle]:e.target.value}))}
                      style={{ resize:"vertical", minHeight:"80px" }}/>
                  ) : (
                    <input className="admin-input" type="text"
                      value={edits[f.cle] || ""}
                      placeholder={f.placeholder}
                      onChange={e=>setEdits(ed=>({...ed,[f.cle]:e.target.value}))}/>
                  )}
                  {f.type === "url" && edits[f.cle] && (
                    <div style={{ marginTop:"8px" }}>
                      <img src={edits[f.cle]} alt={f.label}
                        style={{ maxHeight:"60px", maxWidth:"200px", objectFit:"contain", opacity:.7, borderRadius:"4px" }}
                        onError={e=>e.target.style.display="none"}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding:"32px", background:"rgba(255,255,255,.02)", border:"1px solid var(--border)", borderRadius:"4px", textAlign:"center" }}>
              <p style={{ color:"var(--text-sub)", fontSize:".85rem" }}>Aucun champ défini pour cette section.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}


/* ── IMAGES / LOGOS ─────────────────────────────────────────── */

export { ReplaysView, GuidesView, ConfigView };
