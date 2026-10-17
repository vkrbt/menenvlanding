import { Fragment } from 'react'
import { typo } from '@/lib/typo'

/**
 * Текст с ручными переносами строк. Каждая часть проходит через типограф,
 * между частями — перенос, который работает только на десктопе:
 * на мобильном строки узкие и ломаются сами
 */
export default function TypoLines({ parts }: { parts: string[] }) {
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={part}>
          {i > 0 && <>{' '}<br className="br-desktop" /></>}
          {typo(part)}
        </Fragment>
      ))}
    </>
  )
}
