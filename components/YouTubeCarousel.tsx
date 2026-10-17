'use client'

import { useEffect, useRef } from 'react'

/** Раз во сколько карусель листает сама */
const AUTO_MS = 6000

type YTPlayer = { destroy(): void }
type YTNamespace = {
  Player: new (el: HTMLIFrameElement, opts: { events: { onStateChange: (e: { data: number }) => void } }) => YTPlayer
  PlayerState: { PLAYING: number; BUFFERING: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

/** Официальный IFrame API YouTube — только он сообщает, что видео играет. Грузим один раз */
let ytApi: Promise<YTNamespace> | null = null
function loadYouTubeApi(): Promise<YTNamespace> {
  if (!ytApi) {
    ytApi = new Promise((resolve) => {
      if (window.YT?.Player) return resolve(window.YT)
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        if (window.YT) resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      document.head.appendChild(s)
    })
  }
  return ytApi
}

/**
 * Карусель видео. Листает сама раз в AUTO_MS, по кругу — но стоит, пока видео играет,
 * пока курсор над каруселью или в ней фокус (кликнули в плеер), пока её нет
 * на экране или вкладка скрыта. Ручное листание сбрасывает таймер.
 * При prefers-reduced-motion сама не листает.
 */
export default function YouTubeCarousel({ ids }: { ids: string[] }) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const lastMove = useRef(0)

  function step(dir: number, loop = false) {
    const el = track.current
    const item = el?.querySelector<HTMLElement>('.yt-carousel__item')
    if (!el || !item) return
    lastMove.current = Date.now()
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (loop && dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else el.scrollBy({ left: dir * item.offsetWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const box = root.current
    const el = track.current
    if (!box || !el) return

    const playing = new Set<number>()
    let hover = false
    let visible = false
    let apiRequested = false

    const watchPlayers = () => {
      if (apiRequested) return
      apiRequested = true
      loadYouTubeApi().then((YT) => {
        el.querySelectorAll('iframe').forEach((frame, i) => {
          new YT.Player(frame, {
            events: {
              onStateChange: ({ data }) => {
                if (data === YT.PlayerState.PLAYING || data === YT.PlayerState.BUFFERING) playing.add(i)
                else playing.delete(i)
              },
            },
          })
        })
      })
    }

    // API грузим, только когда карусель подъезжает к экрану, — первый экран от этого не тяжелеет
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (e.isIntersecting) watchPlayers()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(box)

    const onEnter = () => (hover = true)
    const onLeave = () => (hover = false)
    // Над плеером YouTube (чужой iframe) страница не получает событий мыши. Поэтому
    // помним, где курсор был последним: если у карусели — значит, он ушёл в видео
    let px = -1e4
    let py = -1e4
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX
      py = e.clientY
    }
    const pointerNear = () => {
      const r = box.getBoundingClientRect()
      const m = 48
      return px >= r.left - m && px <= r.right + m && py >= r.top - m && py <= r.bottom + m
    }
    document.addEventListener('pointermove', onPointer, { passive: true })
    const onUserScroll = () => (lastMove.current = Date.now())
    box.addEventListener('mouseenter', onEnter)
    box.addEventListener('mouseleave', onLeave)
    el.addEventListener('pointerdown', onUserScroll)
    el.addEventListener('touchstart', onUserScroll, { passive: true })
    el.addEventListener('wheel', onUserScroll, { passive: true })

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lastMove.current = Date.now()
    const timer = reduce
      ? undefined
      : window.setInterval(() => {
          const busy =
            playing.size > 0 ||
            hover ||
            pointerNear() ||
            box.contains(document.activeElement) ||
            !visible ||
            document.hidden
          if (busy) {
            lastMove.current = Date.now()
            return
          }
          if (Date.now() - lastMove.current >= AUTO_MS) step(1, true)
        }, 500)

    return () => {
      io.disconnect()
      window.clearInterval(timer)
      document.removeEventListener('pointermove', onPointer)
      box.removeEventListener('mouseenter', onEnter)
      box.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('pointerdown', onUserScroll)
      el.removeEventListener('touchstart', onUserScroll)
      el.removeEventListener('wheel', onUserScroll)
    }
  }, [])

  return (
    <div className="yt-carousel" ref={root}>
      <button className="yt-carousel__btn yt-carousel__btn--prev" aria-label="Предыдущее видео" onClick={() => step(-1)}>
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
              src={`https://www.youtube.com/embed/${id}?enablejsapi=1`}
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

      <button className="yt-carousel__btn yt-carousel__btn--next" aria-label="Следующее видео" onClick={() => step(1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
