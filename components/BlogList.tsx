'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import BlogCard from '@/components/BlogCard'
import type { PostCard } from '@/lib/posts'

/**
 * Листинг с двумя режимами одновременно.
 *
 * Для поисковых систем страница остаётся обычной постраничной: серверный
 * HTML содержит ровно свой срез статей, а ссылки на соседние страницы —
 * настоящие <a>. Ничего из этого клиент не трогает.
 *
 * Для человека дальше работает бесконечная лента: при подходе к концу
 * списка подгружается следующая порция из /blog-index.json и дописывается
 * снизу. Файл забирается один раз и лениво — до первой прокрутки вниз
 * запроса не будет.
 *
 * Без JS и у краулера остаётся полностью рабочая пагинация.
 */
export default function BlogList({
  initial,
  page,
  totalPages,
}: {
  initial: PostCard[]
  page: number
  totalPages: number
}) {
  const [extra, setExtra] = useState<PostCard[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(page >= totalPages)
  const [failed, setFailed] = useState(false)
  const allRef = useRef<PostCard[] | null>(null)
  const sentinel = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || done) return
    setLoading(true)
    try {
      if (!allRef.current) {
        const res = await fetch('/blog-index.json')
        if (!res.ok) throw new Error(String(res.status))
        allRef.current = (await res.json()) as PostCard[]
      }
      const shown = initial.length + extra.length
      const offset = (page - 1) * initial.length
      const next = allRef.current.slice(offset + shown, offset + shown + initial.length)
      if (next.length === 0) {
        setDone(true)
      } else {
        setExtra((prev) => [...prev, ...next])
        if (offset + shown + next.length >= allRef.current.length) setDone(true)
      }
    } catch {
      // Сеть отвалилась или файла нет — оставляем человеку обычную пагинацию
      setFailed(true)
      setDone(true)
    } finally {
      setLoading(false)
    }
  }, [loading, done, initial.length, extra.length, page])

  useEffect(() => {
    const el = sentinel.current
    if (!el || done) return
    // Подгружаем заранее, за 600px до конца — чтобы лента не дёргалась
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore()
    }, { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore, done])

  return (
    <>
      <div className="blog-list">
        {initial.map((p) => (
          <BlogCard post={p} key={p.slug} />
        ))}
        {extra.map((p) => (
          <BlogCard post={p} key={p.slug} />
        ))}
      </div>

      {!done && (
        <div className="blog-more" ref={sentinel}>
          <button type="button" className="blog-more__btn" onClick={loadMore} disabled={loading}>
            {loading ? 'Загружаю…' : 'Показать ещё'}
          </button>
        </div>
      )}

      {failed && (
        <p className="blog-more__note">
          Не удалось подгрузить продолжение. Остальные материалы — по ссылкам на страницы ниже.
        </p>
      )}
    </>
  )
}
