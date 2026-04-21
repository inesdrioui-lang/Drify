'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3

const CARACTERISTIQUES = ['Parquet', 'Carrelage', 'Double vitrage', 'Digicode', 'Interphone', 'Gardien', 'Ascenseur', 'Cave', 'Balcon', 'Terrasse', 'Jardin', 'Vue dégagée', 'Lumineux', 'Calme', 'Dernier étage', 'Plain-pied']
const EQUIPEMENTS = ['Cuisine équipée', 'Four', 'Micro-ondes', 'Lave-vaisselle', 'Lave-linge', 'Sèche-linge', 'Réfrigérateur', 'Télévision', 'Fibre optique', 'Climatisation', 'Chauffe-eau', 'Interrupteurs domotiques']
const CHAUFFAGE_GESTION = ['Individuel', 'Collectif']
const CHAUFFAGE_ENERGIE = ['Gaz', 'Électrique', 'Fioul', 'Pompe à chaleur', 'Poêle à bois', 'Géothermie']
const CHAUFFAGE_EMISSION = ['Radiateurs', 'Plancher chauffant', 'Climatisation réversible', 'Convecteurs', 'Poêle']
const REVENUS_MIN = ['× 2', '× 2.5', '× 3', '× 3.5', '× 4']
const DPE_COLORS: Record<string, string> = { A:'#009B4D', B:'#5CB800', C:'#ADCF00', D:'#F7E400', E:'#F0A500', F:'#E05B00', G:'#C42B00' }

export default function PublierPage() {
  const [step, setStep] = useState<Step>(1)

  // ── Étape 1 ──────────────────────────────────────────
  const [type, setType] = useState('')
  const [meuble, setMeuble] = useState(false)
  const [typeLocation, setTypeLocation] = useState('')
  const [titre, setTitre] = useState('')
  const [loyer, setLoyer] = useState('')
  const [charges, setCharges] = useState('')
  const [depot, setDepot] = useState('')
  const [surface, setSurface] = useState('')
  const [pieces, setPieces] = useState('')
  const [chambres, setChambres] = useState('')
  const [etage, setEtage] = useState('')
  const [dpe, setDpe] = useState('')
  const [disponibilite, setDisponibilite] = useState('')
  const [rue, setRue] = useState('')
  const [ville, setVille] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [chauffage, setChauffage] = useState({ gestion: '', energie: '', emission: '' })
  const [caracteristiques, setCaracteristiques] = useState<string[]>([])
  const [equipements, setEquipements] = useState<string[]>([])
  const [parking, setParking] = useState(false)

  // ── Étape 2 ──────────────────────────────────────────
  const [description, setDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [garant, setGarant] = useState(false)
  const [revenusMin, setRevenusMin] = useState('')
  const [animaux, setAnimaux] = useState(false)
  const [dureeMin, setDureeMin] = useState('')
  const [preavis, setPreavis] = useState('')

  // ── Validation + Gate ─────────────────────────────────
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setShowGate(true)
    })
  }, [])

  function goToStep(n: Step) {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validateStep1(): boolean {
    const required: Record<string, string> = { type, titre, loyer, surface, ville }
    const errs = new Set(Object.entries(required).filter(([, v]) => !v).map(([k]) => k))
    setErrors(errs)
    return errs.size === 0
  }

  function toggleCaracteristique(f: string) {
    setCaracteristiques(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  function toggleEquipement(f: string) {
    setEquipements(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  function toggleChauffage(level: 'gestion' | 'energie' | 'emission', val: string) {
    setChauffage(c => ({ ...c, [level]: c[level] === val ? '' : val }))
  }

  function generateAI() {
    setAiLoading(true)
    setTimeout(() => {
      const generated = `Beau ${type || 'logement'} lumineux situé dans un quartier prisé de ${ville || 'Toulouse'}, à deux pas des commodités. Ce bien de ${surface || '—'} m² bénéficie d'une belle exposition et d'espaces de vie agréables. Idéal pour une installation durable, il offre tout le confort nécessaire pour une vie quotidienne agréable.`
      setAiResult(generated)
      setAiLoading(false)
    }, 1800)
  }

  const err = (field: string) => errors.has(field)
  const stepLabels = ['Le bien', 'Photos & conditions', 'Vérification']

  return (
    <>
      <style>{`
        :root{--bg:#FDFCFA;--bg-soft:#F7F3EE;--bg-card:#FFFFFF;--brown:#3D2E22;--brown-mid:#5C4433;--brown-main:#6B3F26;--brown-light:#96766A;--border:#EAE3DA;--border-soft:#F0EBE4;--beige:#EDE0CF;--beige-light:#F7F2EA;--beige-dark:#D4B896;--text:#1A0F08;--text-muted:#8A7068;--text-light:#B5A49C;--green:#2D7A4F;--green-bg:#E8F5E9;--red:#C53030;--red-bg:#FEF2F2}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased}
        .page-container{max-width:780px;margin:0 auto;padding:48px 40px 100px}
        .page-title{font-size:32px;font-weight:800;letter-spacing:-1px;color:var(--brown);margin-bottom:8px}
        .page-subtitle{font-size:15px;color:var(--text-muted);margin-bottom:40px}
        .stepper{display:flex;align-items:center;margin-bottom:48px}
        .step{display:flex;align-items:center;gap:10px}
        .step-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid var(--border);color:var(--text-light);background:var(--bg-card);transition:all .25s;flex-shrink:0}
        .step.active .step-num{background:var(--brown);border-color:var(--brown);color:#fff}
        .step.done .step-num{background:var(--green);border-color:var(--green);color:#fff;cursor:pointer}
        .step.done{cursor:pointer}
        .step-label{font-size:13px;font-weight:600;color:var(--text-light);transition:color .25s;white-space:nowrap}
        .step.active .step-label{color:var(--brown)}
        .step.done .step-label{color:var(--green)}
        .step-line{flex:1;height:2px;background:var(--border);margin:0 12px;transition:background .25s;min-width:20px}
        .step-line.done{background:var(--green)}
        .form-section{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:32px;margin-bottom:24px}
        .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .form-section-title{font-size:17px;font-weight:700;color:var(--brown);letter-spacing:-0.3px}
        .section-edit{font-size:13px;color:var(--brown-mid);cursor:pointer;font-weight:500;text-decoration:none;border:none;background:none;font-family:inherit;display:flex;align-items:center;gap:4px}
        .section-edit:hover{color:var(--brown)}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .form-row:last-child{margin-bottom:0}
        .form-row.single{grid-template-columns:1fr}
        .form-row.triple{grid-template-columns:1fr 1fr 1fr}
        .form-row.quad{grid-template-columns:1fr 1fr 1fr 1fr}
        .field{display:flex;flex-direction:column;gap:6px}
        .field label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted)}
        .field label .req{color:var(--red);margin-left:2px}
        .field input,.field select,.field textarea{padding:10px 14px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text);background:var(--bg);outline:none;transition:border-color .2s}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--brown-light)}
        .field input.error,.field select.error{border-color:var(--red);background:var(--red-bg)}
        .field textarea{resize:vertical;min-height:140px}
        .field select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A7068' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
        .field .hint{font-size:11px;color:var(--text-light)}
        .field .err-msg{font-size:11px;color:var(--red);font-weight:500}
        .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border-soft)}
        .toggle-row:last-child{border-bottom:none;padding-bottom:0}
        .toggle-row:first-child{padding-top:0}
        .toggle-label{font-size:14px;font-weight:500;color:var(--text)}
        .toggle-label span{display:block;font-size:12px;color:var(--text-muted);font-weight:400;margin-top:2px}
        .toggle{width:44px;height:24px;background:var(--border);border-radius:12px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;border:none}
        .toggle::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .toggle.on{background:var(--brown)}
        .toggle.on::after{transform:translateX(20px)}
        .photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px}
        .photo-slot{aspect-ratio:4/3;border:2px dashed var(--border);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:border-color .2s,background .2s;background:var(--bg)}
        .photo-slot:hover{border-color:var(--brown-light);background:var(--bg-soft)}
        .photo-slot.main{border-color:var(--beige-dark);background:var(--beige-light)}
        .photo-slot svg{color:var(--text-light)}
        .photo-slot span{font-size:11px;color:var(--text-light);font-weight:500}
        .photo-hint{font-size:12px;color:var(--text-muted);line-height:1.5}
        .ai-box{background:var(--beige-light);border:1px solid var(--beige-dark);border-radius:14px;padding:24px;margin-top:16px}
        .ai-header{display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .ai-badge{display:inline-flex;align-items:center;gap:5px;background:var(--brown);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;text-transform:uppercase;letter-spacing:.5px}
        .ai-header p{font-size:13px;color:var(--text-muted)}
        .ai-btn{padding:10px 20px;background:var(--brown);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;transition:opacity .15s}
        .ai-btn:hover{opacity:.85}
        .ai-btn:disabled{opacity:.5;cursor:not-allowed}
        .ai-result{margin-top:16px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;font-size:14px;line-height:1.7;color:var(--text)}
        .ai-actions{display:flex;gap:8px;margin-top:12px}
        .btn-ghost{padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;color:var(--brown-mid);border:1px solid var(--border);background:transparent;transition:background .15s;font-family:inherit;white-space:nowrap}
        .btn-ghost:hover{background:var(--bg-soft)}
        .form-nav{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:24px;border-top:1px solid var(--border-soft)}
        .btn-back{padding:10px 20px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-weight:600;color:var(--brown-mid);background:transparent;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:background .15s}
        .btn-back:hover{background:var(--bg-soft)}
        .btn-next{padding:12px 28px;background:var(--brown);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:opacity .15s}
        .btn-next:hover{opacity:.85}
        .btn-publish{padding:14px 32px;background:var(--brown);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;transition:opacity .15s;margin:0 auto}
        .btn-publish:hover{opacity:.85}
        .gate-overlay{position:fixed;inset:0;z-index:1000;background:rgba(20,10,5,.55);display:flex;align-items:center;justify-content:center}
        .gate-modal{background:#FDFCFA;border-radius:20px;padding:44px 40px 40px;width:min(460px,calc(100vw - 40px));text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.18)}
        .gate-modal h2{font-size:24px;font-weight:800;letter-spacing:-.8px;color:#3D2E22;margin-bottom:12px}
        .gate-modal p{font-size:15px;color:#8A7068;line-height:1.65;margin-bottom:32px;max-width:340px;margin-left:auto;margin-right:auto}
        .gate-btn{display:block;width:100%;background:#3D2E22;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:14px;transition:opacity .15s;font-family:inherit}
        .gate-btn:hover{opacity:.85}
        .gate-link{font-size:14px;color:#8A7068;text-decoration:none}
        .gate-link span{font-weight:600;color:#5C4433}
        .blurred{filter:blur(6px);pointer-events:none;user-select:none}
        /* Chips */
        .chips-group{margin-bottom:20px}
        .chips-group:last-child{margin-bottom:0}
        .chips-group-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:10px}
        .chips-wrap{display:flex;flex-wrap:wrap;gap:8px}
        .chip{padding:8px 16px;border:1px solid var(--beige-dark);border-radius:8px;font-size:13px;font-weight:500;color:var(--brown-mid);cursor:pointer;background:var(--beige-light);transition:all .15s;user-select:none;font-family:inherit;line-height:1}
        .chip:hover{border-color:var(--brown-main);color:var(--brown-main)}
        .chip.selected{background:var(--brown-main);border-color:var(--brown-main);color:#fff}
        .chip:active{transform:scale(0.97)}
        /* Récap */
        .recap-section{margin-bottom:28px}
        .recap-section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--border)}
        .recap-section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted)}
        .recap-row{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--border-soft);font-size:14px;gap:16px}
        .recap-row:last-child{border-bottom:none}
        .recap-label{color:var(--text-muted);flex-shrink:0}
        .recap-value{font-weight:600;color:var(--text);text-align:right}
        .recap-value.empty{color:var(--text-light);font-weight:400;font-style:italic}
        .recap-chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}
        .recap-chip{padding:3px 8px;border-radius:5px;font-size:11px;font-weight:500;background:var(--beige-light);color:var(--brown-mid);border:1px solid var(--beige-dark)}
        .dpe-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;font-size:13px;font-weight:800;color:#fff}
        .publish-box{text-align:center;padding:40px 20px 20px}
        .publish-box h2{font-size:22px;font-weight:700;color:var(--brown);margin-bottom:8px}
        .publish-box p{font-size:14px;color:var(--text-muted);margin-bottom:28px;max-width:400px;margin-left:auto;margin-right:auto}
        .validation-error{background:var(--red-bg);border:1px solid #FCA5A5;border-radius:10px;padding:12px 16px;font-size:13px;color:var(--red);margin-bottom:20px;font-weight:500}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media(max-width:768px){.page-container{padding:32px 16px 80px}.page-title{font-size:26px}.form-section{padding:20px}.form-row{grid-template-columns:1fr}.form-row.triple{grid-template-columns:1fr 1fr}.form-row.quad{grid-template-columns:1fr 1fr}.stepper{gap:0}.step-label{display:none}.step-line{margin:0 8px}}
      `}</style>

      {showGate && (
        <div className="gate-overlay">
          <div className="gate-modal">
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:28}}>
              <Image src="/logo.svg" height={32} width={80} style={{width:'auto'}} alt="Drify" />
            </div>
            <h2>Publiez votre annonce</h2>
            <p>Créez un compte gratuitement pour accéder à toutes les fonctionnalités de publication.</p>
            <Link href="/inscription" className="gate-btn">S&apos;inscrire gratuitement</Link>
            <Link href="/connexion" className="gate-link">Déjà un compte ? <span>Se connecter</span></Link>
          </div>
        </div>
      )}

      <div className={showGate ? 'blurred' : ''}>
        <div className="page-container">
          <h1 className="page-title">Publier une annonce</h1>
          <p className="page-subtitle">Remplissez les informations de votre bien en 3 étapes simples.</p>

          {/* STEPPER */}
          <div className="stepper">
            {stepLabels.map((label, i) => {
              const n = (i + 1) as Step
              const cls = step > n ? 'done' : step === n ? 'active' : ''
              return (
                <Fragment key={n}>
                  <div className={`step ${cls}`} onClick={() => step > n && goToStep(n)}>
                    <div className="step-num">
                      {step > n
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        : n}
                    </div>
                    <div className="step-label">{label}</div>
                  </div>
                  {i < 2 && <div className={`step-line${step > n ? ' done' : ''}`} />}
                </Fragment>
              )
            })}
          </div>

          {/* ══════════════════════════════════════════
              ÉTAPE 1 — Le bien
          ══════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {errors.size > 0 && (
                <div className="validation-error">
                  Veuillez remplir les champs obligatoires avant de continuer.
                </div>
              )}

              {/* 1. Informations principales */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:24}}>Informations principales</div>

                {/* Type de bien + Meublé */}
                <div className="form-row">
                  <div className="field">
                    <label>Type de bien <span className="req">*</span></label>
                    <select value={type} onChange={e => { setType(e.target.value); setErrors(s => { const n = new Set(s); n.delete('type'); return n }) }}
                      className={err('type') ? 'error' : ''}>
                      <option value="">Sélectionner</option>
                      <option>Appartement</option>
                      <option>Maison</option>
                      <option>Studio</option>
                      <option>Chambre</option>
                      <option>Parking</option>
                      <option>Local commercial</option>
                    </select>
                    {err('type') && <span className="err-msg">Champ requis</span>}
                  </div>
                  <div className="field">
                    <label>Meublé</label>
                    <div className="chips-wrap" style={{marginTop:4}}>
                      <button type="button" className={`chip${!meuble ? ' selected' : ''}`} onClick={() => setMeuble(false)}>Non meublé</button>
                      <button type="button" className={`chip${meuble ? ' selected' : ''}`} onClick={() => setMeuble(true)}>Meublé</button>
                    </div>
                  </div>
                </div>

                {/* Type de location */}
                <div style={{marginBottom:16}}>
                  <div className="chips-group-label" style={{marginBottom:8}}>Type de location</div>
                  <div className="chips-wrap">
                    {['Résidence principale', 'Bail mobilité', 'Colocation'].map(v => (
                      <button key={v} type="button"
                        className={`chip${typeLocation === v ? ' selected' : ''}`}
                        onClick={() => setTypeLocation(prev => prev === v ? '' : v)}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre */}
                <div className="form-row single">
                  <div className="field">
                    <label>Titre de l&apos;annonce <span className="req">*</span></label>
                    <input type="text" placeholder="Ex : T3 lumineux — Capitole, Toulouse"
                      value={titre} className={err('titre') ? 'error' : ''}
                      onChange={e => { setTitre(e.target.value); setErrors(s => { const n = new Set(s); n.delete('titre'); return n }) }} />
                    {err('titre') && <span className="err-msg">Champ requis</span>}
                  </div>
                </div>

                {/* Loyer + Charges + Dépôt */}
                <div className="form-row triple">
                  <div className="field">
                    <label>Loyer HC (€/mois) <span className="req">*</span></label>
                    <input type="number" placeholder="850" value={loyer} className={err('loyer') ? 'error' : ''}
                      onChange={e => { setLoyer(e.target.value); setErrors(s => { const n = new Set(s); n.delete('loyer'); return n }) }} />
                    {err('loyer') && <span className="err-msg">Champ requis</span>}
                  </div>
                  <div className="field">
                    <label>Charges (€/mois)</label>
                    <input type="number" placeholder="60" value={charges} onChange={e => setCharges(e.target.value)} />
                    <span className="hint">Provisions sur charges</span>
                  </div>
                  <div className="field">
                    <label>Dépôt de garantie (€)</label>
                    <input type="number" placeholder="1700" value={depot} onChange={e => setDepot(e.target.value)} />
                    <span className="hint">Généralement 1 mois HC</span>
                  </div>
                </div>

                {/* Surface + Pièces + Chambres + Étage */}
                <div className="form-row quad">
                  <div className="field">
                    <label>Surface (m²) <span className="req">*</span></label>
                    <input type="number" placeholder="65" value={surface} className={err('surface') ? 'error' : ''}
                      onChange={e => { setSurface(e.target.value); setErrors(s => { const n = new Set(s); n.delete('surface'); return n }) }} />
                    {err('surface') && <span className="err-msg">Requis</span>}
                  </div>
                  <div className="field">
                    <label>Pièces</label>
                    <input type="number" placeholder="3" value={pieces} onChange={e => setPieces(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Chambres</label>
                    <input type="number" placeholder="2" value={chambres} onChange={e => setChambres(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Étage</label>
                    <input type="number" placeholder="2" min="0" value={etage} onChange={e => setEtage(e.target.value)} />
                  </div>
                </div>

                {/* DPE + Disponibilité */}
                <div className="form-row">
                  <div className="field">
                    <label>DPE</label>
                    <select value={dpe} onChange={e => setDpe(e.target.value)}>
                      <option value="">Sélectionner</option>
                      {['A','B','C','D','E','F','G'].map(l => <option key={l}>{l}</option>)}
                    </select>
                    <span className="hint">Diagnostic de performance énergétique</span>
                  </div>
                  <div className="field">
                    <label>Disponible à partir du</label>
                    <input type="date" value={disponibilite} onChange={e => setDisponibilite(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 2. Adresse */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:24}}>Adresse</div>
                <div className="form-row single">
                  <div className="field">
                    <label>Rue</label>
                    <input type="text" placeholder="Ex : rue du Taur" value={rue} onChange={e => setRue(e.target.value)} />
                    <span className="hint">Sans numéro — votre adresse exacte reste confidentielle</span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Ville <span className="req">*</span></label>
                    <input type="text" placeholder="Ex : Toulouse" value={ville} className={err('ville') ? 'error' : ''}
                      onChange={e => { setVille(e.target.value); setErrors(s => { const n = new Set(s); n.delete('ville'); return n }) }} />
                    {err('ville') && <span className="err-msg">Champ requis</span>}
                  </div>
                  <div className="field">
                    <label>Code postal</label>
                    <input type="text" placeholder="Ex : 31000" maxLength={5} value={codePostal}
                      onChange={e => { if (/^\d{0,5}$/.test(e.target.value)) setCodePostal(e.target.value) }} />
                  </div>
                </div>
              </div>

              {/* 3. Chauffage */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:24}}>Chauffage</div>
                <div className="chips-group">
                  <div className="chips-group-label">Gestion</div>
                  <div className="chips-wrap">
                    {CHAUFFAGE_GESTION.map(v => (
                      <button key={v} type="button" className={`chip${chauffage.gestion === v ? ' selected' : ''}`}
                        onClick={() => toggleChauffage('gestion', v)}>{v}</button>
                    ))}
                  </div>
                </div>
                <div className="chips-group">
                  <div className="chips-group-label">Énergie</div>
                  <div className="chips-wrap">
                    {CHAUFFAGE_ENERGIE.map(v => (
                      <button key={v} type="button" className={`chip${chauffage.energie === v ? ' selected' : ''}`}
                        onClick={() => toggleChauffage('energie', v)}>{v}</button>
                    ))}
                  </div>
                </div>
                <div className="chips-group">
                  <div className="chips-group-label">Émission de chaleur</div>
                  <div className="chips-wrap">
                    {CHAUFFAGE_EMISSION.map(v => (
                      <button key={v} type="button" className={`chip${chauffage.emission === v ? ' selected' : ''}`}
                        onClick={() => toggleChauffage('emission', v)}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Caractéristiques */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:16}}>Caractéristiques du logement</div>
                <div className="chips-wrap">
                  {CARACTERISTIQUES.map(f => (
                    <button key={f} type="button" className={`chip${caracteristiques.includes(f) ? ' selected' : ''}`}
                      onClick={() => toggleCaracteristique(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {/* 5. Équipements */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:16}}>Équipements inclus</div>
                <div className="chips-wrap">
                  {EQUIPEMENTS.map(f => (
                    <button key={f} type="button" className={`chip${equipements.includes(f) ? ' selected' : ''}`}
                      onClick={() => toggleEquipement(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {/* 6. Options */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:0}}>Options</div>
                <div className="toggle-row">
                  <div className="toggle-label">Parking inclus<span>Place de parking incluse dans le loyer</span></div>
                  <button type="button" className={`toggle${parking ? ' on' : ''}`} onClick={() => setParking(!parking)} />
                </div>
              </div>

              <div className="form-nav">
                <div />
                <button className="btn-next" onClick={() => { if (validateStep1()) goToStep(2) }}>
                  Suivant : Photos & conditions
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════
              ÉTAPE 2 — Photos & conditions
          ══════════════════════════════════════════ */}
          {step === 2 && (
            <>
              {/* Photos */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:20}}>Photos du bien</div>
                <div className="photo-grid">
                  {Array.from({length:8}).map((_, i) => (
                    <div key={i} className={`photo-slot${i === 0 ? ' main' : ''}`}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                      <span>{i === 0 ? '★ Principale' : `Photo ${i+1}`}</span>
                    </div>
                  ))}
                </div>
                <p className="photo-hint">
                  Recommandé : 5 photos minimum — salon, chambre(s), cuisine, salle de bain, façade.<br/>
                  Formats acceptés : JPG, PNG. Taille max : 10 Mo par photo.
                </p>
              </div>

              {/* Description */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:20}}>Description</div>
                <div className="form-row single">
                  <div className="field">
                    <label>Description du bien</label>
                    <textarea placeholder="Décrivez votre bien : atouts, luminosité, environnement, transports proches, commerces..."
                      value={description} onChange={e => setDescription(e.target.value)} />
                    <span className="hint">Entre 100 et 1 500 caractères recommandé · {description.length} caractère{description.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="ai-box">
                  <div className="ai-header">
                    <span className="ai-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
                      IA Drify
                    </span>
                    <p>Générez une description professionnelle en un clic</p>
                  </div>
                  <button className="ai-btn" onClick={generateAI} disabled={aiLoading}>
                    {aiLoading
                      ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Génération en cours...</>
                      : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>Générer avec l&apos;IA</>}
                  </button>
                  {aiResult && (
                    <>
                      <div className="ai-result">{aiResult}</div>
                      <div className="ai-actions">
                        <button className="btn-ghost" style={{fontSize:12}} onClick={() => setDescription(aiResult)}>Utiliser cette description</button>
                        <button className="btn-ghost" style={{fontSize:12}} onClick={generateAI}>Régénérer</button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Conditions de location */}
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:20}}>Conditions de location</div>

                <div style={{marginBottom:20}}>
                  <div className="chips-group-label">Revenus minimum du locataire</div>
                  <div className="chips-wrap" style={{marginTop:8}}>
                    {REVENUS_MIN.map(v => (
                      <button key={v} type="button" className={`chip${revenusMin === v ? ' selected' : ''}`}
                        onClick={() => setRevenusMin(prev => prev === v ? '' : v)}>{v} le loyer</button>
                    ))}
                  </div>
                  <p style={{fontSize:11,color:'var(--text-light)',marginTop:6}}>La règle habituelle en France est × 3 le loyer charges comprises</p>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Durée minimale du bail</label>
                    <select value={dureeMin} onChange={e => setDureeMin(e.target.value)}>
                      <option value="">Non précisée</option>
                      <option value="1 mois">1 mois (bail mobilité)</option>
                      <option value="3 mois">3 mois</option>
                      <option value="6 mois">6 mois</option>
                      <option value="1 an">1 an (meublé)</option>
                      <option value="3 ans">3 ans (loi 89 — nu)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Préavis locataire</label>
                    <select value={preavis} onChange={e => setPreavis(e.target.value)}>
                      <option value="">Non précisé</option>
                      <option value="1 mois">1 mois</option>
                      <option value="3 mois">3 mois</option>
                    </select>
                  </div>
                </div>

                <div className="toggle-row" style={{marginTop:8}}>
                  <div className="toggle-label">Garant accepté<span>Vous acceptez un garant personne physique ou Visale</span></div>
                  <button type="button" className={`toggle${garant ? ' on' : ''}`} onClick={() => setGarant(!garant)} />
                </div>
                <div className="toggle-row">
                  <div className="toggle-label">Animaux acceptés<span>Les animaux de compagnie sont les bienvenus</span></div>
                  <button type="button" className={`toggle${animaux ? ' on' : ''}`} onClick={() => setAnimaux(!animaux)} />
                </div>
              </div>

              <div className="form-nav">
                <button className="btn-back" onClick={() => goToStep(1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Retour
                </button>
                <button className="btn-next" onClick={() => goToStep(3)}>
                  Vérifier l&apos;annonce
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════
              ÉTAPE 3 — Vérification
          ══════════════════════════════════════════ */}
          {step === 3 && (
            <>
              <div className="form-section">
                <div className="form-section-title" style={{marginBottom:28}}>Récapitulatif de votre annonce</div>

                {/* Le bien */}
                <div className="recap-section">
                  <div className="recap-section-header">
                    <div className="recap-section-title">Le bien</div>
                    <button type="button" className="section-edit" onClick={() => goToStep(1)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Modifier
                    </button>
                  </div>
                  {[
                    { label: 'Type', value: [type, meuble ? 'Meublé' : 'Non meublé', typeLocation].filter(Boolean).join(' · ') },
                    { label: 'Titre', value: titre },
                    { label: 'Loyer HC', value: loyer ? `${loyer} €/mois` : '' },
                    { label: 'Charges', value: charges ? `${charges} €/mois` : '' },
                    { label: 'Dépôt de garantie', value: depot ? `${depot} €` : '' },
                    { label: 'Surface', value: surface ? `${surface} m²` : '' },
                    { label: 'Pièces / Chambres / Étage', value: [pieces && `${pieces} pièces`, chambres && `${chambres} ch.`, etage !== '' && `Étage ${etage}`].filter(Boolean).join(' · ') },
                    { label: 'Adresse', value: [rue, ville, codePostal].filter(Boolean).join(', ') },
                    { label: 'Disponibilité', value: disponibilite ? new Date(disponibilite).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'}) : '' },
                  ].map(({ label, value }) => (
                    <div key={label} className="recap-row">
                      <span className="recap-label">{label}</span>
                      <span className={`recap-value${!value ? ' empty' : ''}`}>{value || 'Non renseigné'}</span>
                    </div>
                  ))}
                  {dpe && (
                    <div className="recap-row">
                      <span className="recap-label">DPE</span>
                      <span className="recap-value" style={{display:'flex',alignItems:'center',gap:6}}>
                        <span className="dpe-badge" style={{background:DPE_COLORS[dpe]||'#ccc'}}>{dpe}</span>
                        Classe {dpe}
                      </span>
                    </div>
                  )}
                  {parking && (
                    <div className="recap-row">
                      <span className="recap-label">Parking</span>
                      <span className="recap-value">Inclus</span>
                    </div>
                  )}
                </div>

                {/* Chauffage */}
                {(chauffage.gestion || chauffage.energie || chauffage.emission) && (
                  <div className="recap-section">
                    <div className="recap-section-header">
                      <div className="recap-section-title">Chauffage</div>
                      <button type="button" className="section-edit" onClick={() => goToStep(1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                    </div>
                    {[
                      { label: 'Gestion', value: chauffage.gestion },
                      { label: 'Énergie', value: chauffage.energie },
                      { label: 'Émission', value: chauffage.emission },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label} className="recap-row">
                        <span className="recap-label">{label}</span>
                        <span className="recap-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caractéristiques & équipements */}
                {(caracteristiques.length > 0 || equipements.length > 0) && (
                  <div className="recap-section">
                    <div className="recap-section-header">
                      <div className="recap-section-title">Caractéristiques & équipements</div>
                      <button type="button" className="section-edit" onClick={() => goToStep(1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                    </div>
                    {caracteristiques.length > 0 && (
                      <div className="recap-row" style={{alignItems:'flex-start'}}>
                        <span className="recap-label">Caractéristiques</span>
                        <div className="recap-chips">{caracteristiques.map(c => <span key={c} className="recap-chip">{c}</span>)}</div>
                      </div>
                    )}
                    {equipements.length > 0 && (
                      <div className="recap-row" style={{alignItems:'flex-start'}}>
                        <span className="recap-label">Équipements</span>
                        <div className="recap-chips">{equipements.map(e => <span key={e} className="recap-chip">{e}</span>)}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditions */}
                <div className="recap-section">
                  <div className="recap-section-header">
                    <div className="recap-section-title">Conditions de location</div>
                    <button type="button" className="section-edit" onClick={() => goToStep(2)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Modifier
                    </button>
                  </div>
                  {[
                    { label: 'Revenus min.', value: revenusMin ? `${revenusMin} le loyer CC` : '' },
                    { label: 'Durée minimale', value: dureeMin },
                    { label: 'Préavis locataire', value: preavis },
                    { label: 'Garant', value: garant ? 'Accepté' : 'Non requis' },
                    { label: 'Animaux', value: animaux ? 'Acceptés' : 'Non acceptés' },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="recap-row">
                      <span className="recap-label">{label}</span>
                      <span className="recap-value">{value}</span>
                    </div>
                  ) : null)}
                </div>

                {/* Description */}
                {description && (
                  <div className="recap-section">
                    <div className="recap-section-header">
                      <div className="recap-section-title">Description</div>
                      <button type="button" className="section-edit" onClick={() => goToStep(2)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                    </div>
                    <p style={{fontSize:14,color:'var(--text)',lineHeight:1.7,padding:'8px 0'}}>{description}</p>
                  </div>
                )}
              </div>

              {/* Publier */}
              <div className="form-section">
                <div className="publish-box">
                  <h2>Tout semble bon ?</h2>
                  <p>Votre annonce sera visible sur Drify dès sa validation. Vous pourrez la modifier à tout moment depuis votre dashboard.</p>
                  <button className="btn-publish" onClick={() => {}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    Publier l&apos;annonce
                  </button>
                </div>
              </div>

              <div className="form-nav">
                <button className="btn-back" onClick={() => goToStep(2)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Retour
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
