'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3

const FEATURES = ['Parking', 'Cave', 'Balcon', 'Terrasse', 'Jardin', 'Piscine', 'Interphone', 'Digicode', 'Gardien', 'Ascenseur', 'Double vitrage', 'Parquet', 'Cuisine équipée', 'Lave-vaisselle', 'Lave-linge', 'Fibre optique', 'Climatisation']

export default function PublierPage() {
  const [step, setStep] = useState<Step>(1)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [furnished, setFurnished] = useState(false)
  const [parking, setParking] = useState(false)
  const [pets, setPets] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [showGate, setShowGate] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<{label:string;city:string}[]>([])
  const [addressValue, setAddressValue] = useState('')
  const addressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setShowGate(true)
    })
  }, [])

  function toggleFeature(f: string) {
    setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  function fetchAddress(q: string) {
    if (q.length < 3) { setAddressSuggestions([]); return }
    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current)
    addressTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`)
        const data = await res.json()
        setAddressSuggestions(data.features?.map((f: {properties:{label:string;city:string}}) => ({label:f.properties.label, city:f.properties.city})) || [])
      } catch {}
    }, 300)
  }

  function generateAI() {
    setAiLoading(true)
    setAiResult('')
    setTimeout(() => {
      setAiResult("Beau T3 lumineux situé dans un quartier prisé de Toulouse, à deux pas des commodités. L'appartement bénéficie d'une belle exposition et d'espaces de vie agréables. Idéal pour une installation durable, il offre tout le confort nécessaire pour une vie quotidienne agréable.")
      setAiLoading(false)
    }, 1800)
  }

  const stepLabels = ['Le bien', 'Photos & description', 'Vérification']

  return (
    <>
      <style>{`
        :root{--bg:#FDFCFA;--bg-soft:#F7F3EE;--bg-card:#FFFFFF;--brown:#3D2E22;--brown-mid:#5C4433;--brown-light:#96766A;--border:#EAE3DA;--border-soft:#F0EBE4;--text:#1A0F08;--text-muted:#8A7068;--text-light:#B5A49C;--green:#2D7A4F;--green-bg:#E8F5E9;--red:#C53030}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased}
        nav{position:sticky;top:0;z-index:100;height:60px;display:flex;align-items:center;padding:0 40px;background:rgba(253,252,250,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border-soft)}
        .logo{display:flex;align-items:center;gap:9px;text-decoration:none;margin-right:48px;flex-shrink:0}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1}
        .nav-links a{text-decoration:none;color:var(--text-muted);font-size:14px;font-weight:500;padding:6px 14px;border-radius:8px;transition:color .15s,background .15s}
        .nav-links a:hover{color:var(--brown);background:var(--bg-soft)}
        .nav-links a.active{color:var(--brown);font-weight:600}
        .nav-end{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .btn-ghost{padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;color:var(--brown-mid);border:1px solid var(--border);background:transparent;transition:background .15s;font-family:inherit;white-space:nowrap}
        .btn-ghost:hover{background:var(--bg-soft)}
        .btn-primary{padding:7px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;color:#fff;background:var(--brown);border:none;transition:opacity .15s;font-family:inherit;white-space:nowrap}
        .btn-primary:hover{opacity:.85}
        .page-container{max-width:780px;margin:0 auto;padding:48px 40px 100px}
        .page-title{font-size:32px;font-weight:800;letter-spacing:-1px;color:var(--brown);margin-bottom:8px}
        .page-subtitle{font-size:15px;color:var(--text-muted);margin-bottom:40px}
        .stepper{display:flex;align-items:center;gap:0;margin-bottom:48px}
        .step{display:flex;align-items:center;gap:10px}
        .step-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid var(--border);color:var(--text-light);background:var(--bg-card);transition:all .25s}
        .step.active .step-num{background:var(--brown);border-color:var(--brown);color:#fff}
        .step.done .step-num{background:var(--green);border-color:var(--green);color:#fff}
        .step-label{font-size:13px;font-weight:600;color:var(--text-light);transition:color .25s}
        .step.active .step-label{color:var(--brown)}
        .step.done .step-label{color:var(--green)}
        .step-line{flex:1;height:2px;background:var(--border);margin:0 16px;transition:background .25s}
        .step-line.done{background:var(--green)}
        .form-section{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:32px;margin-bottom:24px}
        .form-section-title{font-size:17px;font-weight:700;color:var(--brown);margin-bottom:24px;letter-spacing:-0.3px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .form-row.single{grid-template-columns:1fr}
        .form-row.triple{grid-template-columns:1fr 1fr 1fr}
        .field{display:flex;flex-direction:column;gap:6px}
        .field label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted)}
        .field input,.field select,.field textarea{padding:10px 14px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text);background:var(--bg);outline:none;transition:border-color .2s}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--brown-light)}
        .field textarea{resize:vertical;min-height:120px}
        .field select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A7068' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
        .field .hint{font-size:11px;color:var(--text-light)}
        .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-soft)}
        .toggle-row:last-child{border-bottom:none}
        .toggle-label{font-size:14px;font-weight:500;color:var(--text)}
        .toggle-label span{display:block;font-size:12px;color:var(--text-muted);font-weight:400;margin-top:2px}
        .toggle{width:44px;height:24px;background:var(--border);border-radius:12px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;border:none}
        .toggle::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .toggle.on{background:var(--brown)}
        .toggle.on::after{transform:translateX(20px)}
        .photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
        .photo-slot{aspect-ratio:4/3;border:2px dashed var(--border);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:border-color .2s,background .2s;background:var(--bg)}
        .photo-slot:hover{border-color:var(--brown-light);background:var(--bg-soft)}
        .photo-slot svg{color:var(--text-light)}
        .photo-slot span{font-size:11px;color:var(--text-light);font-weight:500}
        .features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
        .feature-tag{padding:10px 14px;border:1px solid var(--border);border-radius:10px;font-size:13px;font-weight:500;color:var(--text-muted);cursor:pointer;text-align:center;transition:all .2s;background:var(--bg);user-select:none}
        .feature-tag:hover{border-color:var(--brown-light);color:var(--brown)}
        .feature-tag.selected{background:var(--brown);border-color:var(--brown);color:#fff}
        .ai-box{background:linear-gradient(135deg,#F7F3EE 0%,#FDFCFA 100%);border:1px solid var(--border);border-radius:14px;padding:24px;margin-top:16px}
        .ai-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
        .ai-badge{display:inline-flex;align-items:center;gap:5px;background:var(--brown);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;text-transform:uppercase;letter-spacing:.5px}
        .ai-header p{font-size:13px;color:var(--text-muted)}
        .ai-btn{padding:10px 20px;background:var(--brown);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;transition:opacity .15s}
        .ai-btn:hover{opacity:.85}
        .ai-btn:disabled{opacity:.5;cursor:not-allowed}
        .ai-result{margin-top:16px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;font-size:14px;line-height:1.7;color:var(--text)}
        .ai-actions{display:flex;gap:8px;margin-top:12px}
        .address-wrap{position:relative}
        .address-suggestions{position:absolute;top:100%;left:0;right:0;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;margin-top:4px;box-shadow:0 8px 24px rgba(61,46,34,.12);z-index:10;overflow:hidden}
        .address-suggestion{padding:10px 14px;font-size:13px;color:var(--text);cursor:pointer;transition:background .1s;border-bottom:1px solid var(--border-soft)}
        .address-suggestion:last-child{border-bottom:none}
        .address-suggestion:hover{background:var(--bg-soft)}
        .address-suggestion span{color:var(--text-muted);font-size:12px}
        .form-nav{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:24px;border-top:1px solid var(--border-soft)}
        .btn-back{padding:10px 20px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-weight:600;color:var(--brown-mid);background:transparent;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:background .15s}
        .btn-back:hover{background:var(--bg-soft)}
        .btn-next{padding:12px 28px;background:var(--brown);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:opacity .15s}
        .btn-next:hover{opacity:.85}
        .success-box{text-align:center;padding:60px 40px}
        .success-icon{width:64px;height:64px;background:var(--green-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
        .success-box h2{font-size:24px;font-weight:700;color:var(--brown);margin-bottom:8px}
        .success-box p{font-size:15px;color:var(--text-muted);margin-bottom:32px}
        .gate-overlay{position:fixed;inset:0;z-index:1000;background:rgba(20,10,5,.55);display:flex;align-items:center;justify-content:center}
        .gate-modal{background:#FDFCFA;border-radius:20px;padding:44px 40px 40px;width:min(460px,calc(100vw - 40px));text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.18)}
        .gate-modal h2{font-size:24px;font-weight:800;letter-spacing:-.8px;color:#3D2E22;margin-bottom:12px}
        .gate-modal p{font-size:15px;color:#8A7068;line-height:1.65;margin-bottom:32px;max-width:340px;margin-left:auto;margin-right:auto}
        .gate-btn{display:block;width:100%;background:#3D2E22;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:14px;transition:opacity .15s;font-family:inherit}
        .gate-btn:hover{opacity:.85}
        .gate-link{font-size:14px;color:#8A7068;text-decoration:none}
        .gate-link span{font-weight:600;color:#5C4433}
        .blurred{filter:blur(6px);pointer-events:none;user-select:none}
        @media(max-width:768px){nav{padding:0 16px}.nav-links{display:none}.page-container{padding:32px 16px 80px}.page-title{font-size:26px}.form-section{padding:20px}.form-row{grid-template-columns:1fr}.form-row.triple{grid-template-columns:1fr 1fr}}
      `}</style>

      {showGate && (
        <div className="gate-overlay">
          <div className="gate-modal">
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:9,marginBottom:28}}>
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
                <>
                  <div key={n} className={`step ${cls}`}>
                    <div className="step-num">
                      {step > n
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        : n}
                    </div>
                    <div className="step-label">{label}</div>
                  </div>
                  {i < 2 && <div key={`line-${i}`} className={`step-line${step > n ? ' done' : ''}`}></div>}
                </>
              )
            })}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="form-section">
                <div className="form-section-title">Informations principales</div>
                <div className="form-row">
                  <div className="field">
                    <label>Type de bien</label>
                    <select><option value="">Sélectionner</option><option>Appartement</option><option>Maison</option><option>Studio</option><option>Chambre</option><option>Parking</option><option>Local commercial</option></select>
                  </div>
                  <div className="field">
                    <label>Titre de l&apos;annonce</label>
                    <input type="text" placeholder="Ex : T3 lumineux — Capitole" />
                  </div>
                </div>
                <div className="form-row triple">
                  <div className="field"><label>Loyer (€/mois)</label><input type="number" placeholder="850" /></div>
                  <div className="field"><label>Charges (€/mois)</label><input type="number" placeholder="60" /></div>
                  <div className="field"><label>Dépôt de garantie</label><input type="number" placeholder="1700" /></div>
                </div>
                <div className="form-row triple">
                  <div className="field"><label>Surface (m²)</label><input type="number" placeholder="65" /></div>
                  <div className="field"><label>Nombre de pièces</label><input type="number" placeholder="3" /></div>
                  <div className="field"><label>Chambres</label><input type="number" placeholder="2" /></div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>DPE</label>
                    <select><option>Sélectionner</option><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option></select>
                  </div>
                  <div className="field">
                    <label>Disponibilité</label>
                    <input type="date" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Adresse</div>
                <div className="form-row single">
                  <div className="field">
                    <label>Adresse complète</label>
                    <div className="address-wrap">
                      <input type="text" placeholder="12 rue du Taur, Toulouse" value={addressValue}
                        onChange={e => { setAddressValue(e.target.value); fetchAddress(e.target.value) }} />
                      {addressSuggestions.length > 0 && (
                        <div className="address-suggestions">
                          {addressSuggestions.map((s, i) => (
                            <div key={i} className="address-suggestion" onClick={() => { setAddressValue(s.label); setAddressSuggestions([]) }}>
                              {s.label} <span>{s.city}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Options</div>
                <div className="toggle-row">
                  <div className="toggle-label">Meublé<span>L&apos;appartement est loué avec mobilier</span></div>
                  <button className={`toggle${furnished ? ' on' : ''}`} onClick={() => setFurnished(!furnished)} />
                </div>
                <div className="toggle-row">
                  <div className="toggle-label">Parking inclus<span>Place de parking incluse dans le loyer</span></div>
                  <button className={`toggle${parking ? ' on' : ''}`} onClick={() => setParking(!parking)} />
                </div>
                <div className="toggle-row">
                  <div className="toggle-label">Animaux acceptés<span>Les animaux de compagnie sont les bienvenus</span></div>
                  <button className={`toggle${pets ? ' on' : ''}`} onClick={() => setPets(!pets)} />
                </div>
              </div>

              <div className="form-nav">
                <div></div>
                <button className="btn-next" onClick={() => setStep(2)}>
                  Suivant : Photos & description
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="form-section">
                <div className="form-section-title">Photos du bien</div>
                <div className="photo-grid">
                  {Array.from({length:6}).map((_, i) => (
                    <div key={i} className="photo-slot">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                      <span>{i === 0 ? 'Photo principale' : `Photo ${i+1}`}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Description</div>
                <div className="form-row single">
                  <div className="field">
                    <label>Description du bien</label>
                    <textarea placeholder="Décrivez votre bien : atouts, environnement, transports proches..." />
                    <span className="hint">Minimum 100 caractères recommandé</span>
                  </div>
                </div>
                <div className="ai-box">
                  <div className="ai-header">
                    <span className="ai-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
                      IA Drify
                    </span>
                    <p>Générez une description professionnelle automatiquement</p>
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
                        <button className="btn-ghost" style={{fontSize:12}}>Utiliser cette description</button>
                        <button className="btn-ghost" style={{fontSize:12}} onClick={generateAI}>Régénérer</button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Équipements & services</div>
                <div className="features-grid">
                  {FEATURES.map(f => (
                    <button key={f} className={`feature-tag${selectedFeatures.includes(f) ? ' selected' : ''}`} onClick={() => toggleFeature(f)}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="form-nav">
                <button className="btn-back" onClick={() => setStep(1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Retour
                </button>
                <button className="btn-next" onClick={() => setStep(3)}>
                  Vérifier l&apos;annonce
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="form-section">
                <div className="form-section-title">Récapitulatif de votre annonce</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    {label:'Type', value:'Appartement T3'},
                    {label:'Adresse', value:addressValue || '—'},
                    {label:'Loyer', value:'850 € / mois CC'},
                    {label:'Surface', value:'65 m²'},
                    {label:'Meublé', value:furnished ? 'Oui' : 'Non'},
                    {label:'Équipements sélectionnés', value:selectedFeatures.length > 0 ? selectedFeatures.join(', ') : '—'},
                  ].map((row, i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border-soft)',fontSize:14}}>
                      <span style={{color:'var(--text-muted)'}}>{row.label}</span>
                      <span style={{fontWeight:600,color:'var(--text)'}}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="success-box">
                  <div className="success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D7A4F" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h2>Prêt à publier !</h2>
                  <p>Votre annonce est complète. Elle sera visible sur Drify après validation.</p>
                  <button className="btn-next" style={{margin:'0 auto'}} onClick={() => {}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    Publier l&apos;annonce
                  </button>
                </div>
              </div>

              <div className="form-nav">
                <button className="btn-back" onClick={() => setStep(2)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Retour
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
