import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Productivity Tracker</h1>
      </header>
      <main className="flex-1 p-4 w-full max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
