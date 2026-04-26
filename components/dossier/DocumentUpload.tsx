'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { recordDocument, getDocumentSignedUrl, removeDocument } from '@/app/locataire/dossier/actions'

export interface DocEntry {
  id: string
  nom: string
  type_document: string
  fichier_path: string
  taille_bytes: number
  statut: string
  created_at: string
}

interface DocumentUploadProps {
  userId: string
  typeDocument: string
  label: string
  description?: string
  documents: DocEntry[]
  onAdded: (doc: DocEntry) => void
  onRemoved: (id: string) => void
  garantId?: string | null
  storagePrefix?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statutStyle(statut: string) {
  if (statut === 'valide') return { label: 'Validé', color: '#4A7C59', bg: '#EAF3EE' }
  if (statut === 'refuse') return { label: 'Refusé', color: '#9B3A2A', bg: '#FAECEC' }
  return { label: 'En attente', color: '#9B7226', bg: '#FDF4E3' }
}

export default function DocumentUpload({
  userId,
  typeDocument,
  label,
  description,
  documents,
  onAdded,
  onRemoved,
  garantId = null,
  storagePrefix = 'locataire',
}: DocumentUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploadError('')
    if (file.type !== 'application/pdf') {
      setUploadError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Taille maximale : 5 Mo.')
      return
    }

    setUploading(true)
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${userId}/${storagePrefix}/${typeDocument}/${Date.now()}-${sanitized}`

    const supabase = createClient()
    const { error: storageError } = await supabase.storage
      .from('dossier-documents')
      .upload(path, file, { contentType: 'application/pdf', upsert: false })

    if (storageError) {
      setUploadError('Erreur lors de l\'upload : ' + storageError.message)
      setUploading(false)
      return
    }

    const result = await recordDocument({
      nom: file.name,
      type_document: typeDocument,
      fichier_path: path,
      taille_bytes: file.size,
      garant_id: garantId,
    })

    if (result.error) {
      await supabase.storage.from('dossier-documents').remove([path])
      setUploadError('Erreur d\'enregistrement : ' + result.error)
      setUploading(false)
      return
    }

    onAdded({
      id: result.id!,
      nom: file.name,
      type_document: typeDocument,
      fichier_path: path,
      taille_bytes: file.size,
      statut: 'en_attente',
      created_at: new Date().toISOString(),
    })
    setUploading(false)
  }

  async function handleView(fichierPath: string) {
    const url = await getDocumentSignedUrl(fichierPath)
    if (url) window.open(url, '_blank', 'noopener')
  }

  async function handleRemove(doc: DocEntry) {
    setRemovingId(doc.id)
    await removeDocument(doc.id, doc.fichier_path)
    onRemoved(doc.id)
    setRemovingId(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="docup-wrap">
      {/* Existing documents */}
      {documents.length > 0 && (
        <div className="docup-list">
          {documents.map(doc => {
            const s = statutStyle(doc.statut)
            return (
              <div key={doc.id} className="docup-item">
                <div className="docup-item-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="docup-item-body">
                  <div className="docup-item-name">{doc.nom}</div>
                  <div className="docup-item-meta">{formatSize(doc.taille_bytes)} · {formatDate(doc.created_at)}</div>
                </div>
                <div className="docup-item-actions">
                  <span className="badge-status" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                  <button
                    type="button"
                    className="btn-doc-view"
                    onClick={() => handleView(doc.fichier_path)}
                    aria-label="Voir le document"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="btn-doc-delete"
                    onClick={() => handleRemove(doc)}
                    disabled={removingId === doc.id}
                    aria-label="Supprimer"
                  >
                    {removingId === doc.id ? '…' : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`docup-zone${dragging ? ' docup-zone--drag' : ''}${uploading ? ' docup-zone--loading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        aria-label={`Déposer un document ${label}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
        {uploading ? (
          <div className="docup-zone-content">
            <div className="docup-spinner" />
            <span className="docup-zone-text">Envoi en cours…</span>
          </div>
        ) : (
          <div className="docup-zone-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="docup-zone-text">
              {documents.length > 0 ? 'Ajouter un autre document' : `Déposer ou cliquer pour ajouter`}
            </span>
            <span className="docup-zone-hint">PDF · 5 Mo max</span>
          </div>
        )}
      </div>

      {uploadError && <div className="docup-error">{uploadError}</div>}
    </div>
  )
}
