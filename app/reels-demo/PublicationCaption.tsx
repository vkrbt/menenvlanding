'use client'

import { useRef, useState } from 'react'

type Props = { text: string }

export default function PublicationCaption({ text }: Props) {
  const details = useRef<HTMLDetailsElement>(null)
  const content = useRef<HTMLParagraphElement>(null)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setMessage('Текст скопирован')
    } catch {
      setCopied(false)
      if (details.current) details.current.open = true
      const selection = window.getSelection()
      if (content.current && selection) {
        const range = document.createRange()
        range.selectNodeContents(content.current)
        selection.removeAllRanges()
        selection.addRange(range)
        setMessage('Текст выделен — нажми ⌘C или Ctrl+C')
      } else {
        setMessage('Не удалось скопировать. Выдели текст вручную.')
      }
    }
  }

  return (
    <section className="reels-caption" aria-label="Текст к публикации">
      <div className="reels-caption__head">
        <h3>Текст к публикации</h3>
        <button className="btn btn--outline btn--sm" type="button" onClick={copy}>
          {copied ? 'Скопировано ✓' : 'Копировать текст'}
        </button>
      </div>
      <details ref={details}>
        <summary>Прочитать текст</summary>
        <p className="reels-caption__text" ref={content}>{text}</p>
      </details>
      <span className="reels-caption__status" role="status">{message}</span>
    </section>
  )
}
