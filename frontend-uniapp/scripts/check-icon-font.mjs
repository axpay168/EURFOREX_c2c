import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanIconNames, readIconConfig } from './icon-font-scan.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const config = readIconConfig(projectRoot)
const known = new Set([...(config.icons || []), ...(config.ignore || [])])
const missing = scanIconNames(projectRoot).filter(name => !known.has(name))
if (missing.length) {
  console.error('[icons] 以下圖示未包含在字型子集 scripts/icon-font-names.json，上線後會顯示成文字：')
  console.error('  ' + missing.join(', '))
  console.error('[icons] 請執行 `npm run icons:subset` 重新產生字型子集（需能連到 fonts.googleapis.com），誤判的字詞則加入 ignore。')
  process.exit(1)
}
console.log(`[icons] 字型子集涵蓋原始碼中全部 ${config.icons.length} 個圖示`)
