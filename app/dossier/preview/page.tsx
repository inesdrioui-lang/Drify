'use client';

import { useState } from 'react';

export default function DossierPreviewPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedReference, setSavedReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSavedReference(null);
    try {
      const res = await fetch('/api/dossier/generate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Erreur de génération');
      }
      const blob = await res.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de générer le dossier. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/dossier/save', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Erreur de sauvegarde');
      }
      const { url, reference } = await res.json();
      setSavedReference(reference);
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `dossier-drify-${reference}.pdf`;
        a.click();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de valider le dossier. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4" style={{ background: '#F7F2EA' }}>
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#3B2314' }}
          >
            Mon dossier de location
          </h1>
          <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
            Prévisualisez votre dossier, puis validez-le pour le sauvegarder et le télécharger.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading || saving}
            className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#6B3F26', color: '#fff' }}
            onMouseEnter={(e) => !(loading || saving) && ((e.target as HTMLElement).style.background = '#3B2314')}
            onMouseLeave={(e) => !(loading || saving) && ((e.target as HTMLElement).style.background = '#6B3F26')}
          >
            {loading ? 'Génération en cours…' : pdfUrl ? 'Actualiser la prévisualisation' : 'Prévisualiser mon dossier'}
          </button>

          {pdfUrl && (
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#2E6644', color: '#fff' }}
              onMouseEnter={(e) => !(loading || saving) && ((e.target as HTMLElement).style.background = '#1E4A30')}
              onMouseLeave={(e) => !(loading || saving) && ((e.target as HTMLElement).style.background = '#2E6644')}
            >
              {saving ? 'Sauvegarde en cours…' : 'Valider et télécharger'}
            </button>
          )}
        </div>

        {/* Confirmation sauvegarde */}
        {savedReference && (
          <div
            className="px-4 py-3 rounded-lg text-sm mb-4"
            style={{ background: '#F0F7F3', border: '1px solid #A8D5B5', color: '#2E6644' }}
          >
            ✓ Dossier validé et sauvegardé — réf. <strong>{savedReference}</strong>. Le téléchargement a démarré.
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm mb-4"
            style={{ background: '#FDF2F2', border: '1px solid #F5C6CB', color: '#9B3A2A' }}
          >
            {error}
          </div>
        )}

        {/* Prévisualisation */}
        {pdfUrl ? (
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{ boxShadow: '0 8px 40px rgba(59,35,20,0.15)', border: '1px solid #D4B896' }}
          >
            <iframe
              src={pdfUrl}
              className="w-full"
              style={{ height: '80vh' }}
              title="Prévisualisation du dossier"
            />
          </div>
        ) : (
          <div
            className="w-full rounded-xl flex flex-col items-center justify-center text-center py-20 gap-4"
            style={{ border: '2px dashed #D4B896', background: '#EDE0CF' }}
          >
            <div style={{ fontSize: '3rem', opacity: 0.4 }}>📋</div>
            <p style={{ color: '#6B3F26', fontWeight: 600 }}>Votre dossier apparaîtra ici</p>
            <p style={{ color: '#4A4A4A', fontSize: '0.875rem', maxWidth: '24rem' }}>
              Cliquez sur &ldquo;Prévisualiser mon dossier&rdquo; pour générer un aperçu.
              Validez ensuite pour sauvegarder et télécharger la version définitive.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
