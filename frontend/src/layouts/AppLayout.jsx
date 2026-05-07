import { useState } from "react"
import Sidebar from "../components/Sidebar"

export default function AppLayout({ children }) {
  const [sidebarAberta, setSidebarAberta] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        aberta={sidebarAberta}
        setAberta={setSidebarAberta}
      />

      <main
        className={`min-h-screen p-6 transition-all duration-300 ${
          sidebarAberta ? "ml-64" : "ml-14"
        }`}
      >
        {children}
      </main>
    </div>
  )
}