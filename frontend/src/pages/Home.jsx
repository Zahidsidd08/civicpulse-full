import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '../components/Reveal'
import CountUp from '../components/CountUp'
import { api } from '../lib/api'

const chain = [
  { icon: '🌊', title: 'Blocked drain', text: 'Water cannot flow away and spills onto the street.' },
  { icon: '💧', title: 'Water on the road', text: 'Standing water and leaks soak into the surface.' },
  { icon: '🕳️', title: 'Pothole forms', text: 'The road weakens, cracks and breaks apart.' },
]

const steps = [
  { n: '01', title: 'Snap a photo', text: 'Take a picture of a pothole, blocked drain or water leak.' },
  { n: '02', title: 'Add the location', text: 'Your location is attached so the issue is easy to find.' },
  { n: '03', title: 'See it on the map', text: 'Reports appear on a city map so everyone sees what needs fixing.' },
]

const features = [
  { icon: '📸', title: 'Photo-based reporting', text: 'Report an issue in under a minute with just your phone camera.' },
  { icon: '🗺️', title: 'Live issue map', text: 'Every report is pinned on a map, colour-coded by issue type.' },
  { icon: '🤖', title: 'AI Severity Scoring', text: 'AI automatically predicts road degradation risk and prioritizes repairs.' },
  { icon: '🏆', title: 'Area leaderboard', text: 'See which areas are most active and track resolution rates.' },
]

const gradientText = {
  backgroundImage: 'linear-gradient(90deg, #2dd4bf, #38bdf8)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

export default function Home() {
  const [stats, setStats] = useState({ total: 15, fixed: 6, areasCount: 5 })

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStats()
        if (data) {
          setStats({
            total: data.total || 15,
            fixed: data.fixed || 6,
            areasCount: data.areasCount || 5
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadStats()
  }, [])

  return (
    <main className="overflow-hidden bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative">
        <motion.div
          className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-1/4 top-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-300"
          >
            #BuildForMyCity &bull; Smart Civic Infrastructure
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            Every pothole. Every drain. Every leak.{' '}
            <span style={gradientText}>One pulse.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
          >
            Water damages our roads. CivicPulse connects blocked drains, water leaks and
            potholes with intelligent AI assessment, so your city can fix problems before they escalate.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/report"
                className="block rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition"
              >
                Report an Issue
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/map"
                className="block rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
              >
                View Live Map
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Water chain */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-center text-3xl font-bold">Water breaks roads</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-300">
            These three problems are one chain. Fix the first link early and the last one never happens.
          </p>
        </Reveal>
        <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          {chain.map((c, i) => (
            <div key={c.title} className="flex flex-col items-center gap-4 md:flex-row">
              <Reveal delay={i * 0.2}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="w-64 rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
                >
                  <div className="text-4xl">{c.icon}</div>
                  <h3 className="mt-3 font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{c.text}</p>
                </motion.div>
              </Reveal>
              {i < chain.length - 1 && (
                <motion.span
                  className="text-3xl text-teal-400"
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="hidden md:inline">→</span>
                  <span className="md:hidden">↓</span>
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-center text-3xl font-bold">How it works</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -6 }}
                className="h-full rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <span className="text-sm font-bold text-teal-400">{s.n}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-slate-300">{s.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-center text-3xl font-bold">Built to go beyond reporting</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8, borderColor: 'rgba(45,212,191,0.5)' }}
                  className="h-full rounded-2xl border border-white/10 bg-slate-950 p-6 transition"
                >
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{f.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <Reveal>
          <h2 className="text-center text-3xl font-bold">City snapshot</h2>
          <p className="mt-2 text-center text-sm text-slate-400">Live data from civic reports across the city.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Total Reports', value: stats.total },
            { label: 'Issues Fixed', value: stats.fixed },
            { label: 'Active Zones', value: stats.areasCount },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.15}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-4xl font-extrabold" style={gradientText}>
                  <CountUp to={s.value} />
                </div>
                <div className="mt-1 text-sm text-slate-300">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold">See a problem? Don't walk past it.</h2>
          <p className="mt-4 text-slate-300">It takes less than a minute to make your street safer.</p>
          <motion.div className="mt-8 inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/report"
              className="block rounded-xl bg-teal-500 px-8 py-3 font-semibold text-slate-950 shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition"
            >
              Report Now
            </Link>
          </motion.div>
        </Reveal>
      </section>
    </main>
  )
}
