import express from 'express'
import { analyzeCivicIssue } from '../services/aiService.js'

const router = express.Router()

// POST /api/ai/analyze - Standalone issue analysis & severity recommendation
router.post('/analyze', (req, res) => {
  try {
    const { type, description, location } = req.body
    if (!type) {
      return res.status(400).json({ success: false, message: 'Type is required for AI analysis' })
    }

    const analysis = analyzeCivicIssue({ type, description, location })
    res.json({ success: true, data: analysis })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
