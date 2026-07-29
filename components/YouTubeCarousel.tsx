'use client'

import { useRef } from 'react'

/** Порт ytCarouselScroll из инлайнового скрипта index.html */
export default function YouTubeCarousel({ ids }: { ids: string[] }) {
  const track = useRef<HTMLDivElement>(null)

  function scroll(dir: number) {
    const el = track.current
    const item = el?.querySelector<HTMLElement>('.yt-carousel__item')
    if (!el || !item) return
    el.scrollBy({ left: dir * item.offsetWidth, behavior: 'smooth' })
  }

  return (
    <div className="yt-carousel">
      <button className="yt-carousel__btn yt-carousel__btn--prev" aria-label="Предыдущее видео" onClick={() => scroll(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="yt-carousel__track" id="ytCarouselTrack" ref={track}>
        {ids.map((id) => (
          <div className="yt-carousel__item" key={id}>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <button className="yt-carousel__btn yt-carousel__btn--next" aria-label="Следующее видео" onClick={() => scroll(1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
