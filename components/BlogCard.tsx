import type { PostCard } from '@/lib/posts'
import { BLOG_URL } from '@/lib/site'

/**
 * Карточка листинга. Принимает PostCard, а не Post целиком: ровно эти поля
 * приходят и с сервера, и из /blog-index.json при клиентской подгрузке.
 */
export default function BlogCard({ post }: { post: PostCard }) {
  return (
    <a href={`${BLOG_URL}/${post.slug}`} className="blog-card">
      <span className="blog-card__tag">{post.category}</span>
      <span className="blog-card__title">{post.cardTitle}</span>
      <span className="blog-card__desc">{post.cardDesc}</span>
      <span className="blog-card__meta">{post.cardMeta}</span>
    </a>
  )
}
