"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Inspirado no Tree do Ant Design, Kibo UI e Mantine (MIT; reimplementado). Categorias, plano de contas, pastas,
// permissões em árvore. WebCode: teclado completo do padrão WAI-ARIA Tree (setas, Home/End, Enter/Espaço,
// `*` abre os irmãos, letra pula para o próximo item com essa inicial), foco itinerante (um Tab entra, outro sai),
// `selectionMode` single ou checkbox (marca o ramo inteiro, pai fica indeterminado), linhas-guia de recuo,
// filhos entram com fade curto e `aria-level`/`aria-setsize`/`aria-posinset` para o leitor de tela.
export type TreeNode = {
  id: string
  label: React.ReactNode
  /** Texto usado na busca por letra quando `label` não é string. */
  textValue?: string
  icon?: React.ReactNode
  /** Ícone quando aberto (ex.: pasta aberta). */
  iconOpen?: React.ReactNode
  /** Conteúdo à direita (contagem, badge). */
  end?: React.ReactNode
  disabled?: boolean
  children?: TreeNode[]
}

type CheckState = boolean | "indeterminate"

function leaves(node: TreeNode): string[] {
  return node.children?.length ? node.children.flatMap(leaves) : node.disabled ? [] : [node.id]
}

function visibleIds(nodes: TreeNode[], expanded: Set<string>, out: { id: string; node: TreeNode; parent?: string }[] = [], parent?: string) {
  for (const n of nodes) {
    out.push({ id: n.id, node: n, parent })
    if (n.children?.length && expanded.has(n.id)) visibleIds(n.children, expanded, out, n.id)
  }
  return out
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [state, setState] = React.useState(initial)
  const current = value ?? state
  const set = React.useCallback((v: T) => {
    setState(v)
    onChange?.(v)
  }, [onChange])
  return [current, set] as const
}

type Ctx = {
  expanded: Set<string>
  toggle: (id: string) => void
  focusId: string | null
  setFocusId: (id: string) => void
  selectionMode: "single" | "checkbox" | "none"
  selected: string | null
  select: (node: TreeNode) => void
  checkState: (node: TreeNode) => CheckState
  toggleCheck: (node: TreeNode) => void
  onKeyDown: (e: React.KeyboardEvent, node: TreeNode) => void
  guides: boolean
}
const TreeContext = React.createContext<Ctx | null>(null)

function TreeView({
  data,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selectionMode = "single",
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  checked: checkedProp,
  defaultChecked = [],
  onCheckedChange,
  guides = true,
  className,
  ...props
}: Omit<React.ComponentProps<"ul">, "defaultChecked"> & {
  data: TreeNode[]
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  selectionMode?: "single" | "checkbox" | "none"
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string | null, node: TreeNode | null) => void
  /** Folhas marcadas (modo checkbox). */
  checked?: string[]
  defaultChecked?: string[]
  onCheckedChange?: (ids: string[]) => void
  /** Linhas verticais de recuo. */
  guides?: boolean
}) {
  const [expandedArr, setExpandedArr] = useControllable(expandedProp, defaultExpanded, onExpandedChange)
  const expanded = React.useMemo(() => new Set(expandedArr), [expandedArr])
  const [selected, setSelected] = useControllable<string | null>(selectedProp, defaultSelected, (id) => {
    onSelectedChange?.(id, id ? (findNode(data, id) ?? null) : null)
  })
  const [checkedArr, setCheckedArr] = useControllable(checkedProp, defaultChecked, onCheckedChange)
  const checked = React.useMemo(() => new Set(checkedArr), [checkedArr])
  const [focusId, setFocusIdState] = React.useState<string | null>(null)
  const rootRef = React.useRef<HTMLUListElement>(null)
  const typeahead = React.useRef({ text: "", at: 0 })

  const visible = visibleIds(data, expanded)
  // Item que recebe o Tab: o focado, senão o selecionado visível, senão o primeiro.
  const tabId = (focusId && visible.some((v) => v.id === focusId) && focusId) || (selected && visible.some((v) => v.id === selected) && selected) || visible[0]?.id || null

  const setFocusId = (id: string) => {
    setFocusIdState(id)
    rootRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus()
  }
  const toggle = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedArr([...next])
  }
  const select = (node: TreeNode) => {
    if (node.disabled || selectionMode !== "single") return
    setSelected(node.id)
  }
  const checkState = (node: TreeNode): CheckState => {
    const ls = leaves(node)
    if (!ls.length) return false
    const n = ls.filter((id) => checked.has(id)).length
    return n === 0 ? false : n === ls.length ? true : "indeterminate"
  }
  const toggleCheck = (node: TreeNode) => {
    if (node.disabled) return
    const ls = leaves(node)
    const next = new Set(checked)
    const all = checkState(node) === true
    for (const id of ls) {
      if (all) next.delete(id)
      else next.add(id)
    }
    setCheckedArr([...next])
  }

  const onKeyDown = (e: React.KeyboardEvent, node: TreeNode) => {
    const i = visible.findIndex((v) => v.id === node.id)
    const hasKids = !!node.children?.length
    const open = expanded.has(node.id)
    const go = (j: number) => visible[j] && setFocusId(visible[j].id)
    switch (e.key) {
      case "ArrowDown":
        go(i + 1)
        break
      case "ArrowUp":
        go(i - 1)
        break
      case "Home":
        go(0)
        break
      case "End":
        go(visible.length - 1)
        break
      case "ArrowRight":
        if (hasKids && !open) toggle(node.id)
        else if (hasKids) go(i + 1)
        break
      case "ArrowLeft":
        if (hasKids && open) toggle(node.id)
        else if (visible[i].parent) setFocusId(visible[i].parent!)
        break
      case "Enter":
        if (selectionMode === "checkbox") toggleCheck(node)
        else if (selectionMode === "single") select(node)
        else if (hasKids) toggle(node.id)
        break
      case " ":
        if (selectionMode === "checkbox") toggleCheck(node)
        else select(node)
        break
      case "*": {
        const parent = visible[i].parent
        const siblings = parent ? (findNode(data, parent)?.children ?? []) : data
        setExpandedArr([...new Set([...expanded, ...siblings.filter((s) => s.children?.length).map((s) => s.id)])])
        break
      }
      default: {
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
        const now = Date.now()
        const t = typeahead.current
        t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase()
        t.at = now
        const order = [...visible.slice(i + (t.text.length === 1 ? 1 : 0)), ...visible.slice(0, i + 1)]
        const hit = order.find((v) => textOf(v.node).toLowerCase().startsWith(t.text))
        if (hit) setFocusId(hit.id)
        else return
      }
    }
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <TreeContext.Provider
      value={{ expanded, toggle, focusId: tabId, setFocusId, selectionMode, selected, select, checkState, toggleCheck, onKeyDown, guides }}
    >
      <ul
        ref={rootRef}
        role="tree"
        aria-multiselectable={selectionMode === "checkbox" || undefined}
        data-slot="tree-view"
        className={cn("grid text-sm", className)}
        {...props}
      >
        {data.map((n, i) => (
          <TreeItem key={n.id} node={n} level={1} posinset={i + 1} setsize={data.length} />
        ))}
      </ul>
    </TreeContext.Provider>
  )
}

function textOf(node: TreeNode) {
  return node.textValue ?? (typeof node.label === "string" ? node.label : "")
}

function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    const hit = n.children && findNode(n.children, id)
    if (hit) return hit
  }
}

function TreeItem({ node, level, posinset, setsize }: { node: TreeNode; level: number; posinset: number; setsize: number }) {
  const ctx = React.useContext(TreeContext)!
  const hasKids = !!node.children?.length
  const open = hasKids && ctx.expanded.has(node.id)
  const isSelected = ctx.selectionMode === "single" && ctx.selected === node.id
  const check = ctx.selectionMode === "checkbox" ? ctx.checkState(node) : undefined

  return (
    <li
      role="treeitem"
      data-tree-id={node.id}
      tabIndex={ctx.focusId === node.id ? 0 : -1}
      aria-level={level}
      aria-posinset={posinset}
      aria-setsize={setsize}
      aria-expanded={hasKids ? open : undefined}
      aria-selected={ctx.selectionMode === "single" ? isSelected : undefined}
      aria-checked={check === undefined ? undefined : check === "indeterminate" ? "mixed" : check}
      aria-disabled={node.disabled || undefined}
      onKeyDown={(e) => ctx.onKeyDown(e, node)}
      onFocus={(e) => {
        if (e.target === e.currentTarget && ctx.focusId !== node.id) ctx.setFocusId(node.id)
      }}
      className="outline-none focus-visible:[&>[data-slot=tree-row]]:outline-2 focus-visible:[&>[data-slot=tree-row]]:-outline-offset-2 focus-visible:[&>[data-slot=tree-row]]:outline-solid focus-visible:[&>[data-slot=tree-row]]:outline-ring"
    >
      <div
        data-slot="tree-row"
        data-focus-ring
        data-selected={isSelected || undefined}
        onClick={(e) => {
          e.stopPropagation()
          ctx.setFocusId(node.id)
          if (node.disabled) return
          if (ctx.selectionMode === "checkbox") ctx.toggleCheck(node)
          else if (ctx.selectionMode === "single") ctx.select(node)
          else if (hasKids) ctx.toggle(node.id)
        }}
        className={cn(
          "relative flex min-h-(--wc-density-control-sm) cursor-default items-center gap-1.5 rounded-md pr-2 select-none pointer-coarse:min-h-(--wc-mobile-control-sm)",
          "transition-colors duration-(--wc-motion-duration-fast) ease-wc-out",
          "hover:bg-accent/60",
          "data-selected:bg-accent data-selected:font-medium data-selected:text-accent-foreground",
          node.disabled && "cursor-not-allowed text-muted-foreground hover:bg-transparent"
        )}
        style={{ paddingLeft: `calc(${level - 1} * 1.25rem + 0.25rem)` }}
      >
        {ctx.guides &&
          Array.from({ length: level - 1 }, (_, i) => (
            <span key={i} aria-hidden className="absolute inset-y-0 w-px bg-border" style={{ left: `calc(${i} * 1.25rem + 0.875rem)` }} />
          ))}
        {hasKids ? (
          <span
            aria-hidden
            onClick={(e) => {
              e.stopPropagation()
              ctx.setFocusId(node.id)
              ctx.toggle(node.id)
            }}
            className="grid size-5 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
          >
            <ChevronRightIcon className={cn("size-3.5 transition-transform duration-(--wc-motion-duration-fast) ease-wc-out", open && "rotate-90")} />
          </span>
        ) : (
          <span aria-hidden className="size-5 shrink-0" />
        )}
        {check !== undefined && (
          <span
            aria-hidden
            data-state={check === "indeterminate" ? "indeterminate" : check ? "checked" : "unchecked"}
            className="grid size-4 shrink-0 place-items-center rounded-[4px] border border-control-border bg-card text-primary-foreground transition-colors duration-(--wc-motion-duration-fast) data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
          >
            {check === true && <CheckIcon className="size-3 stroke-3" />}
            {check === "indeterminate" && <MinusIcon className="size-3 stroke-3" />}
          </span>
        )}
        {(node.icon || node.iconOpen) && (
          <span aria-hidden className="shrink-0 text-muted-foreground [&_svg]:size-4">
            {open && node.iconOpen ? node.iconOpen : node.icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{node.label}</span>
        {node.end && <span className="shrink-0 text-xs text-muted-foreground">{node.end}</span>}
      </div>
      {open && (
        <ul role="group" className="grid motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-(--wc-motion-duration-fast)">
          {node.children!.map((c, i) => (
            <TreeItem key={c.id} node={c} level={level + 1} posinset={i + 1} setsize={node.children!.length} />
          ))}
        </ul>
      )}
    </li>
  )
}

export { TreeView }
