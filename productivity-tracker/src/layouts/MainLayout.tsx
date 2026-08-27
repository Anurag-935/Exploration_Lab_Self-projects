import { Outlet } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Productivity Tracker</h1>
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
