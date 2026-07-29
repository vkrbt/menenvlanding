import YouTubeCarousel from '@/components/YouTubeCarousel'
import { YOUTUBE_URL } from '@/lib/site'

const VIDEO_IDS = ['PHdg6U57lOU', 'yb7g3u8kiB4', 'LF_Gt4MzNlc', 'I2sGt70krXc']

export default function YouTubeSection() {
  return (
    <section className="section youtube">
      <div className="container youtube__inner">
        <div className="youtube__icon" aria-hidden="true">
          <svg width="48" height="34" viewBox="0 0 48 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="34" rx="8" fill="#FF0000" />
            <path d="M20 11l12 6-12 6V11z" fill="white" />
          </svg>
        </div>

        <h2 className="section-title youtube__title">Знакомься с нами заочно</h2>

        <p className="youtube__sub">
          На канале мы говорим вслух о том, о чём другие мужчины предпочитают молчать
        </p>

        <YouTubeCarousel ids={VIDEO_IDS} />

        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
          Смотреть на YouTube
        </a>
      </div>
    </section>
  )
}
