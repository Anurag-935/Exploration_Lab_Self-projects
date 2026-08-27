import { Outlet, Link, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function MainLayout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-brand-dark shadow-md border-b border-brand-900/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tight text-brand-light">Productivity Tracker</h1>
          <nav className="hidden sm:flex gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-brand-500' : 'text-brand-light/70 hover:text-brand-light'}`}>Dashboard</Link>
            <Link to="/journal" className={`text-sm font-medium transition-colors ${location.pathname === '/journal' ? 'text-brand-500' : 'text-brand-light/70 hover:text-brand-light'}`}>Journal</Link>
          </nav>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-sm font-medium text-brand-light/70 hover:text-brand-light transition-colors px-3 py-1.5 rounded hover:bg-brand-darker"
        >
          Sign Out
        </button>
      </header>
      <main className="flex-1 p-6 w-full max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

