import type { Metadata } from "next"

import { Todas } from "./todas"

export const metadata: Metadata = { title: "Pranchas PacoteZap" }

export default function Page() {
  return <Todas />
}
