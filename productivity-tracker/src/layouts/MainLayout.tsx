import { Outlet, Link, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function MainLayout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">Productivity Tracker</h1>
          <nav className="hidden sm:flex gap-4">
            <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>Dashboard</Link>
            <Link to="/journal" className={`text-sm font-medium ${location.pathname === '/journal' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>Journal</Link>
          </nav>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </button>
      </header>
      <main className="flex-1 p-4 w-full max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
