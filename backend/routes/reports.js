import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { ReportsStore } from '../models/store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg'
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6)
    cb(null, `issue-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are permitted'), false)
    }
  }
})

// GET /api/reports - Fetch all reports with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, status, area } = req.query
    const reports = await ReportsStore.getAll({ type, status, area })
    res.json({ success: true, count: reports.length, data: reports })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/reports/:id - Fetch single report
router.get('/:id', async (req, res) => {
  try {
    const report = await ReportsStore.getById(req.params.id)
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }
    res.json({ success: true, data: report })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/reports - Create new report with optional photo upload
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { type, description, lat, lng, area, status } = req.body

    if (!type) {
      return res.status(400).json({ success: false, message: 'Issue type (pothole, drainage, leakage) is required.' })
    }

    let photoUrl = null
    if (req.file) {
      // Build public URL to access the uploaded photo
      photoUrl = `/uploads/${req.file.filename}`
    }

    const created = await ReportsStore.create({
      type,
      description: description || '',
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      area: area || null,
      photoUrl,
      status: status || 'Reported'
    })

    res.status(201).json({
      success: true,
      message: 'Issue report submitted and analyzed successfully!',
      data: created
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PATCH /api/reports/:id/status - Update issue resolution status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['Reported', 'In progress', 'Fixed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const updated = await ReportsStore.updateStatus(req.params.id, status)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    res.json({ success: true, message: `Status updated to ${status}`, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/reports/:id/upvote - Upvote issue priority
router.post('/:id/upvote', async (req, res) => {
  try {
    const updated = await ReportsStore.upvote(req.params.id)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    res.json({ success: true, message: 'Upvoted successfully', upvotes: updated.upvotes, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
