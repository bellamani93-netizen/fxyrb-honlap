import type { ReactNode } from 'react'

// Egyszerű Markdown-megjelenítő a jogi dokumentumokhoz (ÁSZF, Adatkezelési
// tájékoztató). Csak azt tudja, amit ezek a fájlok használnak: címsorok,
// bekezdések, felsorolás, számozott lista, táblázat, idézet, vízszintes
// vonal, **félkövér** és `kód`. Szándékosan nem használ
// dangerouslySetInnerHTML-t — minden szöveg React-csomópontként kerül ki.

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <span key={i}>{p.slice(1, -1)}</span>
    return p
  })
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function LegalMarkdown({ source, skipTitle = false }: { source: string; skipTitle?: boolean }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^\|[\s\-|]+\|$/.test(lines[i].trim())) {
          rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
        }
        i++
      }
      const [head, ...body] = rows
      const emptyHead = head.every((c) => c === '')
      out.push(
        <div className="table-responsive legal-table" key={key++}>
          <table className="table table-sm">
            {!emptyHead && (
              <thead><tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            )}
            <tbody>
              {body.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    const h = /^(#{1,4}) (.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const text = h[2]
      i++
      if (level === 1) {
        if (!skipTitle) out.push(<h1 key={key++} className="mb-3">{inline(text)}</h1>)
        continue
      }
      const Tag = (`h${level}`) as 'h2' | 'h3' | 'h4'
      out.push(<Tag key={key++} id={slug(text)} className={level === 2 ? 'h4 mt-5 mb-3' : 'h5 mt-4 mb-2'}>{inline(text)}</Tag>)
      continue
    }

    if (line.trim() === '---') { out.push(<hr key={key++} />); i++; continue }

    if (/^\s*- /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*- /.test(lines[i])) { items.push(lines[i].replace(/^\s*- /, '')); i++ }
      out.push(<ul key={key++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>)
      continue
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      out.push(<ol key={key++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>)
      continue
    }

    if (/^\s*> /.test(line)) {
      out.push(<blockquote key={key++} className="legal-note">{inline(line.replace(/^\s*> /, ''))}</blockquote>)
      i++
      continue
    }

    if (line.trim() === '') { i++; continue }

    out.push(<p key={key++}>{inline(line)}</p>)
    i++
  }

  return <div className="legal-doc">{out}</div>
}
