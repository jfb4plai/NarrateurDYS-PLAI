'use client'
import { useRef, useState } from 'react'

const MAX_CHARS = 3000

const LANGUAGES = [
  { code: 'fr',    label: 'Français' },
  { code: 'fr_BE', label: 'Français (Belgique)' },
  { code: 'nl',    label: 'Flamand (Belgique)' },
  { code: 'nl_NL', label: 'Néerlandais (Pays-Bas)' },
  { code: 'de',    label: 'Allemand' },
  { code: 'en',    label: 'Anglais (UK)' },
  { code: 'es',    label: 'Espagnol' },
  { code: 'it',    label: 'Italien' },
]

const EXAMPLES = {
  fr: `La photosynthèse est le processus par lequel les plantes fabriquent leur nourriture à partir de la lumière du soleil.

Les feuilles captent la lumière et la transforment en énergie chimique. Cette énergie est stockée sous forme de glucose.

Le dioxyde de carbone est absorbé par les stomates. L'eau est puisée dans le sol par les racines.`,
  nl: `Fotosynthese is het proces waarbij planten voedsel maken met behulp van zonlicht.

De bladeren vangen licht op en zetten dit om in chemische energie. Deze energie wordt opgeslagen als glucose.

Koolstofdioxide wordt opgenomen via de huidmondjes. Water wordt opgenomen uit de grond via de wortels.`,
}

export default function Home() {
  const [text, setText] = useState('')
  const [lang, setLang] = useState('fr')
  const [speed, setSpeed] = useState(0.9)
  const [silenceMs, setSilenceMs] = useState(600)
  const [loading, setLoading] = useState(false)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const remaining = MAX_CHARS - text.length
  const canGenerate = text.trim().length > 0 && text.length <= MAX_CHARS && !loading

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setAudioSrc(null)
    setDuration(null)
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, silenceMs }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (data.audio_data) {
        const src = `data:audio/mpeg;base64,${data.audio_data}`
        setAudioSrc(src)
        if (data.duration_seconds) setDuration(data.duration_seconds)
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const applySpeed = (v: number) => {
    setSpeed(v)
    if (audioRef.current) audioRef.current.playbackRate = v
  }

  const loadExample = () => {
    const ex = EXAMPLES[lang as keyof typeof EXAMPLES] ?? EXAMPLES['fr']
    setText(ex)
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.round(s % 60)
    return m > 0 ? `${m} min ${sec} s` : `${sec} s`
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-jfb-noir mb-1">Narration DYS</h1>
        <p className="text-sm text-jfb-gris">
          Colle n&apos;importe quel texte — consigne, extrait de manuel, article — et génère un audio adapté,
          lisible à vitesse modulable. Conçu pour les élèves dyslexiques.
        </p>
      </div>

      {/* Step 1 — Language */}
      <section className="mb-5">
        <label className="block text-xs font-bold text-jfb-gris uppercase tracking-wide mb-2">
          Langue du texte
        </label>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="w-full border border-jfb-bordure px-3 py-2 text-sm bg-white text-jfb-noir focus:outline-none focus:ring-2 focus:ring-teal"
          style={{ borderRadius: '2px' }}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </section>

      {/* Step 2 — Text */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-jfb-gris uppercase tracking-wide">
            Texte à lire
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={loadExample}
              className="text-xs text-teal underline hover:text-jfb-noir"
            >
              Charger un exemple
            </button>
            <span className={`text-xs ${remaining < 200 ? 'text-red-500' : 'text-jfb-gris-cl'}`}>
              {remaining} car. restants
            </span>
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Collez ici le texte à lire à voix haute…&#10;&#10;Séparez vos paragraphes par une ligne vide pour des pauses naturelles."
          rows={10}
          maxLength={MAX_CHARS}
          className="w-full border border-jfb-bordure px-3 py-2 text-sm text-jfb-noir bg-white focus:outline-none focus:ring-2 focus:ring-teal resize-y leading-relaxed"
          style={{ borderRadius: '2px', fontFamily: 'inherit' }}
        />
        {text.length > MAX_CHARS && (
          <p className="mt-1 text-xs text-red-600">Texte trop long (max {MAX_CHARS} caractères).</p>
        )}
      </section>

      {/* Step 3 — Options */}
      <section className="mb-6 border border-jfb-bordure bg-white p-4" style={{ borderRadius: '2px' }}>
        <p className="text-xs font-bold text-jfb-gris uppercase tracking-wide mb-4">Options de lecture</p>

        {/* Pause between paragraphs */}
        <div className="mb-4">
          <label className="text-xs text-jfb-gris mb-2 block">Pauses entre paragraphes</label>
          <div className="flex gap-2">
            {[
              { label: 'Courtes (300 ms)', value: 300 },
              { label: 'Standard (600 ms)', value: 600 },
              { label: 'Longues (1 s)', value: 1000 },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSilenceMs(opt.value)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  silenceMs === opt.value
                    ? 'bg-jfb-noir text-white border-jfb-noir'
                    : 'bg-white text-jfb-noir border-jfb-bordure hover:bg-jfb-beige'
                }`}
                style={{ borderRadius: '2px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed (post-generation) */}
        <div>
          <label className="text-xs text-jfb-gris mb-2 block">
            Vitesse de lecture — {speed.toFixed(1)}×
            <span className="text-jfb-gris-cl ml-1">(modifiable pendant et après la lecture)</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={speed}
            onChange={e => applySpeed(Number(e.target.value))}
            className="w-full accent-teal"
          />
          <div className="flex justify-between text-xs text-jfb-gris-cl mt-1">
            <span>0.5× (très lent)</span>
            <span>0.9× (DYS conseillé)</span>
            <span>1.5×</span>
          </div>
        </div>
      </section>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full py-3 text-sm font-bold bg-teal text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-90 transition-opacity"
        style={{ borderRadius: '2px' }}
      >
        {loading ? 'Génération en cours…' : 'Générer l\'audio'}
      </button>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2" style={{ borderRadius: '2px' }}>
          {error}
        </div>
      )}

      {/* Audio result */}
      {audioSrc && (
        <div className="mt-6 border border-jfb-bordure bg-white p-5" style={{ borderRadius: '2px', borderLeft: '3px solid #0a9370' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-jfb-noir">Audio prêt</p>
            {duration && (
              <span className="text-xs text-jfb-gris-cl">{formatDuration(duration)}</span>
            )}
          </div>

          <audio
            ref={audioRef}
            src={audioSrc}
            controls
            onLoadedMetadata={() => {
              if (audioRef.current) audioRef.current.playbackRate = speed
            }}
            className="w-full mb-3"
          />

          {/* Speed reminder */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-jfb-gris whitespace-nowrap">Vitesse :</label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={speed}
              onChange={e => applySpeed(Number(e.target.value))}
              className="flex-1 accent-teal"
            />
            <span className="text-xs text-jfb-gris w-8 text-right">{speed.toFixed(1)}×</span>
          </div>

          <a
            href={audioSrc}
            download="narration-dys.mp3"
            className="text-xs border border-jfb-bordure px-3 py-1.5 hover:bg-jfb-beige text-jfb-noir"
            style={{ borderRadius: '2px' }}
          >
            Télécharger le MP3
          </a>
        </div>
      )}

      {/* Scientific anchor */}
      <div className="mt-10 border border-jfb-bordure bg-jfb-beige p-5" style={{ borderRadius: '2px', borderLeft: '3px solid #0a9370' }}>
        <h2 className="text-sm font-bold text-jfb-noir mb-2">Ancrage scientifique</h2>
        <p className="text-xs text-jfb-gris mb-3">
          Sources vérifiées dans le corpus RISS (522 627 articles francophones) :
        </p>
        <ul className="text-xs text-jfb-gris space-y-1.5">
          <li>— Daspet V. (2016). <em>Lire et écrire avec des outils informatiques.</em> Sciences de l&apos;éducation. [tel-01449610]
            — lecture assistée TTS significativement plus rapide que lecture non-assistée chez ados DYS.</li>
          <li>— Leclère M. (2020). <em>Les innovations numériques pour les apprentissages des collégiens dyslexiques.</em> [dumas-03264433]
            — la synthèse vocale pallie les difficultés de lecture en déchargeant le décodage.</li>
          <li>— Vandenbroucke G. (2016). <em>Améliorer la compréhension de textes narratifs chez les élèves dyslexiques de CM2.</em> [tel-01416775]
            — la compréhension orale est un prédicteur clé de la compréhension en lecture.</li>
          <li>— Fliti A. & Avarello V. (2025). <em>Modèles Génératifs et Accès au Savoir pour les Personnes en Situation de Handicap.</em> [hal-05450529]
            — TTS ultra-réaliste documenté comme aide à la lecture pour la dyslexie et les troubles DYS.</li>
        </ul>
      </div>
    </main>
  )
}
