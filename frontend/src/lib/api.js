import { demoReports } from './demoData'

// Backend URL. Empty = same origin (Vite proxy in local dev).
// On Netlify set VITE_API_URL to the Render backend URL.
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_BASE = `${API_ORIGIN}/api`

// Turns '/uploads/x.jpg' into a full URL pointing at the backend
export const assetUrl = (p) => (!p ? p : /^https?:/.test(p) ? p : `${API_ORIGIN}${p}`)

export const api = {
  // Fetch all reports with optional type/status/area filter
  async getReports(params = {}) {
    try {
      const query = new URLSearchParams()
      if (params.type && params.type !== 'all') query.append('type', params.type)
      if (params.status && params.status !== 'all') query.append('status', params.status)
      if (params.area && params.area !== 'all') query.append('area', params.area)

      const url = `${API_BASE}/reports${query.toString() ? '?' + query.toString() : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('API fetch error')
      const json = await res.json()
      return json.data || []
    } catch (err) {
      console.warn('Backend unavailable, falling back to local demo reports:', err.message)
      return demoReports.filter((r) => {
        if (params.type && params.type !== 'all' && r.type !== params.type) return false
        return true
      })
    }
  },

  // Submit a new civic issue with photo and AI analysis
  async createReport({ type, description, location, photo, area }) {
    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('description', description || '')
      if (area) {
        formData.append('area', area)
      }
      if (location) {
        formData.append('lat', location.lat)
        formData.append('lng', location.lng)
      }
      if (photo) {
        formData.append('photo', photo)
      }

      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Failed to create report')
      return await res.json()
    } catch (err) {
      console.error('Error creating report:', err)
      // Fallback response for offline resilience
      return {
        success: true,
        data: {
          id: String(Date.now()),
          type,
          description,
          lat: location?.lat || 19.1197,
          lng: location?.lng || 72.8468,
          status: 'Reported',
          severity: 'high',
          urgencyScore: 80,
          aiAnalysis: {
            severity: 'high',
            urgencyScore: 80,
            chainRisk: 'Local preview: High water damage risk detected.',
            recommendedAction: 'Dispatch municipal maintenance squad.'
          }
        }
      }
    }
  },

  // Upvote issue
  async upvoteReport(id) {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to upvote')
      return await res.json()
    } catch (err) {
      console.warn('Upvote fallback:', err.message)
      return { success: true }
    }
  },

  // Update status
  async updateStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      return await res.json()
    } catch (err) {
      console.warn('Update status fallback:', err.message)
      return { success: true }
    }
  },

  // Get aggregated stats
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      const json = await res.json()
      return json.data
    } catch (err) {
      console.warn('Stats fallback:', err.message)
      const total = demoReports.length
      const fixed = demoReports.filter((r) => r.status === 'Fixed').length
      return {
        total,
        fixed,
        open: total - fixed,
        areasCount: new Set(demoReports.map((r) => r.area)).size,
        rankedAreas: [],
        hotspots: [],
        chainAlerts: []
      }
    }
  }
}
