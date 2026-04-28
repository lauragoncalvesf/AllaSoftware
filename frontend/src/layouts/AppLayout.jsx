import Sidebar from "../components/Sidebar"

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  )
}