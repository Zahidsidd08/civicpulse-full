import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Report from './pages/Report'
import MapPage from './pages/MapPage'
import Leaderboard from './pages/Leaderboard'

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrap><Home /></PageWrap>} />
            <Route path="/report" element={<PageWrap><Report /></PageWrap>} />
            <Route path="/map" element={<PageWrap><MapPage /></PageWrap>} />
            <Route path="/leaderboard" element={<PageWrap><Leaderboard /></PageWrap>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}