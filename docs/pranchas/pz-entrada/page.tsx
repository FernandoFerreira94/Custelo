import type { Metadata } from "next"

import { Entrada } from "./entrada"

export const metadata: Metadata = { title: "Entrada PacoteZap" }

export default function Page() {
  return <Entrada />
}
