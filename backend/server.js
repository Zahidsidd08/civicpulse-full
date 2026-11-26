import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import { isSupabaseConfigured } from './config/supabase.js'
import reportsRouter from './routes/reports.js'
import statsRouter from './routes/stats.js'
import aiRouter from './routes/ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: '*', // Allow all frontends (Vite on 5173, etc.)
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'Civic Pulse Backend API',
    version: '1.0.0',
    supabaseConnected: isSupabaseConfigured,
    timestamp: new Date().toISOString()
  })
})

// Mount API routes
app.use('/api/reports', reportsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/ai', aiRouter)

// Root fallback
app.get('/', (req, res) => {
  res.send('Civic Pulse API is running. Access endpoints via /api/reports, /api/stats, /api/ai/analyze')
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`\n=================================================`)
  console.log(`🚀 Civic Pulse Backend Server Running!`)
  console.log(`📍 Port: http://localhost:${PORT}`)
  console.log(`🔗 API Base: http://localhost:${PORT}/api`)
  console.log(`⚡ Supabase: ${isSupabaseConfigured ? 'Connected (Live)' : 'Local Fallback Store (Ready for Supabase keys)'}`)
  console.log(`=================================================\n`)
})
