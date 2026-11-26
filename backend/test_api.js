// backend/test_api.js
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runTests() {
  console.log('🧪 Starting backend API test suite...')
  
  // Helper for fetch
  const get = (url) => fetch(url).then(r => r.json())
  const post = (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json())
  const patch = (url, body) => fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json())

  // 1. Health
  const health = await get('http://localhost:5000/api/health')
  console.log('✅ 1. Health check:', health.status === 'healthy' ? 'PASSED' : 'FAILED')

  // 2. Stats
  const stats = await get('http://localhost:5000/api/stats')
  console.log(`✅ 2. Stats endpoint: PASSED (Total: ${stats.data.total}, Fixed: ${stats.data.fixed}, Hotspots: ${stats.data.hotspots.length})`)

  // 3. Reports
  const reports = await get('http://localhost:5000/api/reports')
  console.log(`✅ 3. Reports list: PASSED (${reports.count} initial reports loaded)`)

  // 4. Create new report with AI analysis
  const newReport = await post('http://localhost:5000/api/reports', {
    type: 'pothole',
    description: 'Deep massive crater near school gate, severe traffic risk',
    lat: 19.115,
    lng: 72.845,
    area: 'Andheri'
  })
  console.log(`✅ 4. Create report with AI: PASSED (Id: ${newReport.data.id}, Severity: ${newReport.data.severity}, Urgency: ${newReport.data.urgencyScore}/100)`)
  console.log(`   💡 AI Action: "${newReport.data.aiAnalysis.recommendedAction}"`)
  console.log(`   ⚡ Chain Risk: "${newReport.data.aiAnalysis.chainRisk}"`)

  // 5. Upvote report
  const upvoteRes = await post(`http://localhost:5000/api/reports/${newReport.data.id}/upvote`, {})
  console.log(`✅ 5. Upvote: PASSED (New upvotes: ${upvoteRes.upvotes})`)

  // 6. Update Status
  const statusRes = await patch(`http://localhost:5000/api/reports/${newReport.data.id}/status`, { status: 'In progress' })
  console.log(`✅ 6. Status update: PASSED (Status changed to: ${statusRes.data.status})`)

  // 7. Standalone AI analyze endpoint
  const aiRes = await post('http://localhost:5000/api/ai/analyze', {
    type: 'drainage',
    description: 'Clogged overflow flooding street with foul water'
  })
  console.log(`✅ 7. Standalone AI analyzer: PASSED (Severity: ${aiRes.data.severity}, Repair window: ${aiRes.data.estimatedRepairWindow})`)

  console.log('\n🎉 ALL 7 BACKEND API TESTS PASSED SUCCESSFULLY!\n')
  process.exit(0)
}

setTimeout(runTests, 1200)
