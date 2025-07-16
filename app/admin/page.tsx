import { AdminProtection } from "@/components/admin/admin-protection"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <AdminProtection>
      <AdminDashboard />
    </AdminProtection>
  )
}
