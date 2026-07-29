import { blogPageUrl } from '@/lib/posts'

/**
 * Постраничная навигация. Существует ради поисковых систем и режима без JS:
 * настоящие ссылки, по которым обходится весь листинг. Для человека рядом
 * работает бесконечная лента, поэтому блок стоит в самом низу.
 */
export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null

  // Окно вокруг текущей: первая, соседние, последняя. Многоточия — не ссылки
  const nums: Array<number | '…'> = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) nums.push(i)
    else if (nums[nums.length - 1] !== '…') nums.push('…')
  }

  return (
    <nav className="pager" aria-label="Страницы блога">
      {page > 1 && (
        <a className="pager__side" href={blogPageUrl(page - 1)} rel="prev">
          ← Назад
        </a>
      )}

      <ul className="pager__list">
        {nums.map((n, i) =>
          n === '…' ? (
            <li className="pager__gap" key={`gap-${i}`} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              {n === page ? (
                <span className="pager__num pager__num--current" aria-current="page">
                  {n}
                </span>
              ) : (
                <a className="pager__num" href={blogPageUrl(n)}>
                  {n}
                </a>
              )}
            </li>
          ),
        )}
      </ul>

      {page < totalPages && (
        <a className="pager__side" href={blogPageUrl(page + 1)} rel="next">
          Дальше →
        </a>
      )}
    </nav>
  )
}
