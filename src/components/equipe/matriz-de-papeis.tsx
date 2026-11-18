"use client";

import { CheckIcon, MinusIcon } from "lucide-react";
import { useId, useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";
import {
  type Grants,
  PermissionMatrix,
  type PermissionGroup,
  type Role,
} from "@/components/ui/permission-matrix";

/** Celular: um papel por vez (a matriz inteira não cabe em 390 px, relatório UX 12/11). */
function PapelPorVez({
  papeis,
  grupos,
  concedido,
}: {
  papeis: Role[];
  grupos: PermissionGroup[];
  concedido: Grants;
}) {
  const id = useId();
  const [papel, setPapel] = useState(papeis[0]?.id ?? "");
  const tem = new Set(concedido[papel] ?? []);
  return (
    <div className="grid gap-4">
      <label htmlFor={id} className="grid gap-1 text-sm font-medium">
        Papel
        <NativeSelect
          id={id}
          className="w-full"
          value={papel}
          onChange={(e) => setPapel(e.target.value)}
        >
          {papeis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </NativeSelect>
      </label>
      {grupos.map((g) => (
        <section
          key={g.id}
          className="grid gap-1 rounded-2xl border bg-card p-3"
        >
          <h3 className="text-sm font-semibold">{g.label}</h3>
          <ul className="grid">
            {g.permissions.map((p) => {
              const sim = tem.has(p.id);
              return (
                <li
                  key={p.id}
                  className="flex min-h-11 items-center justify-between gap-3 border-t py-2 text-sm first:border-t-0"
                >
                  <span>{p.label}</span>
                  <span
                    className={
                      sim
                        ? "flex items-center gap-1 font-medium text-success"
                        : "flex items-center gap-1 text-muted-foreground"
                    }
                  >
                    {sim ? (
                      <CheckIcon aria-hidden />
                    ) : (
                      <MinusIcon aria-hidden />
                    )}
                    {sim ? "Pode" : "Não pode"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * USR-002 só lê. O PermissionMatrix é de cliente e exige `onValueChange`, que
 * um Server Component não pode passar (função não atravessa a fronteira).
 */
export function MatrizDePapeis({
  papeis,
  grupos,
  concedido,
}: {
  papeis: Role[];
  grupos: PermissionGroup[];
  concedido: Grants;
}) {
  return (
    <>
      <div className="md:hidden">
        <PapelPorVez papeis={papeis} grupos={grupos} concedido={concedido} />
      </div>
      <div className="hidden md:block">
        <PermissionMatrix
          roles={papeis}
          groups={grupos}
          value={concedido}
          onValueChange={() => {}}
          readOnly
        />
      </div>
    </>
  );
}
