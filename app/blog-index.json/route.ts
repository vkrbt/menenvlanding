import { allPostCards } from '@/lib/posts'

// Статический экспорт: файл собирается на билде и лежит в out/ как обычный JSON
export const dynamic = 'force-static'

/**
 * Индекс карточек для бесконечной ленты. Отдаётся один раз и лениво —
 * страница листинга запрашивает его только при прокрутке к концу списка.
 */
export function GET() {
  return Response.json(allPostCards())
}
