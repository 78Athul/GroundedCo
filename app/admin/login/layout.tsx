// Login page gets its own layout without the admin sidebar
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
