"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

// WebCode (sem equivalente no shadcn): permissões agrupadas por módulo.
// PermissionMatrix: papéis nas colunas, checkbox por célula, papel travado (ex.: Administrador tem tudo),
// módulo "Em breve" apagado, primeira coluna fixa ao rolar no celular e selo "Alterado" no que difere de `saved`.
// PermissionList: uma pessoa, Switch por permissão, com o que difere do papel marcado ("Concedido · papel: não").
// Valores são listas de ids; changedCount() conta as diferenças para a barra de salvar.
type Permission = { id: string; label: string; description?: string }
type PermissionGroup = { id: string; label: string; icon?: React.ReactNode; soon?: boolean; permissions: Permission[] }
type Role = { id: string; label: string; locked?: boolean }
type Grants = Record<string, string[]>

const has = (list: string[] | undefined, id: string) => !!list?.includes(id)
const toggle = (list: string[] = [], id: string, on: boolean) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id))

/** Quantas células diferem entre dois estados (para "2 alterações não salvas"). */
function changedCount(a: Grants, b: Grants) {
  let n = 0
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = new Set(a[k] ?? [])
    const y = new Set(b[k] ?? [])
    for (const id of x) if (!y.has(id)) n++
    for (const id of y) if (!x.has(id)) n++
  }
  return n
}

function GroupHeading({ group, colSpan }: { group: PermissionGroup; colSpan: number }) {
  return (
    <tr data-slot="permission-group">
      <th scope="colgroup" colSpan={colSpan} className="bg-muted/60 px-3 py-2 text-left text-sm font-semibold">
        <span className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          {group.icon}
          {group.label}
          {group.soon && <Badge variant="secondary">Em breve</Badge>}
        </span>
      </th>
    </tr>
  )
}

function PermissionMatrix({
  roles,
  groups,
  value,
  onValueChange,
  saved,
  readOnly = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  roles: Role[]
  groups: PermissionGroup[]
  value: Grants
  onValueChange?: (value: Grants) => void
  /** Estado salvo: células diferentes ganham o selo "Alterado". */
  saved?: Grants
  readOnly?: boolean
}) {
  return (
    <div data-slot="permission-matrix" className={cn("overflow-x-auto rounded-lg border bg-card", className)} {...props}>
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className="sticky left-0 z-10 bg-card px-3 py-2.5 text-left font-medium text-muted-foreground">
              Permissão
            </th>
            {roles.map((r) => (
              <th key={r.id} scope="col" className="px-3 py-2.5 text-center font-medium text-muted-foreground">
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.id} className="[&>tr:not(:last-child)]:border-b">
            <GroupHeading group={g} colSpan={roles.length + 1} />
            {g.permissions.map((p) => {
              const changed = saved && roles.some((r) => has(value[r.id], p.id) !== has(saved[r.id], p.id))
              return (
                <tr key={p.id} className={cn("transition-colors duration-(--wc-motion-duration-fast) hover:bg-muted/40", g.soon && "text-muted-foreground")}>
                  <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-2.5 pl-9 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <span title={p.description}>{p.label}</span>
                      {changed && <Badge variant="warning">Alterado</Badge>}
                    </span>
                  </th>
                  {roles.map((r) => (
                    <td key={r.id} className="px-3 py-2.5 text-center">
                      <Checkbox
                        aria-label={`${p.label}: ${r.label}`}
                        checked={r.locked || has(value[r.id], p.id)}
                        disabled={readOnly || r.locked || g.soon}
                        onCheckedChange={(c) => onValueChange?.({ ...value, [r.id]: toggle(value[r.id], p.id, c === true) })}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
    </div>
  )
}

function PermissionList({
  groups,
  value,
  onValueChange,
  baseline,
  readOnly = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  groups: PermissionGroup[]
  value: string[]
  onValueChange?: (value: string[]) => void
  /** Permissões do papel: o que difere vira "Concedido · papel: não" ou "Removido · papel: sim". */
  baseline?: string[]
  readOnly?: boolean
}) {
  const id = React.useId()
  return (
    <div data-slot="permission-list" className={cn("divide-y rounded-lg border bg-card", className)} {...props}>
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`${id}-${g.id}`} className="py-1">
          <h3 id={`${id}-${g.id}`} className="flex items-center gap-2 px-3 pt-2.5 pb-1 text-sm font-semibold [&_svg]:size-4 [&_svg]:text-muted-foreground">
            {g.icon}
            {g.label}
            {g.soon && <Badge variant="secondary">Em breve</Badge>}
          </h3>
          {g.permissions.map((p) => {
            const on = value.includes(p.id)
            const diff = baseline && on !== baseline.includes(p.id)
            const sid = `${id}-${p.id}`
            return (
              <div key={p.id} className={cn("flex min-h-(--wc-density-row) items-center gap-3 px-3 pl-9", g.soon && "text-muted-foreground")}>
                <label htmlFor={sid} className="grid flex-1 gap-0.5 text-sm">
                  {p.label}
                  {p.description && <span className="text-xs text-muted-foreground">{p.description}</span>}
                </label>
                {diff && <Badge variant={on ? "success" : "warning"}>{on ? "Concedido · papel: não" : "Removido · papel: sim"}</Badge>}
                <Switch
                  id={sid}
                  checked={on}
                  disabled={readOnly || g.soon}
                  onCheckedChange={(c) => onValueChange?.(toggle(value, p.id, c))}
                />
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

export { PermissionList, PermissionMatrix, changedCount, type Grants, type Permission, type PermissionGroup, type Role }
