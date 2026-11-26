import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { analyzeCivicIssue } from '../services/aiService.js'

// Initial seed data based on the frontend's demo reports
const initialReports = [
  { id: '1', type: 'pothole', area: 'Andheri', lat: 19.1197, lng: 72.8468, status: 'Reported', description: 'Large pothole near metro pillar 42, vehicles swerving dangerously', upvotes: 14, photoUrl: null, severity: 'high', urgencyScore: 78, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', type: 'drainage', area: 'Andheri', lat: 19.1136, lng: 72.8697, status: 'Reported', description: 'Clogged storm drain with plastic waste, stagnant water spilling on road', upvotes: 9, photoUrl: null, severity: 'high', urgencyScore: 72, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '3', type: 'leakage', area: 'Andheri', lat: 19.1075, lng: 72.8263, status: 'In progress', description: 'Continuous clean water pipe leakage soaking asphalt footpath', upvotes: 19, photoUrl: null, severity: 'critical', urgencyScore: 88, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '4', type: 'pothole', area: 'Andheri', lat: 19.1180, lng: 72.8550, status: 'Fixed', description: 'Road crack and crater repaired by municipal road team', upvotes: 22, photoUrl: null, severity: 'medium', urgencyScore: 50, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '5', type: 'pothole', area: 'Bandra', lat: 19.0596, lng: 72.8295, status: 'Fixed', description: 'Pothole on Linking Road filled with asphalt mix', upvotes: 31, photoUrl: null, severity: 'medium', urgencyScore: 45, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: '6', type: 'leakage', area: 'Bandra', lat: 19.0544, lng: 72.8402, status: 'Fixed', description: 'Water main joint tightened and road repaved', upvotes: 15, photoUrl: null, severity: 'high', urgencyScore: 68, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '7', type: 'pothole', area: 'Bandra', lat: 19.0650, lng: 72.8350, status: 'Reported', description: 'Deep cavity near Turner Road turn, accident hazard for bikes', upvotes: 8, photoUrl: null, severity: 'high', urgencyScore: 76, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '8', type: 'drainage', area: 'Dadar', lat: 19.0178, lng: 72.8478, status: 'Fixed', description: 'Dadar TT circle storm drain desilted', upvotes: 40, photoUrl: null, severity: 'medium', urgencyScore: 55, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: '9', type: 'leakage', area: 'Dadar', lat: 19.0220, lng: 72.8430, status: 'Reported', description: 'Drinking water pipeline oozing water near flower market', upvotes: 11, photoUrl: null, severity: 'medium', urgencyScore: 58, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '10', type: 'pothole', area: 'Dadar', lat: 19.0130, lng: 72.8420, status: 'In progress', description: 'Road depression being surfaced', upvotes: 6, photoUrl: null, severity: 'medium', urgencyScore: 48, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '11', type: 'drainage', area: 'Kurla', lat: 19.0726, lng: 72.8845, status: 'Reported', description: 'Overflowing open drain near station west side', upvotes: 27, photoUrl: null, severity: 'critical', urgencyScore: 92, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '12', type: 'pothole', area: 'Kurla', lat: 19.0690, lng: 72.8790, status: 'Reported', description: 'Series of 4 potholes caused by monsoon water accumulation', upvotes: 25, photoUrl: null, severity: 'critical', urgencyScore: 85, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '13', type: 'drainage', area: 'Kurla', lat: 19.0760, lng: 72.8900, status: 'In progress', description: 'Culvert cleaning work underway', upvotes: 13, photoUrl: null, severity: 'high', urgencyScore: 70, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '14', type: 'pothole', area: 'Borivali', lat: 19.2307, lng: 72.8567, status: 'Fixed', description: 'Pothole near SV road junction repaired', upvotes: 18, photoUrl: null, severity: 'low', urgencyScore: 35, createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
  { id: '15', type: 'drainage', area: 'Borivali', lat: 19.2250, lng: 72.8600, status: 'Fixed', description: 'Drainage line unclogged before monsoon', upvotes: 21, photoUrl: null, severity: 'medium', urgencyScore: 42, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
]

// In-memory data store
let reportsStore = [...initialReports]

// Dynamic reverse geocoding via OpenStreetMap for any coordinate across India / World
export async function reverseGeocodeCoordinates(lat, lng) {
  if (!lat || !lng) return 'General Area'
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
      headers: { 'User-Agent': 'CivicPulse-App/1.0' },
      signal: AbortSignal.timeout(3500)
    })
    const data = await res.json()
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district || data.address.state || 'Local Area'
      const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || ''
      return suburb ? `${suburb}, ${city}` : city
    }
  } catch (err) {
    console.warn('Reverse geocode fallback:', err.message)
  }
  return 'Geo-tagged Location'
}

export function inferAreaFromCoordinates(lat, lng) {
  if (!lat || !lng) return 'General Area'
  return 'Geo-tagged Location'
}

export const ReportsStore = {
  async getAll({ type, status, area } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('reports').select('*').order('created_at', { ascending: false })
        if (type && type !== 'all') query = query.eq('type', type)
        if (status && status !== 'all') query = query.eq('status', status)
        if (area && area !== 'all') query = query.eq('area', area)

        const { data, error } = await query
        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            ...d,
            photoUrl: d.photo_url || d.photoUrl,
            urgencyScore: d.urgency_score || d.urgencyScore
          }))
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local memory store:', err.message)
      }
    }

    // Local in-memory filtering
    return reportsStore.filter((r) => {
      if (type && type !== 'all' && r.type !== type) return false
      if (status && status !== 'all' && r.status !== status) return false
      if (area && area !== 'all' && r.area !== area) return false
      return true
    })
  },

  async getById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
        if (!error && data) return data
      } catch (err) {
        console.warn('Supabase getById error:', err.message)
      }
    }
    return reportsStore.find((r) => String(r.id) === String(id)) || null
  },

  async create(reportData) {
    const lat = reportData.lat ? Number(reportData.lat) : 19.1197
    const lng = reportData.lng ? Number(reportData.lng) : 72.8468
    let area = reportData.area && reportData.area.trim()
    if (!area) {
      area = await reverseGeocodeCoordinates(lat, lng)
    }

    // Run AI analysis
    const aiAnalysis = analyzeCivicIssue({
      type: reportData.type,
      description: reportData.description,
      location: { lat, lng }
    })

    const newReport = {
      id: String(Date.now()),
      type: reportData.type,
      area,
      lat,
      lng,
      status: reportData.status || 'Reported',
      description: reportData.description || '',
      photoUrl: reportData.photoUrl || null,
      upvotes: 1,
      severity: aiAnalysis.severity,
      urgencyScore: aiAnalysis.urgencyScore,
      aiAnalysis,
      createdAt: new Date().toISOString()
    }

    // Insert locally
    reportsStore.unshift(newReport)

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reports').insert([{
          type: newReport.type,
          area: newReport.area,
          lat: newReport.lat,
          lng: newReport.lng,
          status: newReport.status,
          description: newReport.description,
          photo_url: newReport.photoUrl,
          upvotes: newReport.upvotes,
          severity: newReport.severity,
          urgency_score: newReport.urgencyScore
        }]).select().single()

        if (!error && data) {
          newReport.supabaseId = data.id
        }
      } catch (err) {
        console.warn('Supabase insert failed, stored in local fallback:', err.message)
      }
    }

    return newReport
  },

  async updateStatus(id, newStatus) {
    const report = reportsStore.find((r) => String(r.id) === String(id))
    if (report) {
      report.status = newStatus
      report.updatedAt = new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reports').update({ status: newStatus }).eq('id', id)
      } catch (err) {
        console.warn('Supabase updateStatus error:', err.message)
      }
    }

    return report
  },

  async upvote(id) {
    const report = reportsStore.find((r) => String(r.id) === String(id))
    if (report) {
      report.upvotes = (report.upvotes || 0) + 1
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (report) {
          await supabase.from('reports').update({ upvotes: report.upvotes }).eq('id', id)
        }
      } catch (err) {
        console.warn('Supabase upvote error:', err.message)
      }
    }

    return report
  },

  async getStats() {
    const all = await this.getAll()
    const total = all.length
    const fixed = all.filter((r) => r.status === 'Fixed').length
    const inProgress = all.filter((r) => r.status === 'In progress').length
    const reported = all.filter((r) => r.status === 'Reported').length

    // Build area ranking
    const byArea = {}
    for (const r of all) {
      const areaName = r.area || 'Other'
      if (!byArea[areaName]) {
        byArea[areaName] = {
          area: areaName,
          total: 0,
          fixed: 0,
          open: 0,
          openTypes: new Set()
        }
      }
      const a = byArea[areaName]
      a.total += 1
      if (r.status === 'Fixed') {
        a.fixed += 1
      } else {
        a.open += 1
        a.openTypes.add(r.type)
      }
    }

    const areaList = Object.values(byArea).map((a) => ({
      ...a,
      openTypes: Array.from(a.openTypes),
      percentFixed: a.total > 0 ? Math.round((a.fixed / a.total) * 100) : 0
    }))

    const ranked = [...areaList].sort((a, b) => b.fixed - a.fixed || b.total - a.total)
    const hotspots = areaList.filter((a) => a.open >= 3)
    const chainAlerts = areaList.filter(
      (a) => a.openTypes.includes('drainage') && a.openTypes.includes('pothole')
    )

    return {
      total,
      fixed,
      inProgress,
      open: reported + inProgress,
      areasCount: areaList.length,
      rankedAreas: ranked,
      hotspots,
      chainAlerts,
      byType: {
        pothole: all.filter((r) => r.type === 'pothole').length,
        drainage: all.filter((r) => r.type === 'drainage').length,
        leakage: all.filter((r) => r.type === 'leakage').length
      }
    }
  }
}
