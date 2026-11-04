import type { Metadata } from "next"

import { Painel } from "./painel"

export const metadata: Metadata = { title: "Painel PacoteZap" }

export default function Page() {
  return <Painel />
}
