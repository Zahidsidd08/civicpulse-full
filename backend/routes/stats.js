import express from 'express'
import { ReportsStore } from '../models/store.js'

const router = express.Router()

// GET /api/stats - Dynamic aggregated civic infrastructure statistics
router.get('/', async (req, res) => {
  try {
    const stats = await ReportsStore.getStats()
    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
