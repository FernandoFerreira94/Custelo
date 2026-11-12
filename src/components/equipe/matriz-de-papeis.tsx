"use client";

import {
  type Grants,
  PermissionMatrix,
  type PermissionGroup,
  type Role,
} from "@/components/ui/permission-matrix";

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
    <PermissionMatrix
      roles={papeis}
      groups={grupos}
      value={concedido}
      onValueChange={() => {}}
      readOnly
    />
  );
}
