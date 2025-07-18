import type { Metadata } from "next"
import StorePageClient from "./page.client"

export const metadata: Metadata = {
  title: "Merchandise Store | Kelvin Creekman Fan Club",
  description: "Official Kelvin Creekman merchandise and exclusive fan club items",
}

export default function StorePage() {
  return <StorePageClient />
}
