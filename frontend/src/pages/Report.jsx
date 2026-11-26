import { useState } from 'react'
import { api } from '../lib/api'

const types = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'drainage', label: 'Blocked Drain', icon: '🌊' },
  { value: 'leakage', label: 'Water Leakage', icon: '💧' },
]

export default function Report() {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [type, setType] = useState('pothole')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(null)
  const [locMsg, setLocMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedReport, setSubmittedReport] = useState(null)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function reverseGeocode(lat, lng) {
    try {
      setLocMsg('Detecting your city and neighborhood...')
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'Accept': 'application/json' }
      })
      const data = await res.json()
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district || data.address.state || 'Local Area'
        const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || ''
        const resolved = suburb ? `${suburb}, ${city}` : city
        setArea(resolved)
        setLocMsg(`📍 Detected: ${resolved}`)
        return
      }
    } catch (e) {
      console.warn('Geocode error:', e)
    }
    setLocMsg('📍 GPS Location captured.')
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setLocMsg('Location is not supported on this device')
      return
    }
    setLocMsg('Acquiring live GPS coordinates...')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocation({ lat, lng })
        await reverseGeocode(lat, lng)
      },
      () => {
        // Fallback default coordinates if GPS permission is denied
        setLocation({ lat: 12.9716, lng: 77.5946 })
        setArea('Bengaluru')
        setLocMsg('GPS permission denied. You can manually enter your city/locality below.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!location) {
      // Auto-assign default location if user didn't click
      setLocation({ lat: 12.9716, lng: 77.5946 })
    }

    setIsSubmitting(true)
    try {
      const res = await api.createReport({
        type,
        area: area.trim() || 'Local Area',
        description,
        location: location || { lat: 12.9716, lng: 77.5946 },
        photo
      })

      if (res.success && res.data) {
        setSubmittedReport(res.data)
      } else {
        alert('Could not submit report. Please try again.')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function reset() {
    setPhoto(null)
    setPreview('')
    setType('pothole')
    setArea('Bangalore')
    setDescription('')
    setLocation(null)
    setSubmittedReport(null)
  }

  if (submittedReport) {
    const ai = submittedReport.aiAnalysis || {
      severity: submittedReport.severity || 'high',
      urgencyScore: submittedReport.urgencyScore || 75,
      chainRisk: 'Assessing road risk...',
      recommendedAction: 'Assigned to municipal response team.'
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
        <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold">Report Submitted Successfully!</h1>
          <p className="mt-2 text-slate-300">
            Your report is live on the city map and flagged to municipal authorities.
          </p>

          {/* AI Civic Analysis Card */}
          <div className="mt-6 rounded-xl border border-teal-500/30 bg-teal-950/40 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <span>🤖</span> AI Civic Assessment
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                ai.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                ai.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              }`}>
                {ai.severity} Severity
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-teal-300">{ai.urgencyScore}</div>
              <div className="text-xs text-slate-400">/ 100 Municipal Urgency Score</div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
              <div>
                <strong className="text-white">Water Chain Impact:</strong> {ai.chainRisk}
              </div>
              <div>
                <strong className="text-white">Recommended Action:</strong> {ai.recommendedAction}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href="/map"
              className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 hover:bg-teal-400 transition"
            >
              View on Live Map
            </a>
            <button
              onClick={reset}
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Report an Issue</h1>
        <p className="mt-2 text-slate-300">
          Capture potholes, blocked drainage, or water leakage to trigger instant AI evaluation and city repairs.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Photo */}
          <div>
            <label className="mb-2 block text-sm font-semibold">1. Add a photo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6 text-center hover:border-teal-400 transition">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 rounded-xl object-cover" />
              ) : (
                <>
                  <span className="text-4xl">📸</span>
                  <span className="mt-2 text-slate-300">Tap to take or upload a photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold">2. Issue type</label>
            <div className="grid grid-cols-3 gap-3">
              {types.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-xl border p-3 text-center text-sm font-medium transition ${
                    type === t.value
                      ? 'border-teal-400 bg-teal-400/10 text-teal-300 ring-2 ring-teal-500/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="text-2xl">{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-semibold">3. Location</label>
            <button
              type="button"
              onClick={getLocation}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <span>📍</span> {location ? 'Update Location' : 'Use My Current Location'}
            </button>
            {location && (
              <p className="mt-2 text-sm text-teal-300 font-medium">
                ✓ GPS Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
            {locMsg && <p className="mt-2 text-sm text-slate-400">{locMsg}</p>}
          </div>

          {/* Area / City */}
          <div>
            <label className="mb-2 block text-sm font-semibold">4. Locality / City</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Bangalore, Koramangala, Indiranagar"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold">5. Description (helps AI assess severity)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Deep pothole near station road causing vehicles to skid, water pipeline burst"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>AI Analyzing & Submitting Report...</span>
              </>
            ) : (
              'Submit Report & Run AI Check'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
