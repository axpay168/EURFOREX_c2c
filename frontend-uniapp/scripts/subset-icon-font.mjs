import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanIconNames, readIconConfig } from './icon-font-scan.mjs'

/**
 * 依原始碼實際用到的圖示，向 Google Fonts 取得 Material Symbols Outlined 的子集字型（靜態實例：FILL 1、wght 400、opsz 24）
 * 並寫入 static/previews/shared/fonts/google-cdn-mirror/MaterialSymbolsOutlined-subset.woff2，同時更新 scripts/icon-font-names.json。
 */
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(projectRoot, 'scripts', 'icon-font-names.json')
const outPath = path.join(projectRoot, 'static', 'previews', 'shared', 'fonts', 'google-cdn-mirror', 'MaterialSymbolsOutlined-subset.woff2')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

const config = readIconConfig(projectRoot)
const ignore = new Set(config.ignore || [])
const icons = scanIconNames(projectRoot).filter(name => !ignore.has(name))
const cssUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0&icon_names=' + icons.join(',') + '&display=block'
const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': UA } })
if (!cssRes.ok) {
  console.error(`[icons] Google Fonts 回應 ${cssRes.status}；若是 400，通常是清單裡有不存在的圖示名稱，請加入 ignore：\n${await cssRes.text()}`)
  process.exit(1)
}
const css = await cssRes.text()
const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)\s*format\('?woff2'?\)/)
if (!match) {
  console.error('[icons] 回應中找不到 woff2 位址：\n' + css)
  process.exit(1)
}
const fontRes = await fetch(match[1], { headers: { 'User-Agent': UA } })
if (!fontRes.ok) {
  console.error(`[icons] 下載字型失敗 ${fontRes.status}`)
  process.exit(1)
}
const bytes = Buffer.from(await fontRes.arrayBuffer())
if (bytes.subarray(0, 4).toString() !== 'wOF2') {
  console.error('[icons] 下載內容不是 woff2')
  process.exit(1)
}
fs.writeFileSync(outPath, bytes)
fs.writeFileSync(configPath, JSON.stringify({ ...config, icons }, null, 2) + '\n')
console.log(`[icons] 已產生 ${path.relative(projectRoot, outPath)}（${bytes.length} bytes，${icons.length} 個圖示）`)
