import type { Metadata } from "next"

import { Pranchas } from "./pranchas"

export const metadata: Metadata = { title: "Pranchas PacoteZap" }

export default function Page() {
  return <Pranchas />
}
