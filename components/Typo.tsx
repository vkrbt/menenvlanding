import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { typoFragment } from '@/lib/typo'

/**
 * Прогоняет через типограф все строки внутри разметки страницы при сборке:
 * неразрывные пробелы после предлогов и союзов, перед тире и частицами.
 * Заходит только в JSX самой страницы — компоненты (<Hero /> и т. п.) типографят
 * свои тексты сами. Разметку с dangerouslySetInnerHTML не трогает.
 */
export function typoTree(node: ReactNode): ReactNode {
  if (typeof node === 'string') return typoFragment(node)
  if (Array.isArray(node)) return node.map(typoTree)
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode; dangerouslySetInnerHTML?: unknown }>
    const { children, dangerouslySetInnerHTML } = el.props ?? {}
    if (children == null || dangerouslySetInnerHTML) return el
    return cloneElement(el, undefined, ...(Array.isArray(children) ? children.map(typoTree) : [typoTree(children)]))
  }
  return node
}

export default function Typo({ children }: { children: ReactNode }) {
  return <>{typoTree(children)}</>
}
