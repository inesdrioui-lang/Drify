'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ConversationRow, MessageRow } from '@/types/messages'

export default function MessagesClient() {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auth
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showGate, setShowGate] = useState(false)

  // Conversations
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [convLoading, setConvLoading] = useState(true)

  // Conversation active
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [msgLoading, setMsgLoading] = useState(false)

  // Saisie
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const timeoutFallback = new Promise<null>(resolve => setTimeout(() => resolve(null), 3000))

    Promise.race([
      supabase.auth.getUser().then(({ data: { user } }) => user ?? null),
      timeoutFallback
    ])
      .then(user => {
        if (user) setUserId(user.id)
        else setShowGate(true)
      })
      .catch(() => setShowGate(true))
      .finally(() => setAuthChecked(true))
  }, [])

  // ── Fetch conversations ───────────────────────────────────
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    setConvLoading(true)

    const convParam = new URLSearchParams(window.location.search).get('conv')

    supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setConversations(data as ConversationRow[])
          if (convParam && (data as ConversationRow[]).find(c => c.id === convParam)) {
            setActiveId(convParam)
            setMobileView('chat')
          } else if (data.length > 0) {
            setActiveId((data as ConversationRow[])[0].id)
          }
        }
        setConvLoading(false)
      })
  }, [userId])

  // ── Fetch messages + Realtime ─────────────────────────────
  useEffect(() => {
    if (!activeId) return
    const supabase = createClient()
    setMsgLoading(true)

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMessages(data as MessageRow[])
        setMsgLoading(false)
      })

    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const newMsg = payload.new as MessageRow
          setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [activeId])

  // ── Auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Envoyer un message ────────────────────────────────────
  async function sendMessage() {
    const text = input.trim()
    if (!text || !activeId || !userId || sending) return
    setInput('')
    setSending(true)

    const supabase = createClient()
    const { data: msg } = await supabase
      .from('messages')
      .insert({ conversation_id: activeId, sender_id: userId, content: text })
      .select()
      .single()

    if (msg) {
      const msgRow = msg as MessageRow
      setMessages(prev => prev.find(m => m.id === msgRow.id) ? prev : [...prev, msgRow])
      const preview = `Vous : ${text}`
      await supabase
        .from('conversations')
        .update({ last_message_preview: preview, last_message_at: msgRow.created_at })
        .eq('id', activeId)
      setConversations(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, last_message_preview: preview, last_message_at: msgRow.created_at }
          : c
      ))
    }

    setSending(false)
  }

  function selectConv(id: string) {
    setActiveId(id)
    setMessages([])
    setMobileView('chat')
  }

  function formatTime(iso: string): string {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()]
    return `${d.getDate()} ${['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'][d.getMonth()]}`
  }

  const activeConv = conversations.find(c => c.id === activeId)
  const filteredConvs = conversations.filter(c =>
    c.other_user_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.last_message_preview ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.property_title ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Pas de flash avant la vérification auth
  if (!authChecked) return null

  // ── Gate non-connecté ─────────────────────────────────────
  if (showGate) {
    return (
      <>
        <style>{`
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FDFCFA;-webkit-font-smoothing:antialiased}
          .gate-page{min-height:calc(100vh - 60px);display:flex;align-items:center;justify-content:center;padding:40px 20px;background:#FDFCFA}
          .gate-card{background:#fff;border:1px solid #EAE3DA;border-radius:24px;padding:48px 44px 44px;width:min(460px,100%);text-align:center;box-shadow:0 8px 40px rgba(61,46,34,0.08)}
          .gate-icon{width:56px;height:56px;border-radius:16px;background:#F7F3EE;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
          .gate-card h2{font-size:24px;font-weight:800;letter-spacing:-.6px;color:#3D2E22;margin-bottom:10px}
          .gate-card p{font-size:15px;color:#8A7068;line-height:1.65;margin-bottom:32px;max-width:320px;margin-left:auto;margin-right:auto}
          .gate-btn{display:block;width:100%;background:#3D2E22;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:14px;transition:opacity .15s;font-family:inherit}
          .gate-btn:hover{opacity:.85}
          .gate-link{display:block;font-size:14px;color:#8A7068;text-decoration:none}
          .gate-link span{font-weight:600;color:#5C4433}
          .gate-link:hover span{text-decoration:underline}
        `}</style>
        <div className="gate-page">
          <div className="gate-card">
            <div className="gate-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2>Accéder à la messagerie</h2>
            <p>Connectez-vous pour consulter et envoyer des messages aux propriétaires.</p>
            <Link href="/connexion?redirect=/messages" className="gate-btn">Se connecter</Link>
            <Link href="/inscription?redirect=/messages" className="gate-link">
              Pas encore de compte ?&nbsp;<span>Créer un compte</span>
            </Link>
          </div>
        </div>
      </>
    )
  }

  // ── Messagerie connectée ──────────────────────────────────
  return (
    <>
      <style>{`
        :root{--bg:#FDFCFA;--bg-soft:#F7F3EE;--bg-card:#FFFFFF;--brown:#3D2E22;--brown-mid:#5C4433;--brown-light:#96766A;--border:#EAE3DA;--border-soft:#F0EBE4;--text:#1A0F08;--text-muted:#8A7068;--text-light:#B5A49C}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased;height:100vh;overflow:hidden}
        .messenger{display:grid;grid-template-columns:320px 1fr;height:calc(100vh - 60px)}

        /* ── Liste ── */
        .conv-panel{background:var(--bg-card);border-right:1px solid var(--border-soft);display:flex;flex-direction:column;overflow:hidden}
        .conv-header{padding:20px;border-bottom:1px solid var(--border-soft)}
        .conv-header h2{font-size:20px;font-weight:800;color:var(--brown);letter-spacing:-.5px;margin-bottom:12px}
        .search-wrap{position:relative}
        .search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-light);pointer-events:none}
        .conv-search{width:100%;padding:9px 14px 9px 34px;border:1px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;color:var(--text);background:var(--bg);outline:none;transition:border-color .2s}
        .conv-search:focus{border-color:var(--brown-light)}
        .conv-list{flex:1;overflow-y:auto}
        .conv-item{display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;transition:background .1s;border-bottom:1px solid var(--border-soft)}
        .conv-item:hover{background:var(--bg-soft)}
        .conv-item.active{background:var(--bg-soft)}
        .conv-avatar{width:42px;height:42px;border-radius:50%;background:var(--bg-soft);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--brown-mid);flex-shrink:0;border:1px solid var(--border)}
        .conv-info{flex:1;min-width:0}
        .conv-name{font-size:14px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .conv-property{font-size:11px;font-weight:500;color:var(--text-light);background:var(--bg-soft);padding:1px 6px;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
        .conv-preview{font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
        .conv-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
        .conv-time{font-size:11px;color:var(--text-light)}

        /* ── État vide ── */
        .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 24px;text-align:center;gap:12px}
        .empty-icon{width:52px;height:52px;border-radius:16px;background:var(--bg-soft);display:flex;align-items:center;justify-content:center;margin-bottom:4px}
        .empty-state h3{font-size:16px;font-weight:700;color:var(--brown);line-height:1.4}
        .empty-state p{font-size:13px;color:var(--text-muted);line-height:1.6;max-width:220px}
        .empty-cta{margin-top:4px;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:var(--brown);color:#fff;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;transition:opacity .15s}
        .empty-cta:hover{opacity:.85}

        /* ── Squelette chargement ── */
        .skeleton{background:linear-gradient(90deg,var(--border-soft) 25%,var(--border) 50%,var(--border-soft) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── Chat ── */
        .chat-panel{display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
        .chat-placeholder{flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--text-light)}
        .chat-header{padding:14px 20px;border-bottom:1px solid var(--border-soft);display:flex;align-items:center;gap:12px;background:var(--bg-card);flex-shrink:0}
        .chat-header-avatar{width:36px;height:36px;border-radius:50%;background:var(--bg-soft);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--brown-mid);flex-shrink:0}
        .chat-header-info h3{font-size:14px;font-weight:600;color:var(--text)}
        .chat-header-info span{font-size:12px;color:var(--text-muted)}
        .chat-context{padding:10px 20px;background:var(--bg-soft);border-bottom:1px solid var(--border-soft);display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-muted);flex-shrink:0}
        .chat-context-thumb{width:40px;height:30px;border-radius:6px;background:var(--border);flex-shrink:0}
        .chat-context strong{color:var(--text);font-weight:600;display:block;margin-bottom:1px}
        .chat-context a{margin-left:auto;font-size:12px;font-weight:600;color:var(--brown-mid);text-decoration:none;white-space:nowrap}
        .chat-context a:hover{text-decoration:underline}
        .chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px}
        .msg-loader{display:flex;justify-content:center;padding:24px;color:var(--text-light);font-size:13px}
        .msg-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:13px}
        .msg-group{display:flex;flex-direction:column;gap:3px}
        .msg-group.sent{align-items:flex-end}
        .msg-group.received{align-items:flex-start}
        .msg{max-width:66%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.55;word-break:break-word}
        .msg-group.sent .msg{background:var(--brown);color:#fff;border-bottom-right-radius:4px}
        .msg-group.received .msg{background:var(--bg-card);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}
        .msg-time{font-size:10px;color:var(--text-light);padding:0 4px}
        .msg-group.sent .msg-time{text-align:right}
        .chat-input{padding:14px 20px;border-top:1px solid var(--border-soft);background:var(--bg-card);display:flex;align-items:flex-end;gap:10px;flex-shrink:0}
        .chat-input-wrap{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:12px;display:flex;align-items:flex-end;overflow:hidden;transition:border-color .2s}
        .chat-input-wrap:focus-within{border-color:var(--brown-light)}
        .chat-textarea{flex:1;padding:10px 14px;border:none;outline:none;background:transparent;font-size:14px;font-family:inherit;color:var(--text);resize:none;max-height:120px;line-height:1.4}
        .chat-send-btn{width:40px;height:40px;border-radius:10px;background:var(--brown);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s;flex-shrink:0}
        .chat-send-btn:hover{opacity:.85}
        .chat-send-btn:disabled{opacity:.3;cursor:not-allowed}

        /* ── Mobile ── */
        .mobile-back-btn{display:none;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--brown-mid);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;flex-shrink:0}
        .mobile-back-btn:hover{background:var(--bg-soft)}
        @media(max-width:768px){
          body{overflow:auto}
          .messenger{grid-template-columns:1fr;height:calc(100dvh - 60px)}
          .mobile-back-btn{display:flex}
          .messenger[data-view="chat"] .conv-panel{display:none}
          .messenger[data-view="list"] .chat-panel{display:none}
          .msg{max-width:82%}
          .chat-messages{padding:14px}
          .chat-input{padding:10px 14px}
        }
      `}</style>

      <div className="messenger" data-view={mobileView}>

        {/* ── LISTE DES CONVERSATIONS ── */}
        <div className="conv-panel">
          <div className="conv-header">
            <h2>Messages</h2>
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input type="text" className="conv-search" placeholder="Rechercher une conversation..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="conv-list" style={{display:'flex',flexDirection:'column'}}>
            {convLoading ? (
              // Squelettes chargement
              [1, 2, 3].map(i => (
                <div key={i} className="conv-item" style={{pointerEvents:'none'}}>
                  <div className="conv-avatar skeleton" style={{background:undefined}} />
                  <div className="conv-info">
                    <div className="skeleton" style={{height:13,width:'58%',borderRadius:4,marginBottom:8}} />
                    <div className="skeleton" style={{height:11,width:'82%',borderRadius:4}} />
                  </div>
                </div>
              ))
            ) : filteredConvs.length === 0 ? (
              search ? (
                <div style={{padding:'40px 20px',textAlign:'center',color:'var(--text-light)',fontSize:13}}>
                  Aucun résultat pour «&nbsp;{search}&nbsp;»
                </div>
              ) : (
                // État vide — aucune conversation
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#96766A" strokeWidth="1.6">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <h3>Aucune conversation<br/>pour le moment</h3>
                  <p>Vos échanges avec les propriétaires apparaîtront ici</p>
                  <Link href="/recherche" className="empty-cta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    Rechercher un logement
                  </Link>
                </div>
              )
            ) : (
              filteredConvs.map(c => (
                <div key={c.id}
                  className={`conv-item${activeId === c.id ? ' active' : ''}`}
                  onClick={() => selectConv(c.id)}>
                  <div className="conv-avatar">{c.other_user_initials}</div>
                  <div className="conv-info">
                    <div className="conv-name">
                      {c.other_user_name}
                      {c.property_title && (
                        <span className="conv-property">{c.property_title.split('—')[0].trim()}</span>
                      )}
                    </div>
                    <div className="conv-preview">
                      {c.last_message_preview ?? 'Nouvelle conversation'}
                    </div>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{formatTime(c.last_message_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── PANNEAU CHAT ── */}
        <div className="chat-panel">
          {!activeConv ? (
            <div className="chat-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B5A49C" strokeWidth="1.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span style={{fontSize:13}}>Sélectionnez une conversation</span>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button className="mobile-back-btn" onClick={() => setMobileView('list')} aria-label="Retour">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Retour
                </button>
                <div className="chat-header-avatar">{activeConv.other_user_initials}</div>
                <div className="chat-header-info">
                  <h3>{activeConv.other_user_name}</h3>
                  <span>Propriétaire</span>
                </div>
              </div>

              {activeConv.property_title && (
                <div className="chat-context">
                  <div className="chat-context-thumb" />
                  <div>
                    <strong>{activeConv.property_title}</strong>
                    {activeConv.property_info}
                  </div>
                  <Link href="/annonce">Voir l&apos;annonce</Link>
                </div>
              )}

              <div className="chat-messages">
                {msgLoading ? (
                  <div className="msg-loader">Chargement…</div>
                ) : messages.length === 0 ? (
                  <div className="msg-empty">
                    Envoyez votre premier message à {activeConv.other_user_name.split(' ')[0]}
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`msg-group ${msg.sender_id === userId ? 'sent' : 'received'}`}>
                      <div className="msg">{msg.content}</div>
                      <div className="msg-time">{formatTime(msg.created_at)}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <div className="chat-input-wrap">
                  <textarea
                    className="chat-textarea"
                    placeholder={`Écrire à ${activeConv.other_user_name.split(' ')[0]}…`}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                    }}
                  />
                </div>
                <button
                  className="chat-send-btn"
                  disabled={!input.trim() || sending}
                  onClick={sendMessage}
                  title="Envoyer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
