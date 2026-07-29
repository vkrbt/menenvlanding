import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { BLOG_URL } from '@/lib/site'

export const metadata = { title: 'Страница не найдена | Мужская среда' }

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className="article">
        <h1 className="article__title">Такой страницы нет</h1>
        <p>Возможно, ссылка устарела или в адресе опечатка.</p>
        <p>
          <a href="/">На главную</a> · <a href={BLOG_URL}>В блог</a>
        </p>
      </main>

      <SiteFooter />
    </>
  )
}
