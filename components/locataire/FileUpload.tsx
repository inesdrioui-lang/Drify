'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { insertDocument } from '@/app/locataire/actions'

interface FileUploadProps {
  categorie: string
  userId: string
}

export default function FileUpload({ categorie, userId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 Mo')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const path = `${userId}/${categorie}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('dossier-documents')
      .upload(path, file)

    if (uploadError) {
      setError("Erreur lors de l'envoi. Réessayez.")
      setUploading(false)
      return
    }

    const result = await insertDocument({
      nom: file.name,
      categorie,
      fichier_path: path,
      taille_bytes: file.size,
    })

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <>
      <style>{`
        .fu-zone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 20px 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          background: var(--bg-soft);
        }
        .fu-zone:hover, .fu-zone.dragging {
          border-color: var(--brown-light);
          background: #F5EDE4;
        }
        .fu-zone.uploading { opacity: 0.6; cursor: not-allowed; }
        .fu-icon { color: var(--brown-light); margin-bottom: 8px; }
        .fu-label { font-size: 13px; font-weight: 600; color: var(--brown-mid); margin-bottom: 2px; }
        .fu-sub { font-size: 11px; color: var(--text-light); }
        .fu-error { font-size: 12px; color: var(--error); margin-top: 8px; font-weight: 500; }
        .fu-success { font-size: 12px; color: #4A7C59; margin-top: 8px; font-weight: 500; display: flex; align-items: center; gap: 4px; justify-content: center; }
        .fu-spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--brown-mid); border-radius: 50%; animation: fuSpin 0.7s linear infinite; margin: 0 auto 6px; }
        @keyframes fuSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className={`fu-zone${isDragging ? ' dragging' : ''}${uploading ? ' uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        aria-label="Zone d'upload de document PDF"
      >
        {uploading ? (
          <>
            <div className="fu-spinner" />
            <div className="fu-label">Envoi en cours…</div>
          </>
        ) : (
          <>
            <div className="fu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="fu-label">Glisser un PDF ici ou cliquer</div>
            <div className="fu-sub">PDF uniquement · 5 Mo maximum</div>
          </>
        )}

        {error && <div className="fu-error">⚠ {error}</div>}
        {success && (
          <div className="fu-success">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Document ajouté avec succès
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={onChange}
        aria-hidden="true"
      />
    </>
  )
}
