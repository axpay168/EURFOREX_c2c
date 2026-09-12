import fs from 'node:fs'
import path from 'node:path'

/** 掃描前端原始碼中用到的 Material Symbols 圖示名稱（icon span 內文、icon: 'xxx' 資料、CSS content） */
export function scanIconNames(projectRoot) {
  const names = new Set()
  const skipDirs = new Set(['node_modules', 'dist', 'unpackage', '.git', 'scripts'])
  const exts = new Set(['.vue', '.js', '.ts', '.html', '.css', '.json'])
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name))
        continue
      }
      if (!exts.has(path.extname(entry.name))) continue
      const text = fs.readFileSync(path.join(dir, entry.name), 'utf8')
      for (const m of text.matchAll(/material-symbols-outlined[^>]*>\s*([a-z][a-z0-9_]*)\s*</g)) names.add(m[1])
      for (const m of text.matchAll(/\b(?:icon|iconName|icon_name|symbol|materialIcon|leadingIcon|trailingIcon|brandIcon)\s*[:=]\s*["']([a-z][a-z0-9_]*)["']/g)) names.add(m[1])
      for (const m of text.matchAll(/content\s*:\s*["']([a-z][a-z0-9_]{2,})["']/g)) names.add(m[1])
    }
  }
  walk(projectRoot)
  return [...names].sort()
}

export function readIconConfig(projectRoot) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, 'scripts', 'icon-font-names.json'), 'utf8'))
}
