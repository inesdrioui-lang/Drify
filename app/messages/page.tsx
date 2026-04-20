'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

type Message = { from: 'me' | 'them'; text: string; time: string }
type Conversation = {
  name: string; initials: string; online: boolean
  property: string; propertyInfo: string
  messages: Message[]
}

const CONVERSATIONS: Record<number, Conversation> = {
  1: { name:'Marie Duval', initials:'MD', online:true, property:'T3 briques roses — Capitole', propertyInfo:'850 €/mois · 65 m² · Toulouse',
    messages:[
      {from:'them',text:"Bonjour ! Je suis très intéressée par votre T3 au Capitole. Est-il toujours disponible ?",time:'14:30'},
      {from:'them',text:"J'ai un CDI et mon dossier DossierFacile est déjà validé. Je peux vous l'envoyer si besoin.",time:'14:32'},
      {from:'me',text:"Bonjour Marie ! Oui, l'appartement est toujours disponible. Je serais ravi de recevoir votre dossier.",time:'14:45'},
      {from:'me',text:"Seriez-vous disponible pour une visite cette semaine ? Je peux vous proposer jeudi ou vendredi après-midi.",time:'14:46'},
      {from:'them',text:"Super ! Jeudi 16h ça m'irait parfaitement. Je vous envoie mon dossier d'ici ce soir.",time:'15:02'},
      {from:'me',text:"Parfait, c'est noté. Jeudi 16h devant l'immeuble, 12 rue du Taur. À jeudi !",time:'15:10'},
    ]},
  2: { name:'Lucas Martin', initials:'LM', online:false, property:'Studio meublé — Saint-Cyprien', propertyInfo:'520 €/mois · 26 m² · Toulouse',
    messages:[
      {from:'them',text:"Bonjour, votre studio est-il disponible pour une visite ce week-end ?",time:'10:15'},
      {from:'me',text:"Bonjour Lucas ! Oui, samedi matin ça vous conviendrait ?",time:'10:30'},
      {from:'them',text:"D'accord, je peux passer samedi matin pour la visite.",time:'11:02'},
    ]},
  3: { name:'Sophie Bertrand', initials:'SB', online:true, property:'T4 avec jardin — Lardenne', propertyInfo:'1 350 €/mois · 95 m² · Toulouse',
    messages:[
      {from:'me',text:"Bonjour Sophie, voici votre quittance de loyer pour le mois de mars.",time:'09:00'},
      {from:'them',text:"Merci pour la quittance, bien reçue !",time:'09:45'},
    ]},
  4: { name:'Julie Roux', initials:'JR', online:false, property:'T3 briques roses — Capitole', propertyInfo:'850 €/mois · 65 m² · Toulouse',
    messages:[
      {from:'them',text:"Bonjour, j'aimerais candidater pour votre T3 Capitole.",time:'16:00'},
      {from:'me',text:"Bonjour Julie ! Avec plaisir, envoyez-moi votre dossier.",time:'16:15'},
      {from:'them',text:"Je vous envoie mon dossier DossierFacile ce soir.",time:'16:20'},
    ]},
  5: { name:'Thomas Petit', initials:'TP', online:false, property:'Studio meublé — Saint-Cyprien', propertyInfo:'520 €/mois · 26 m² · Toulouse',
    messages:[{from:'them',text:"Est-ce que les charges incluent l'eau chaude ?",time:'14:00'}]},
}

const CONV_LIST = [
  { id:1, unread:2, time:'14:32', preview:"Bonjour, le logement est-il toujours disponible ?" },
  { id:2, unread:0, time:'Hier',  preview:"D'accord, je peux passer samedi matin pour la visite." },
  { id:3, unread:0, time:'Lun',   preview:"Merci pour la quittance, bien reçue !" },
  { id:4, unread:0, time:'Dim',   preview:"Je vous envoie mon dossier DossierFacile ce soir." },
  { id:5, unread:0, time:'23 mar',preview:"Est-ce que les charges incluent l'eau chaude ?" },
]

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(1)
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [convList, setConvList] = useState(CONV_LIST)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conv = conversations[activeId]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, conversations])

  function selectConv(id: number) {
    setActiveId(id)
    setConvList(prev => prev.map(c => c.id === id ? {...c, unread:0} : c))
  }

  function now() {
    const d = new Date()
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
  }

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const time = now()
    setConversations(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], messages: [...prev[activeId].messages, {from:'me',text,time}] }
    }))
    setConvList(prev => prev.map(c => c.id === activeId ? {...c, preview:`Vous : ${text}`, time} : c))
    setInput('')
    setTyping(true)
    setTimeout(() => setTyping(false), 2500)
  }

  const filteredList = convList.filter(c => {
    const conv = conversations[c.id]
    return conv.name.toLowerCase().includes(search.toLowerCase()) || c.preview.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <>
      <style>{`
        :root{--bg:#FDFCFA;--bg-soft:#F7F3EE;--bg-card:#FFFFFF;--brown:#3D2E22;--brown-mid:#5C4433;--brown-light:#96766A;--border:#EAE3DA;--border-soft:#F0EBE4;--text:#1A0F08;--text-muted:#8A7068;--text-light:#B5A49C;--green:#2D7A4F}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased;height:100vh;overflow:hidden}
        nav{position:sticky;top:0;z-index:100;height:60px;display:flex;align-items:center;padding:0 40px;background:rgba(253,252,250,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border-soft)}
        .logo{display:flex;align-items:center;gap:9px;text-decoration:none;margin-right:48px;flex-shrink:0}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1}
        .nav-links a{text-decoration:none;color:var(--text-muted);font-size:14px;font-weight:500;padding:6px 14px;border-radius:8px;transition:color .15s,background .15s}
        .nav-links a:hover{color:var(--brown);background:var(--bg-soft)}
        .nav-links a.active{color:var(--brown);font-weight:600}
        .nav-end{display:flex;align-items:center;gap:12px;flex-shrink:0}
        .nav-avatar{width:32px;height:32px;border-radius:50%;background:var(--brown);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;cursor:pointer}
        .messenger{display:grid;grid-template-columns:340px 1fr;height:calc(100vh - 60px)}
        .conv-panel{background:var(--bg-card);border-right:1px solid var(--border-soft);display:flex;flex-direction:column;overflow:hidden}
        .conv-header{padding:20px;border-bottom:1px solid var(--border-soft)}
        .conv-header h2{font-size:20px;font-weight:800;color:var(--brown);letter-spacing:-0.5px;margin-bottom:12px}
        .conv-search{width:100%;padding:9px 14px 9px 36px;border:1px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;color:var(--text);background:var(--bg);outline:none;transition:border-color .2s}
        .conv-search:focus{border-color:var(--brown-light)}
        .conv-list{flex:1;overflow-y:auto}
        .conv-item{display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;transition:background .1s;border-bottom:1px solid var(--border-soft);position:relative}
        .conv-item:hover{background:var(--bg-soft)}
        .conv-item.active{background:var(--bg-soft)}
        .conv-avatar{width:42px;height:42px;border-radius:50%;background:var(--bg-soft);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--brown-mid);flex-shrink:0;position:relative}
        .conv-avatar.online::after{content:'';position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid var(--bg-card)}
        .conv-info{flex:1;min-width:0}
        .conv-name{font-size:14px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px}
        .conv-property{font-size:11px;font-weight:500;color:var(--text-light);background:var(--bg-soft);padding:1px 6px;border-radius:4px}
        .conv-preview{font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
        .conv-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
        .conv-time{font-size:11px;color:var(--text-light)}
        .conv-unread{width:18px;height:18px;border-radius:50%;background:var(--brown);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
        .chat-panel{display:flex;flex-direction:column;background:var(--bg)}
        .chat-header{padding:14px 24px;border-bottom:1px solid var(--border-soft);display:flex;align-items:center;gap:12px;background:var(--bg-card)}
        .chat-header-avatar{width:36px;height:36px;border-radius:50%;background:var(--bg-soft);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--brown-mid)}
        .chat-header-info h3{font-size:14px;font-weight:600;color:var(--text)}
        .chat-header-info span{font-size:12px;color:var(--text-muted)}
        .chat-header-actions{margin-left:auto;display:flex;gap:8px}
        .chat-action-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);transition:all .15s}
        .chat-action-btn:hover{color:var(--brown);background:var(--bg-soft)}
        .chat-context{padding:10px 24px;background:var(--bg-soft);border-bottom:1px solid var(--border-soft);display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-muted)}
        .chat-context-thumb{width:40px;height:30px;border-radius:6px;background:var(--border);flex-shrink:0}
        .chat-context strong{color:var(--text);font-weight:600}
        .chat-context a{margin-left:auto;font-size:12px;font-weight:600;color:var(--brown-mid);text-decoration:none}
        .chat-messages{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
        .msg-group{display:flex;flex-direction:column;gap:4px}
        .msg-group.sent{align-items:flex-end}
        .msg-group.received{align-items:flex-start}
        .msg-date{text-align:center;font-size:11px;font-weight:600;color:var(--text-light);margin:8px 0}
        .msg{max-width:65%;padding:10px 16px;border-radius:16px;font-size:14px;line-height:1.5}
        .msg-group.sent .msg{background:var(--brown);color:#fff;border-bottom-right-radius:4px}
        .msg-group.received .msg{background:var(--bg-card);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}
        .msg-time{font-size:10px;color:var(--text-light);margin-top:2px;padding:0 4px}
        .msg-group.sent .msg-time{text-align:right}
        .typing-indicator{display:flex;align-items:center;gap:4px;padding:0 24px 8px;font-size:12px;color:var(--text-light)}
        .typing-dot{width:6px;height:6px;border-radius:50%;background:var(--text-light);animation:typingBounce 1.4s infinite ease-in-out}
        .typing-dot:nth-child(2){animation-delay:.2s}
        .typing-dot:nth-child(3){animation-delay:.4s}
        @keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
        .chat-input{padding:16px 24px;border-top:1px solid var(--border-soft);background:var(--bg-card);display:flex;align-items:flex-end;gap:10px}
        .chat-input-wrap{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:12px;display:flex;align-items:flex-end;overflow:hidden;transition:border-color .2s}
        .chat-input-wrap:focus-within{border-color:var(--brown-light)}
        .chat-textarea{flex:1;padding:10px 14px;border:none;outline:none;background:transparent;font-size:14px;font-family:inherit;color:var(--text);resize:none;max-height:120px;line-height:1.4}
        .chat-attach-btn{padding:8px 10px;background:none;border:none;color:var(--text-light);cursor:pointer;transition:color .15s;flex-shrink:0}
        .chat-attach-btn:hover{color:var(--brown)}
        .chat-send-btn{width:40px;height:40px;border-radius:10px;background:var(--brown);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s;flex-shrink:0}
        .chat-send-btn:hover{opacity:.85}
        .chat-send-btn:disabled{opacity:.3;cursor:not-allowed}
        @media(max-width:768px){nav{padding:0 16px}.nav-links{display:none}.messenger{grid-template-columns:1fr}}
      `}</style>

      <nav>
        <Link href="/" className="logo">
          <Image src="/logo.svg" height={32} width={80} style={{width:'auto'}} alt="Drify" />
        </Link>
        <div className="nav-links">
          <Link href="/">Accueil</Link>
          <Link href="/recherche">Rechercher</Link>
          <Link href="/publier">Publier</Link>
          <Link href="/messages" className="active">Messages</Link>
          <Link href="/favoris">Favoris</Link>
        </div>
        <div className="nav-end">
          <div className="nav-avatar">PD</div>
        </div>
      </nav>

      <div className="messenger">
        {/* CONVERSATION LIST */}
        <div className="conv-panel">
          <div className="conv-header">
            <h2>Messages</h2>
            <input type="text" className="conv-search" placeholder="Rechercher une conversation..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="conv-list">
            {filteredList.map(c => {
              const cv = conversations[c.id]
              return (
                <div key={c.id} className={`conv-item${activeId === c.id ? ' active' : ''}`} onClick={() => selectConv(c.id)}>
                  <div className={`conv-avatar${cv.online ? ' online' : ''}`}>{cv.initials}</div>
                  <div className="conv-info">
                    <div className="conv-name">{cv.name} <span className="conv-property">{cv.property.split('—')[0].trim()}</span></div>
                    <div className="conv-preview">{c.preview}</div>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{c.time}</span>
                    {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-avatar">{conv.initials}</div>
            <div className="chat-header-info">
              <h3>{conv.name}</h3>
              <span>{conv.online ? 'En ligne' : 'Hors ligne'}</span>
            </div>
            <div className="chat-header-actions">
              <button className="chat-action-btn" title="Appeler">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12.7a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </button>
              <button className="chat-action-btn" title="Plus d'options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>

          <div className="chat-context">
            <div className="chat-context-thumb"></div>
            <div>
              <strong>{conv.property}</strong><br/>{conv.propertyInfo}
            </div>
            <Link href="/annonce">Voir l&apos;annonce</Link>
          </div>

          <div className="chat-messages">
            <div className="msg-date">Aujourd&apos;hui</div>
            {conv.messages.map((msg, i) => (
              <div key={i} className={`msg-group ${msg.from === 'me' ? 'sent' : 'received'}`}>
                <div className="msg">{msg.text}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {typing && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <span style={{marginLeft:4}}>{conv.name.split(' ')[0]} écrit...</span>
            </div>
          )}

          <div className="chat-input">
            <div className="chat-input-wrap">
              <button className="chat-attach-btn" title="Joindre un fichier">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <textarea className="chat-textarea" placeholder="Écrire un message..." rows={1}
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
            </div>
            <button className="chat-send-btn" disabled={!input.trim()} onClick={sendMessage} title="Envoyer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
