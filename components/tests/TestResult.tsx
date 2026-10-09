import { explanation, SPECIALIST_FROM_SEVERITY, YM_LEGEND } from '@/lib/tests/copy'
import type { Scale, ScoreResult, Subscale, SubscaleResult } from '@/lib/tests/types'
import { MEETING_URL, TESTS_URL } from '@/lib/site'
import CrisisBlock from './CrisisBlock'

type Ok = Extract<ScoreResult, { ok: true }>

/** Число для показа: целые как есть, сотые — со знаком и запятой */
function fmt(sub: Subscale, value: number): string {
  if (!sub.divisor || sub.divisor === 1) return String(value)
  const s = Math.abs(value).toFixed(2).replace('.', ',')
  return value > 0 ? `+${s}` : value < 0 ? `−${s}` : s
}

/** Доля позиции raw на отрезке [min, max] — для полосы и маркера */
function pos(sub: Subscale, raw: number): number {
  const clamped = Math.min(sub.max, Math.max(sub.min, raw))
  return ((clamped - sub.min) / (sub.max - sub.min)) * 100
}

/**
 * Полоса шкалы: сегменты категорий в пределах теоретического диапазона
 * и маркер результата. Бесконечные края категорий обрезаются по min/max.
 */
function Track({ sub, raw }: { sub: Subscale; raw: number }) {
  return (
    <div className="tres__track" aria-hidden="true">
      {sub.categories.map((c) => {
        const from = pos(sub, Math.max(c.min, sub.min))
        const to = pos(sub, Math.min(c.max, sub.max))
        return (
          <span
            key={c.id}
            className={`tres__seg tres__seg--${c.severity}`}
            style={{ left: `${from}%`, width: `${Math.max(0, to - from)}%` }}
          />
        )
      })}
      <span className="tres__marker" style={{ left: `${pos(sub, raw)}%` }} />
    </div>
  )
}

function Card({ scale, sub, r }: { scale: Scale; sub: Subscale; r: SubscaleResult }) {
  const ex = r.category ? explanation(scale.slug, sub.id, r.category.severity) : undefined
  return (
    <section className="tres__card">
      <h3 className="tres__name">{sub.title}</h3>
      <p className="tres__value">
        <strong>{fmt(sub, r.value)}</strong>
        <span>
          {' '}из {fmt(sub, sub.min / (sub.divisor ?? 1))}…{fmt(sub, sub.max / (sub.divisor ?? 1))}
        </span>
      </p>
      <Track sub={sub} raw={r.raw} />
      {ex && <p className="tres__title">{ex.title}</p>}
      {r.category && r.category.label.toLowerCase() !== ex?.title.toLowerCase() && (
        <p className="tres__official">По методике: «{r.category.label}»</p>
      )}
      {ex?.text && <p className="tres__text">{ex.text}</p>}
    </section>
  )
}

/** Профиль по многим шкалам (Яхин–Менделевич): компактные строки */
function Profile({ scale, rows }: { scale: Scale; rows: Array<[Subscale, SubscaleResult]> }) {
  return (
    <section className="tres__card">
      <h3 className="tres__name">Профиль по шести шкалам</h3>
      <ul className="tres__profile">
        {rows.map(([sub, r]) => (
          <li key={sub.id}>
            <span className="tres__profile-name">{sub.title}</span>
            <span className="tres__profile-value">{fmt(sub, r.value)}</span>
            <Track sub={sub} raw={r.raw} />
            <span className={`tres__profile-cat tres__profile-cat--${r.category?.severity ?? 0}`}>
              {r.category ? explanation(scale.slug, sub.id, r.category.severity)?.title : ''}
            </span>
          </li>
        ))}
      </ul>
      <ul className="tres__legend">
        {YM_LEGEND.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </section>
  )
}

export default function TestResult({
  scale,
  result,
  onRestart,
}: {
  scale: Scale
  result: Ok
  onRestart: () => void
}) {
  const rows = scale.subscales.map((s) => [s, result.subscales.find((r) => r.id === s.id)!] as [Subscale, SubscaleResult])
  const graded = rows.filter(([s]) => s.categories.length)
  const descriptive = rows.filter(([s]) => !s.categories.length)
  const maxSeverity = Math.max(0, ...graded.map(([, r]) => r.category?.severity ?? 0))
  const risk = result.flags.find((f) => f.id === 'suicide')?.level
  const toSpecialist = maxSeverity >= SPECIALIST_FROM_SEVERITY || risk !== undefined

  return (
    <div className="tres">
      <h2 className="tres__heading" tabIndex={-1}>
        Твой результат
      </h2>

      {graded.length > 3 ? (
        <Profile scale={scale} rows={graded} />
      ) : (
        <div className={graded.length > 1 ? 'tres__grid' : undefined}>
          {graded.map(([s, r]) => (
            <Card key={s.id} scale={scale} sub={s} r={r} />
          ))}
        </div>
      )}

      {descriptive.length > 0 && (
        <p className="tres__descriptive">
          {descriptive.map(([s, r], i) => (
            <span key={s.id}>
              {i > 0 && ' · '}
              {s.title}: <strong>{r.value}</strong> из {s.max}
            </span>
          ))}
        </p>
      )}

      {risk !== undefined && <CrisisBlock urgent={risk === 2} />}

      {toSpecialist && (
        <section className="tres__next">
          <h3>Что делать дальше</h3>
          <p>
            {maxSeverity >= SPECIALIST_FROM_SEVERITY
              ? 'Результат в диапазоне, при котором методика советует консультацию специалиста.'
              : 'Ты отметил мысли о смерти — об этом стоит поговорить со специалистом, даже если общий балл невысокий.'}{' '}
            Тест — не диагноз: оценить состояние может только врач. Начать можно с
            психотерапевта или психиатра — результат этого теста можно показать ему.
          </p>
        </section>
      )}

      <section className="tres__community">
        <h3>{toSpecialist ? 'А ещё — не оставаться с этим одному' : 'Если хочется поговорить об этом'}</h3>
        <p>
          «Мужская среда» — онлайн-клуб для мужчин 25+. Раз в две недели в Zoom разговариваем о том,
          о чём обычно молчат. Это не терапия и не лечение, а среда, где можно говорить.
        </p>
        <a href={MEETING_URL} className="btn btn--outline">Как проходит встреча</a>
      </section>

      <div className="tres__actions">
        <button type="button" className="btn btn--outline" onClick={onRestart}>
          Пройти ещё раз
        </button>
        <a href={TESTS_URL} className="trun__link">Другие тесты</a>
      </div>

      <p className="tres__disclaimer">
        Ответы и результат никуда не отправлялись и пропадут, когда ты закроешь страницу.
      </p>
    </div>
  )
}
