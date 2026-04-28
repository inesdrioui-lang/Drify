'use client';

import { useState } from 'react';

export default function DossierPreviewPage() {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
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
            Prévisualisez et téléchargez votre dossier complet au format PDF.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#6B3F26', color: '#fff' }}
            onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.background = '#3B2314')}
            onMouseLeave={(e) => !loading && ((e.target as HTMLElement).style.background = '#6B3F26')}
          >
            {loading ? 'Génération en cours…' : pdfUrl ? 'Regénérer le PDF' : 'Générer mon dossier PDF'}
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download="mon-dossier-drify.pdf"
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              style={{ border: '1px solid #6B3F26', color: '#6B3F26', background: 'transparent' }}
            >
              Télécharger le PDF
            </a>
          )}
        </div>

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
              Cliquez sur &ldquo;Générer mon dossier PDF&rdquo; pour créer votre dossier complet
              avec tous vos documents vérifiés.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
