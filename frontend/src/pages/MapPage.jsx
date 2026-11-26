import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api, assetUrl } from '../lib/api'

const colors = { pothole: '#f97316', drainage: '#3b82f6', leakage: '#14b8a6' }
const labels = { pothole: 'Pothole', drainage: 'Blocked Drain', leakage: 'Water Leakage' }
const typeIcons = { pothole: '🕳️', drainage: '🌊', leakage: '💧' }

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom, { duration: 1.2 })
    }
  }, [center, zoom, map])
  return null
}

export default function MapPage() {
  const [filter, setFilter] = useState('all')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapView, setMapView] = useState({ center: [12.96, 77.59], zoom: 12 })
  const [myLocMsg, setMyLocMsg] = useState('')

  async function loadReports() {
    setLoading(true)
    try {
      const data = await api.getReports({ type: filter })
      setReports(data)

      // If we have reports, center on the most recent report
      if (data && data.length > 0) {
        const firstWithCoords = data.find(r => r.lat && r.lng)
        if (firstWithCoords) {
          setMapView({
            center: [Number(firstWithCoords.lat), Number(firstWithCoords.lng)],
            zoom: 12
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [filter])

  // Extract unique cities dynamically from database records
  const dynamicCities = ['All Cities', ...Array.from(new Set(
    reports.map(r => {
      const parts = (r.area || '').split(',')
      return parts[parts.length - 1].trim()
    })
  )).filter(Boolean)]

  // Filter reports by issue type and dynamic city
  const filteredReports = reports.filter((r) => {
    if (selectedCity !== 'All Cities') {
      const parts = (r.area || '').split(',')
      const city = parts[parts.length - 1].trim()
      if (city !== selectedCity) return false
    }
    return true
  })

  function handleCitySelect(city) {
    setSelectedCity(city)
    if (city === 'All Cities') {
      // Zoom out to view all across India
      setMapView({ center: [20.5937, 78.9629], zoom: 5 })
    } else {
      // Find the first report from this city and fly to it
      const match = reports.find(r => (r.area || '').includes(city) && r.lat && r.lng)
      if (match) {
        setMapView({ center: [Number(match.lat), Number(match.lng)], zoom: 13 })
      }
    }
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setMyLocMsg('Geolocation is not supported by your browser.')
      return
    }
    setMyLocMsg('Locating your GPS...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setMapView({ center: [lat, lng], zoom: 14 })
        setMyLocMsg('Centered on your live location!')
        setTimeout(() => setMyLocMsg(''), 4000)
      },
      () => {
        setMyLocMsg('Could not fetch GPS. Please allow location permissions.')
        setTimeout(() => setMyLocMsg(''), 4000)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  async function handleUpvote(id, e) {
    e.stopPropagation()
    try {
      await api.upvoteReport(id)
      setReports((prev) =>
        prev.map((r) => (String(r.id) === String(id) ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="bg-slate-950 px-4 py-8 text-white min-h-screen">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dynamic Civic Issue Map</h1>
            <p className="mt-1 text-slate-300">
              Live nationwide civic map updating automatically from live GPS reports across any Indian city.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={locateMe}
              className="rounded-xl border border-teal-400/40 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <span>🎯</span> My Live Location
            </button>
            <button
              onClick={loadReports}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition flex items-center gap-2 cursor-pointer"
            >
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        {myLocMsg && (
          <div className="mt-2 text-xs text-teal-300 bg-teal-950/40 border border-teal-500/30 px-3 py-1.5 rounded-lg inline-block">
            {myLocMsg}
          </div>
        )}

        {/* Dynamic City Filter Buttons (Loaded from Database) */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <span className="text-xs font-semibold text-slate-400 mr-1">Active Cities in Database:</span>
          {dynamicCities.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCity === city
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>📍</span> {city}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            {loading ? 'Updating...' : `${filteredReports.length} issues showing`}
          </span>
        </div>

        {/* Issue Type Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['all', 'pothole', 'drainage', 'leakage'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                filter === f
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'All Types' : `${typeIcons[f]} ${labels[f]}`}
            </button>
          ))}
        </div>

        {/* Leaflet Map */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative">
          <MapContainer center={mapView.center} zoom={mapView.zoom} style={{ height: '70vh', width: '100%' }}>
            <MapController center={mapView.center} zoom={mapView.zoom} />
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map((r) => {
              const lat = Number(r.lat)
              const lng = Number(r.lng)
              if (isNaN(lat) || isNaN(lng)) return null

              return (
                <CircleMarker
                  key={r.id}
                  center={[lat, lng]}
                  radius={12}
                  pathOptions={{
                    color: colors[r.type] || '#14b8a6',
                    fillColor: colors[r.type] || '#14b8a6',
                    fillOpacity: 0.85,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-1 text-slate-900 max-w-xs font-sans">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                        <strong className="text-sm font-bold text-slate-900">
                          {typeIcons[r.type]} {labels[r.type] || r.type}
                        </strong>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                          {r.area || 'City Area'}
                        </span>
                      </div>

                      {r.description && (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                          {r.description}
                        </p>
                      )}

                      {r.photoUrl && (
                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                          <img
                            src={assetUrl(r.photoUrl)}
                            alt="Issue photo"
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
                        <span>
                          Status: <strong className={r.status === 'Fixed' ? 'text-emerald-600' : 'text-amber-600'}>{r.status}</strong>
                        </span>
                        {r.severity && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {r.severity}
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={(e) => handleUpvote(r.id, e)}
                          className="w-full rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>👍 Upvote Priority</span>
                          <span className="rounded bg-teal-800/40 px-1.5 py-0.2 text-[11px]">
                            {r.upvotes || 1}
                          </span>
                        </button>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
          <div className="flex flex-wrap gap-4">
            {Object.keys(colors).map((k) => (
              <span key={k} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: colors[k] }} />
                {labels[k]}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            Click any pin on the map to view issue details, live city location, and upvote.
          </div>
        </div>
      </div>
    </main>
  )
}
