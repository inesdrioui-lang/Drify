import type { Metadata } from 'next'
import { joinWaitlistPro } from '@/app/locataire/actions'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Drify Pro — Les outils des grands réseaux, sans les contraintes',
  description: 'Plateforme dédiée aux mandataires, agences et administrateurs de biens. Centralisez vos annonces, recevez des dossiers qualifiés et automatisez votre reporting.',
}

const FEATURES = [
  {
    title: 'Portefeuille centralisé',
    desc: 'Toutes vos annonces en un seul endroit. Publiez, modifiez, archivez sans jongler entre outils.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    title: 'Dossiers locataires qualifiés',
    desc: 'Recevez des candidatures avec dossiers complets et scorés. Finies les pièces manquantes et les allers-retours.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Reporting automatique',
    desc: "Envoyez des comptes-rendus d'activité à vos propriétaires en 1 clic. Professionnel, sans effort.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    title: 'Collaboration équipe',
    desc: 'Plusieurs agents sur le même portefeuille. Idéal pour les agences avec plusieurs collaborateurs.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

const TESTIMONIALS = [
  {
    quote: "Avant Drify, je recevais des dossiers incomplets par email. Maintenant les candidats arrivent préparés, c'est un gain de temps énorme.",
    name: 'Sophie M.',
    role: 'Mandataire IAD',
    ville: 'Lyon',
    initiales: 'SM',
  },
  {
    quote: "Mes propriétaires reçoivent leurs rapports automatiquement chaque mois. Ça a vraiment amélioré ma relation client.",
    name: 'Thomas B.',
    role: 'Administrateur de biens',
    ville: 'Bordeaux',
    initiales: 'TB',
  },
  {
    quote: "On est une petite agence de 4 agents et Drify nous a permis de travailler comme si on était 10. Tout est centralisé.",
    name: 'Agence Immopolis',
    role: 'Agence indépendante',
    ville: 'Toulouse',
    initiales: 'AI',
  },
]

const FAQ = [
  {
    q: 'Est-ce compatible avec mes outils actuels ?',
    a: "Drify est une plateforme web autonome. Elle ne nécessite pas de connexion avec vos logiciels existants pour fonctionner. Une synchronisation avec les logiciels de transaction (Hektor, Apimo…) est prévue dans les prochaines versions.",
  },
  {
    q: 'Puis-je migrer mon portefeuille existant ?',
    a: "Oui. Nous proposons une importation guidée de vos annonces via CSV ou manuellement. Notre équipe vous accompagne dans la migration pour les comptes Agence.",
  },
  {
    q: 'Quelle différence avec Hektor ou Apimo ?',
    a: "Hektor et Apimo sont des logiciels de transaction (CRM, mandat, comptabilité). Drify se concentre sur la mise en relation qualifiée locataire/propriétaire et la gestion des dossiers. Les deux sont complémentaires.",
  },
  {
    q: 'Les locataires doivent-ils être sur Drify ?',
    a: "Pour recevoir des dossiers complets et scorés, oui — les locataires créent leur profil gratuitement. Vous pouvez aussi inviter vos candidats à rejoindre Drify via un lien personnel.",
  },
  {
    q: "Comment fonctionne l'accès multi-utilisateurs ?",
    a: "Sur le plan Agence, vous pouvez inviter jusqu'à 10 collaborateurs sur votre compte. Chaque agent a son propre accès avec les permissions que vous définissez.",
  },
]

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ joined?: string; error?: string }>
}) {
  const { joined, error } = await searchParams

  return (
    <>
      <style>{`
        body { background: var(--bg); }

        /* ────────────────────────────
           HERO
        ──────────────────────────── */
        .pro-hero {
          max-width: 1100px; margin: 0 auto;
          padding: 80px 40px 100px;
          display: grid; grid-template-columns: 1fr 480px;
          gap: 64px; align-items: center;
        }
        .pro-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #EDE0CF; border: 1px solid var(--border);
          border-radius: 99px; padding: 5px 14px;
          font-size: 12px; font-weight: 700; color: var(--brown-mid);
          margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .pro-hero h1 {
          font-size: 48px; font-weight: 800; color: var(--brown);
          letter-spacing: -1.2px; line-height: 1.08; margin-bottom: 20px;
        }
        .pro-hero h1 em {
          font-style: normal; color: var(--brown-mid);
        }
        .pro-hero p {
          font-size: 17px; color: var(--text-muted);
          line-height: 1.65; margin-bottom: 32px; max-width: 440px;
        }
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
        .btn-hero-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          font-size: 15px; font-weight: 700; color: #fff;
          background: var(--brown); border: none; text-decoration: none;
          transition: opacity 0.15s, transform 0.12s; cursor: pointer; font-family: inherit;
        }
        .btn-hero-primary:hover { opacity: 0.88; }
        .btn-hero-primary:active { transform: scale(0.97); }
        .btn-hero-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 24px; border-radius: 12px;
          font-size: 15px; font-weight: 600; color: var(--brown-mid);
          background: transparent; border: 1.5px solid var(--border);
          text-decoration: none; transition: background 0.15s, border-color 0.15s;
        }
        .btn-hero-ghost:hover { background: var(--bg-soft); border-color: var(--brown-light); }
        .hero-social { font-size: 13px; color: var(--text-light); display: flex; align-items: center; gap: 6px; }
        .hero-social strong { color: var(--brown-mid); }

        /* Mockup placeholder */
        .hero-mockup {
          background: var(--bg-soft); border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(61,46,34,0.12);
        }
        .mockup-bar {
          background: var(--bg-card); border-bottom: 1px solid var(--border);
          padding: 12px 16px; display: flex; gap: 6px; align-items: center;
        }
        .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-body { padding: 20px; }
        .mockup-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .mockup-metric {
          flex: 1; background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px;
        }
        .mockup-metric-val { font-size: 22px; font-weight: 800; color: var(--brown); margin-bottom: 2px; }
        .mockup-metric-lbl { font-size: 11px; color: var(--text-muted); }
        .mockup-list { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .mockup-li { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border-soft); }
        .mockup-li:last-child { border-bottom: none; }
        .mockup-avatar { width: 28px; height: 28px; border-radius: 8px; background: #EDE0CF; flex-shrink: 0; }
        .mockup-line { height: 8px; border-radius: 99px; background: var(--border); flex: 1; }
        .mockup-chip { width: 50px; height: 18px; border-radius: 99px; background: #EAF3EE; flex-shrink: 0; }

        /* ────────────────────────────
           DOULEURS
        ──────────────────────────── */
        .pro-section { max-width: 1100px; margin: 0 auto; padding: 80px 40px; }
        .section-label {
          font-size: 12px; font-weight: 700; color: var(--brown-mid);
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;
        }
        .section-title {
          font-size: 36px; font-weight: 800; color: var(--brown);
          letter-spacing: -0.8px; margin-bottom: 12px; line-height: 1.1;
        }
        .section-sub { font-size: 16px; color: var(--text-muted); max-width: 520px; margin-bottom: 48px; }
        .pain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .pain-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px 24px;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .pain-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,46,34,0.09); }
        .pain-icon {
          width: 48px; height: 48px; border-radius: 13px;
          background: #FDF4E3; border: 1px solid #F5D98B;
          display: flex; align-items: center; justify-content: center;
          color: #9B7226; margin-bottom: 16px;
        }
        .pain-title { font-size: 16px; font-weight: 700; color: var(--brown); margin-bottom: 8px; }
        .pain-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

        /* ────────────────────────────
           FEATURES (alternance)
        ──────────────────────────── */
        .features-list { display: flex; flex-direction: column; gap: 64px; }
        .feature-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        .feature-row.reverse { direction: rtl; }
        .feature-row.reverse > * { direction: ltr; }
        .feature-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          background: #EDE0CF; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--brown-mid); margin-bottom: 16px;
        }
        .feature-title { font-size: 24px; font-weight: 800; color: var(--brown); letter-spacing: -0.4px; margin-bottom: 10px; }
        .feature-desc { font-size: 15px; color: var(--text-muted); line-height: 1.65; }
        .feature-mockup {
          background: var(--bg-soft); border: 1px solid var(--border);
          border-radius: 16px; padding: 24px;
          box-shadow: 0 8px 32px rgba(61,46,34,0.08);
          min-height: 200px; display: flex; flex-direction: column; gap: 12px;
        }

        /* ────────────────────────────
           PRICING
        ──────────────────────────── */
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .pricing-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 20px; padding: 32px 28px;
          position: relative; transition: transform 0.18s, box-shadow 0.18s;
        }
        .pricing-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(61,46,34,0.10); }
        .pricing-card.featured {
          background: var(--brown); color: #fff;
          border-color: var(--brown);
          transform: scale(1.02);
        }
        .pricing-card.featured:hover { transform: scale(1.02) translateY(-2px); }
        .pricing-popular {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: #9B7226; color: #fff; font-size: 11px; font-weight: 700;
          padding: 4px 14px; border-radius: 99px; white-space: nowrap;
          letter-spacing: 0.3px; text-transform: uppercase;
        }
        .pricing-plan { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .pricing-card.featured .pricing-plan { color: rgba(255,255,255,0.75); }
        .pricing-price { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 4px; line-height: 1; }
        .pricing-card.featured .pricing-price { color: #fff; }
        .pricing-period { font-size: 13px; margin-bottom: 24px; }
        .pricing-card.featured .pricing-period { color: rgba(255,255,255,0.7); }
        .pricing-features { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-features li { font-size: 14px; display: flex; align-items: flex-start; gap: 8px; }
        .pricing-card.featured .pricing-features li { color: rgba(255,255,255,0.9); }
        .pricing-check { color: #4A7C59; flex-shrink: 0; margin-top: 2px; }
        .pricing-card.featured .pricing-check { color: #A5D6A7; }
        .btn-pricing {
          width: 100%; padding: 12px; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: inherit; text-align: center; text-decoration: none;
          display: block; transition: opacity 0.15s, background 0.15s;
        }
        .btn-pricing-ghost {
          background: transparent; border: 1.5px solid var(--border);
          color: var(--brown-mid);
        }
        .btn-pricing-ghost:hover { background: var(--bg-soft); }
        .btn-pricing-filled {
          background: #fff; border: none;
          color: var(--brown);
        }
        .btn-pricing-filled:hover { opacity: 0.88; }
        .btn-pricing-outline {
          background: transparent; border: 1.5px solid var(--border);
          color: var(--brown-mid);
        }
        .btn-pricing-outline:hover { background: var(--bg-soft); }
        .pricing-note { font-size: 12px; color: var(--text-light); text-align: center; margin-top: 20px; }

        /* ────────────────────────────
           TÉMOIGNAGES
        ──────────────────────────── */
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .testi-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px 24px;
        }
        .testi-quote { font-size: 15px; color: var(--text); line-height: 1.65; margin-bottom: 20px; font-style: italic; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: #EDE0CF; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: var(--brown-mid); flex-shrink: 0;
        }
        .testi-name { font-size: 13px; font-weight: 700; color: var(--brown); margin-bottom: 1px; }
        .testi-role { font-size: 12px; color: var(--text-muted); }

        /* ────────────────────────────
           FAQ
        ──────────────────────────── */
        .faq-list { max-width: 720px; margin: 0 auto; }
        .faq-item {
          border: 1px solid var(--border); border-radius: 12px;
          margin-bottom: 10px; overflow: hidden;
          background: var(--bg-card);
        }
        .faq-question {
          width: 100%; text-align: left; padding: 18px 22px;
          background: none; border: none; cursor: pointer;
          font-size: 15px; font-weight: 600; color: var(--brown);
          font-family: inherit; display: flex; justify-content: space-between;
          align-items: center; gap: 12px; transition: background 0.12s;
        }
        .faq-question:hover { background: var(--bg-soft); }
        .faq-arrow { flex-shrink: 0; color: var(--brown-light); transition: transform 0.2s; }
        .faq-answer {
          padding: 0 22px 18px;
          font-size: 14px; color: var(--text-muted); line-height: 1.65;
          display: none;
        }
        .faq-item.open .faq-answer { display: block; }
        .faq-item.open .faq-arrow { transform: rotate(180deg); }

        /* ────────────────────────────
           CTA FINAL
        ──────────────────────────── */
        .cta-final {
          background: var(--brown); margin: 0;
          padding: 80px 40px;
        }
        .cta-final-inner { max-width: 640px; margin: 0 auto; text-align: center; }
        .cta-final h2 { font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -0.8px; margin-bottom: 12px; }
        .cta-final p { font-size: 16px; color: rgba(255,255,255,0.75); margin-bottom: 36px; }
        .waitlist-form { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 28px; }
        .wf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .wf-field label { display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; }
        .wf-field input, .wf-field select {
          width: 100%; padding: 10px 14px;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 9px;
          font-size: 14px; font-family: inherit; color: #fff;
          background: rgba(255,255,255,0.08); outline: none; box-sizing: border-box;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }
        .wf-field input::placeholder { color: rgba(255,255,255,0.4); }
        .wf-field input:focus, .wf-field select:focus { border-color: rgba(255,255,255,0.5); }
        .wf-field select option { background: var(--brown); color: #fff; }
        .btn-waitlist {
          width: 100%; padding: 14px; border-radius: 10px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          background: #fff; color: var(--brown); border: none;
          font-family: inherit; transition: opacity 0.15s;
          margin-top: 4px;
        }
        .btn-waitlist:hover { opacity: 0.88; }
        .wf-success {
          background: rgba(74,124,89,0.2); border: 1px solid rgba(74,124,89,0.4);
          border-radius: 12px; padding: 20px; text-align: center;
          color: #fff; font-size: 15px; font-weight: 600;
        }
        .wf-sub { font-size: 12px; color: rgba(255,255,255,0.5); text-align: center; margin-top: 14px; }

        /* Divider */
        .pro-divider { height: 1px; background: var(--border); max-width: 1100px; margin: 0 auto 0; }

        /* Responsive */
        @media (max-width: 1024px) {
          .pro-hero { grid-template-columns: 1fr; padding: 60px 32px 80px; }
          .hero-mockup { max-width: 480px; }
          .pain-grid, .pricing-grid, .testi-grid { grid-template-columns: 1fr 1fr; }
          .feature-row { grid-template-columns: 1fr; gap: 32px; }
          .feature-row.reverse { direction: ltr; }
        }
        @media (max-width: 640px) {
          .pro-section { padding: 60px 20px; }
          .pro-hero { padding: 48px 20px 60px; }
          .section-title { font-size: 28px; }
          .pro-hero h1 { font-size: 34px; }
          .pain-grid, .pricing-grid, .testi-grid { grid-template-columns: 1fr; }
          .hero-ctas { flex-direction: column; }
          .btn-hero-primary, .btn-hero-ghost { justify-content: center; }
          .pricing-card.featured { transform: none; }
          .wf-grid { grid-template-columns: 1fr; }
          .cta-final { padding: 60px 20px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="pro-hero">
        <div>
          <div className="pro-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Drify Pro — Accès early adopter
          </div>
          <h1>Vos propriétaires s&apos;attendent à du <em>pro</em>.<br/>Drify vous en donne les moyens.</h1>
          <p>Centralisez vos annonces, recevez des dossiers qualifiés et envoyez des rapports automatiques. Sans changer votre façon de travailler.</p>
          <div className="hero-ctas">
            <a href="#waitlist" className="btn-hero-primary">
              Démarrer gratuitement — 30 jours
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#fonctionnalites" className="btn-hero-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              Voir les fonctionnalités
            </a>
          </div>
          <div className="hero-social">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <strong>+200 professionnels</strong> rejoignent la liste d&apos;attente
          </div>
        </div>

        {/* Mockup dashboard */}
        <div className="hero-mockup">
          <div className="mockup-bar">
            <div className="mockup-dot" style={{ background: '#FAECEC' }} />
            <div className="mockup-dot" style={{ background: '#FDF4E3' }} />
            <div className="mockup-dot" style={{ background: '#EAF3EE' }} />
          </div>
          <div className="mockup-body">
            <div className="mockup-row">
              <div className="mockup-metric">
                <div className="mockup-metric-val">14</div>
                <div className="mockup-metric-lbl">Annonces actives</div>
              </div>
              <div className="mockup-metric">
                <div className="mockup-metric-val">38</div>
                <div className="mockup-metric-lbl">Candidatures</div>
              </div>
              <div className="mockup-metric">
                <div className="mockup-metric-val">92%</div>
                <div className="mockup-metric-lbl">Taux réponse</div>
              </div>
            </div>
            <div className="mockup-list">
              {[1,2,3,4].map(i => (
                <div key={i} className="mockup-li">
                  <div className="mockup-avatar" />
                  <div className="mockup-line" style={{ width: `${40+i*12}%`, maxWidth: '100%' }} />
                  <div className="mockup-chip" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="pro-divider" />

      {/* ── DOULEURS ── */}
      <section className="pro-section">
        <div className="section-label">Les problèmes réels</div>
        <h2 className="section-title">Vous méritez mieux<br/>que des rustines</h2>
        <p className="section-sub">Chaque professionnel de l&apos;immobilier perd des heures chaque semaine sur des tâches qui devraient être automatiques.</p>
        <div className="pain-grid">
          <div className="pain-card">
            <div className="pain-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <div className="pain-title">Excel n&apos;est pas un CRM</div>
            <div className="pain-desc">Vous jongler entre fichiers, emails et post-its pour suivre vos candidats. Il manque juste l&apos;outil.</div>
          </div>
          <div className="pain-card">
            <div className="pain-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="pain-title">Les bons dossiers arrivent trop tard</div>
            <div className="pain-desc">Un locataire qualifié a déjà signé ailleurs pendant que vous attendiez ses documents.</div>
          </div>
          <div className="pain-card">
            <div className="pain-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="pain-title">Vos propriétaires posent des questions</div>
            <div className="pain-desc">Un rapport d&apos;activité prend 2h à préparer. Il devrait prendre 2 clics.</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="pro-section" id="fonctionnalites" style={{ background: 'var(--bg-soft)', maxWidth: '100%', padding: '80px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
          <div className="section-label">La solution</div>
          <h2 className="section-title">Tout ce dont vous avez besoin,<br/>rien de superflu</h2>
          <p className="section-sub">Drify Pro centralise votre activité immobilière et automatise les tâches répétitives.</p>
          <div className="features-list">
            {FEATURES.map((feat, i) => (
              <div key={feat.title} className={`feature-row${i % 2 === 1 ? ' reverse' : ''}`}>
                <div>
                  <div className="feature-icon-wrap">{feat.icon}</div>
                  <div className="feature-title">{feat.title}</div>
                  <div className="feature-desc">{feat.desc}</div>
                </div>
                <div className="feature-mockup">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ height: '10px', background: 'var(--border)', borderRadius: '99px', width: '60%' }} />
                    <div style={{ height: '10px', background: 'var(--border)', borderRadius: '99px', width: '30%' }} />
                  </div>
                  {[1,2,3].map(j => (
                    <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-soft)', border: '1px solid var(--border)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', marginBottom: '6px', width: `${50+j*15}%` }} />
                        <div style={{ height: '6px', background: 'var(--border-soft)', borderRadius: '99px', width: '40%' }} />
                      </div>
                      <div style={{ width: '40px', height: '18px', background: '#EAF3EE', borderRadius: '99px', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pro-section" id="tarifs">
        <div className="section-label">Tarification</div>
        <h2 className="section-title">Simple, transparent,<br/>sans surprise</h2>
        <p className="section-sub">Commencez gratuitement. Évoluez quand vous en avez besoin.</p>
        <div className="pricing-grid">
          {/* Gratuit */}
          <div className="pricing-card">
            <div className="pricing-plan" style={{ color: 'var(--text-muted)' }}>Gratuit</div>
            <div className="pricing-price" style={{ color: 'var(--brown)' }}>0€</div>
            <div className="pricing-period" style={{ color: 'var(--text-muted)' }}>pour toujours</div>
            <ul className="pricing-features">
              {['1 utilisateur', '3 annonces maximum', 'Dossiers locataires basiques', 'Support email'].map(f => (
                <li key={f}>
                  <svg className="pricing-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription?role=professionnel" className="btn-pricing btn-pricing-ghost">Commencer</Link>
          </div>

          {/* Pro — featured */}
          <div className="pricing-card featured">
            <div className="pricing-popular">Le plus populaire</div>
            <div className="pricing-plan">Pro</div>
            <div className="pricing-price">19€</div>
            <div className="pricing-period">/mois · essai 30 jours offerts</div>
            <ul className="pricing-features">
              {['Annonces illimitées', 'Dossiers scorés complets', 'Reporting automatique', 'Support prioritaire', 'Statistiques avancées'].map(f => (
                <li key={f}>
                  <svg className="pricing-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <a href="#waitlist" className="btn-pricing btn-pricing-filled">Essai gratuit 30 jours</a>
          </div>

          {/* Agence */}
          <div className="pricing-card">
            <div className="pricing-plan" style={{ color: 'var(--text-muted)' }}>Agence</div>
            <div className="pricing-price" style={{ color: 'var(--brown)' }}>49€</div>
            <div className="pricing-period" style={{ color: 'var(--text-muted)' }}>/mois · jusqu&apos;à 10 agents</div>
            <ul className="pricing-features">
              {['Tout le plan Pro', 'Accès multi-utilisateurs', 'Tableau de bord équipe', 'API et intégrations', 'SLA et support dédié'].map(f => (
                <li key={f}>
                  <svg className="pricing-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <a href="mailto:pro@drify.fr" className="btn-pricing btn-pricing-outline">Nous contacter</a>
          </div>
        </div>
        <p className="pricing-note">* Prix de lancement — offre early adopter. Les prix peuvent évoluer à l&apos;issue de la période bêta.</p>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="pro-section" style={{ background: 'var(--bg-soft)', maxWidth: '100%', padding: '80px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
          <div className="section-label">Ils nous font confiance</div>
          <h2 className="section-title">Ce que disent nos premiers utilisateurs</h2>
          <div className="testi-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testi-card">
                <div className="testi-quote">&ldquo;{t.quote}&rdquo;</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.initiales}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role} · {t.ville}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pro-section">
        <div className="section-label">Questions fréquentes</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Vous avez des questions ?</h2>
        <p className="section-sub" style={{ margin: '0 auto 40px', textAlign: 'center' }}>Tout ce que vous devez savoir avant de vous lancer.</p>
        <div className="faq-list">
          {FAQ.map((item, i) => (
            <details key={i} className="faq-item">
              <summary style={{ listStyle: 'none' }}>
                <button
                  className="faq-question"
                  onClick={(e) => {
                    const details = (e.currentTarget as HTMLElement).closest('details')
                    if (details) details.toggleAttribute('open')
                  }}
                >
                  {item.q}
                  <span className="faq-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
              </summary>
              <div className="faq-answer">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL / WAITLIST ── */}
      <section className="cta-final" id="waitlist">
        <div className="cta-final-inner">
          <h2>Rejoignez les premiers professionnels sur Drify</h2>
          <p>Accès early adopter — places limitées. Soyez parmi les premiers à bénéficier des conditions de lancement.</p>

          {joined ? (
            <div className="wf-success">
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
              Vous êtes sur la liste ! Nous vous contacterons en priorité pour l&apos;accès early adopter.
            </div>
          ) : (
            <form action={joinWaitlistPro} className="waitlist-form">
              {error && (
                <div style={{ background: 'rgba(155,58,42,0.2)', border: '1px solid rgba(155,58,42,0.4)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fff', marginBottom: '16px' }}>
                  Une erreur est survenue. Réessayez.
                </div>
              )}
              <div className="wf-grid">
                <div className="wf-field">
                  <label htmlFor="prenom">Prénom *</label>
                  <input type="text" id="prenom" name="prenom" placeholder="Sophie" required />
                </div>
                <div className="wf-field">
                  <label htmlFor="email">Email professionnel *</label>
                  <input type="email" id="email" name="email" placeholder="sophie@agence.fr" required />
                </div>
                <div className="wf-field">
                  <label htmlFor="type_structure">Type de structure *</label>
                  <select id="type_structure" name="type_structure" required>
                    <option value="">Choisir…</option>
                    <option value="mandataire">Mandataire indépendant</option>
                    <option value="agence">Agence immobilière</option>
                    <option value="admin_biens">Administrateur de biens</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="wf-field">
                  <label htmlFor="ville">Ville</label>
                  <input type="text" id="ville" name="ville" placeholder="Paris, Lyon, Toulouse…" />
                </div>
              </div>
              <button type="submit" className="btn-waitlist">
                Rejoindre la liste d&apos;attente →
              </button>
              <p className="wf-sub">En soumettant ce formulaire, vous acceptez d&apos;être recontacté par Drify. Pas de spam.</p>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
