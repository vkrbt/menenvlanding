import type { Post } from '@/lib/posts'
import { BLOG_URL } from '@/lib/site'

export default function BlogCard({ post }: { post: Post }) {
  return (
    <a href={`${BLOG_URL}/${post.slug}`} className="blog-card">
      <span className="blog-card__tag">{post.category}</span>
      <span className="blog-card__title">{post.cardTitle}</span>
      <span className="blog-card__desc">{post.cardDesc}</span>
      <span className="blog-card__meta">{post.cardMeta}</span>
    </a>
  )
}
