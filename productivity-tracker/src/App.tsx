import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import JournalGallery from "./pages/JournalGallery"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<JournalGallery />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
