/**
 * Service API centralisé — Méta'Morph'Ose
 * Tous les appels backend passent par ce fichier.
 * Coach Prélia APEDO AHONON
 */
import axios from "axios";
import API_URL from "../config";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Intercepteur — ajout automatique du token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mmorphose_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur — gestion erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mmorphose_token");
      localStorage.removeItem("mmorphose_user");
      window.location.href = "/espace-membre";
    }
    return Promise.reject(error);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post("/api/auth/login/",    data),
  register: (data) => api.post("/api/auth/register/", data),
  refresh:  (data) => api.post("/api/auth/refresh/",  data),
};

// ── STORE / LEARNING ─────────────────────────────────────────────
export const learningAPI = {
  listeCours:       (categorie) => api.get("/api/learning/", { params: { categorie } }),
  detailCours:      (slug)      => api.get(`/api/learning/${slug}/`),
  mesCours:         ()          => api.get("/api/learning/mes-cours/"),
  verifierAcces:    (slug)      => api.get(`/api/learning/${slug}/acces/`),
  categories:       ()          => api.get("/api/learning/categories/"),

  // Admin
  adminListeAcces:     (cours_id) => api.get("/api/learning/admin/acces/", { params: { cours_id } }),
  adminActiverAcces:   (data)     => api.post("/api/learning/admin/acces/activer/",    data),
  adminDesactiverAcces:(data)     => api.post("/api/learning/admin/acces/desactiver/", data),
};

// ── MASTERCLASS ───────────────────────────────────────────────────
export const masterclassAPI = {
  liste:    ()          => api.get("/api/masterclass/"),
  reserver: (id, data)  => api.post(`/api/masterclass/${id}/reserver/`, data),

  // Admin
  adminListe:        ()       => api.get("/api/masterclass/admin/"),
  adminCreer:        (data)   => api.post("/api/masterclass/admin/", data),
  adminModifier:     (id, fd) => api.patch(`/api/masterclass/admin/${id}/`, fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminSupprimer:    (id)     => api.delete(`/api/masterclass/admin/${id}/`),
  adminReservations: (id)     => api.get(`/api/masterclass/admin/${id}/reservations/`),
};

// ── COMMUNAUTÉ ────────────────────────────────────────────────────
export const communauteAPI = {
  // fix: valider-cle est dans l'app communaute, verifier est dans l'app acces (clé email-only)
  verifierCle:  (data) => api.post("/api/communaute/valider-cle/", data),
  publications: ()     => api.get("/api/communaute/publications/"),
  publier:      (fd)   => api.post("/api/communaute/publications/", fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  commentaires: (id)   => api.get(`/api/communaute/publications/${id}/commentaires/`),
  commenter:    (id, data) => api.post(`/api/communaute/publications/${id}/commentaires/`, data),

  // Admin
  adminCles:       () => api.get("/api/communaute/admin/cles/"),
  adminGenererCle: (data) => api.post("/api/communaute/admin/cles/generer/", data),
  adminToggleCle:  (id)   => api.patch(`/api/communaute/admin/cles/${id}/toggle/`),
};

// ── ÉVÉNEMENTS ────────────────────────────────────────────────────
export const evenementsAPI = {
  liste:      () => api.get("/api/evenements/"),
  actualites: () => api.get("/api/evenements/actualites/"),

  // Admin
  adminListe:             ()        => api.get("/api/evenements/admin/"),
  adminCreer:             (fd)      => api.post("/api/evenements/admin/", fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminModifier:          (id, fd)  => api.patch(`/api/evenements/admin/${id}/`, fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminSupprimer:         (id)      => api.delete(`/api/evenements/admin/${id}/`),
  adminActualiteListe:    ()        => api.get("/api/evenements/actualites/admin/"),
  adminActualiteCreer:    (fd)      => api.post("/api/evenements/actualites/admin/", fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminActualiteModifier: (id, fd)  => api.patch(`/api/evenements/actualites/admin/${id}/`, fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminActualiteSupprimer:(id)      => api.delete(`/api/evenements/actualites/admin/${id}/`),
};

// ── LIVE ─────────────────────────────────────────────────────────
export const liveAPI = {
  mesSalles: ()          => api.get("/api/live/mes-salles/"),
  creer:     (data)      => api.post("/api/live/creer/", data),
  infos:     (id)        => api.get(`/api/live/${id}/`),
  rejoindre: (id, data)  => api.post(`/api/live/${id}/rejoindre/`, data),
  terminer:  (id)        => api.post(`/api/live/${id}/terminer/`),
};

// ── TÉMOIGNAGES ───────────────────────────────────────────────────
// fix: les URLs correspondaient aux routes du backend
export const avisAPI = {
  liste:         ()       => api.get("/api/avis/"),
  soumettre:     (data)   => api.post("/api/avis/soumettre/", data),

  // Admin
  adminListe:    ()       => api.get("/api/avis/admin/"),
  adminAjouter:  (fd)     => api.post("/api/avis/admin/ajouter/", fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminModifier: (id, fd) => api.patch(`/api/avis/admin/${id}/`, fd, { headers:{ "Content-Type":"multipart/form-data" } }),
  adminApprouver:(id)     => api.post(`/api/avis/admin/${id}/approuver/`),
  adminRefuser:  (id)     => api.post(`/api/avis/admin/${id}/refuser/`),
  adminSupprimer:(id)     => api.delete(`/api/avis/admin/${id}/`),
};

// ── NEWSLETTER ────────────────────────────────────────────────────
export const newsletterAPI = {
  abonner: (data) => api.post("/api/contenu/newsletter/abonner/", data),
};

// ── CONTACT ───────────────────────────────────────────────────────
export const contactAPI = {
  envoyer: (data) => api.post("/api/auth/contact/", data),
};

// ── DON ───────────────────────────────────────────────────────────
// Le don est traité comme un message de contact avec type "don"
export const donAPI = {
  soumettre: (data) => api.post("/api/auth/contact/", { ...data, formule: "DON" }),
};

// ── PARTENAIRES ───────────────────────────────────────────────────
export const partenairesAPI = {
  liste: () => api.get("/api/admin/partenaires/public/"),
};

// ── CONFIG SITE ───────────────────────────────────────────────────
export const configAPI = {
  public: () => api.get("/api/admin/config/public/"),
};

export default api;
