import type { Metadata } from "next"

import { Prestadora } from "./prestadora"

export const metadata: Metadata = { title: "Prestadora PacoteZap" }

export default function Page() {
  return <Prestadora />
}
