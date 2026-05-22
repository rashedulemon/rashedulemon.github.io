
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Guestbook from "./pages/Guestbook";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="bg-[#0b0f19] text-gray-100 min-h-screen selection:bg-brand-cyan/30 selection:text-white">
        {/* Floating dock navigation */}
        <Navbar />

        {/* Route views */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/guestbook" element={<Guestbook />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
