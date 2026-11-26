import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [stats, setStats] = useState({
    total: 15,
    fixed: 6,
    open: 9,
    rankedAreas: [],
    hotspots: [],
    chainAlerts: []
  })
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const data = await api.getStats()
      if (data) {
        setStats(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <main className="bg-slate-950 px-4 py-10 text-white min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Area Leaderboard & Priority Alerts</h1>
            <p className="mt-1 text-slate-300">
              Real-time civic resolution tracking, municipal hotspot alerts, and water chain hazard detection.
            </p>
          </div>
          <button
            onClick={loadData}
            className="self-start sm:self-auto rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition cursor-pointer flex items-center gap-2"
          >
            <span>🔄</span> Refresh Stats
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
            <div className="text-3xl font-bold text-teal-400">{stats.total}</div>
            <div className="text-sm text-slate-300 mt-1">Total Reports</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
            <div className="text-3xl font-bold text-emerald-400">{stats.fixed}</div>
            <div className="text-sm text-slate-300 mt-1">Issues Fixed</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
            <div className="text-3xl font-bold text-amber-400">{stats.open}</div>
            <div className="text-sm text-slate-300 mt-1">In Progress / Open</div>
          </div>
        </div>

        {/* Ranking List */}
        <div className="mt-10">
          <h2 className="text-xl font-bold">🏆 Locality Resolution Rankings</h2>
          <div className="mt-4 space-y-3">
            {stats.rankedAreas.map((a, i) => {
              const pct = a.percentFixed ?? (a.total > 0 ? Math.round((a.fixed / a.total) * 100) : 0)
              return (
                <div key={a.area} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center text-xl font-bold">{medals[i] || i + 1}</span>
                      <span className="font-semibold text-lg">{a.area}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-teal-300">
                        {a.fixed} / {a.total} resolved
                      </span>
                      <span className="text-xs text-slate-400 ml-2">({pct}%)</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hotspots Section */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold">Active Hotspots</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Zones with 3 or more open reports requiring urgent municipal intervention.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(!stats.hotspots || stats.hotspots.length === 0) && (
              <p className="text-slate-400 bg-white/5 p-4 rounded-xl border border-white/10">
                No critical hotspots right now. All zones under threshold!
              </p>
            )}
            {stats.hotspots && stats.hotspots.map((a) => (
              <div key={a.area} className="rounded-2xl border border-red-500/40 bg-red-950/20 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-red-200">{a.area}</div>
                  <span className="bg-red-500/20 text-red-300 text-xs px-2.5 py-1 rounded-full border border-red-500/30 font-semibold">
                    Urgent
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  <strong className="text-red-400">{a.open} open civic reports</strong> pending resolution.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Water Chain Alert */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <h2 className="text-2xl font-bold">Water Damage Chain Alerts</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Detected blocked drainage and potholes open in the exact same locality. Water pooling will accelerate asphalt damage.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(!stats.chainAlerts || stats.chainAlerts.length === 0) && (
              <p className="text-slate-400 bg-white/5 p-4 rounded-xl border border-white/10">
                No active water-chain compound damage risks detected.
              </p>
            )}
            {stats.chainAlerts && stats.chainAlerts.map((a) => (
              <div key={a.area} className="rounded-2xl border border-sky-400/30 bg-sky-950/30 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-sky-200">{a.area} Zone</div>
                  <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-1 rounded-full border border-sky-500/30 font-semibold">
                    Compound Risk
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  Both <strong>Blocked Drain</strong> and <strong>Pothole</strong> open. AI priority: Flush drain first to prevent newly patched asphalt from breaking.
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
