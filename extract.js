import fs from 'fs'

const svg = fs.readFileSync('public/freepik_assistant_1775160130830.svg', 'utf8')
const match = svg.match(/base64,([^"']+)/)
if (match) {
  fs.writeFileSync('public/roots.png', Buffer.from(match[1], 'base64'))
  console.log('Saved roots.png')
} else {
  console.log('No base64 found')
}
