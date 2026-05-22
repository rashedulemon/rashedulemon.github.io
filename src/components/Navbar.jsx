import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Code, FileText, Activity, Mail } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");

  // Observer to track visible sections on the homepage
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = ["hero", "about", "projects", "resume", "activity", "contact"];
    const observers = [];

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0.3,
      rootMargin: "-10% 0px -10% 0px"
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observers.push(el);
      }
    });

    return () => {
      observers.forEach((el) => observer.unobserve(el));
    };
  }, [location.pathname]);

  // Handle click on links
  const handleNavClick = (e, id) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If not on homepage, navigate to home and scroll to section after mount
      navigate(`/#${id}`);
    }
  };

  const navItems = [
    { type: "anchor", id: "hero", label: "Home", icon: <Home className="w-5 h-5" /> },
    { type: "anchor", id: "about", label: "About", icon: <User className="w-5 h-5" /> },
    { type: "anchor", id: "projects", label: "Projects", icon: <Code className="w-5 h-5" /> },
    { type: "anchor", id: "resume", label: "Resume", icon: <FileText className="w-5 h-5" /> },
    { type: "anchor", id: "activity", label: "Activity", icon: <Activity className="w-5 h-5" /> },
    { type: "anchor", id: "contact", label: "Contact", icon: <Mail className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
      <div className="flex items-center gap-1 px-3 py-2.5 rounded-full liquid-glass">
        {navItems.map((item) => {
          const isAnchor = item.type === "anchor";
          const isActive = isAnchor
            ? location.pathname === "/" && activeSection === item.id
            : location.pathname === item.path;

          if (isAnchor) {
            return (
              <a
                key={item.id}
                href={`/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative p-2.5 rounded-full transition-all duration-300 group ${
                  isActive
                    ? "bg-brand-blue text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:liquid-glass-btn"
                }`}
                aria-label={item.label}
              >
                {item.icon}
                <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2.5 py-1 rounded-lg liquid-glass text-[10px] text-slate-700 font-mono whitespace-nowrap">
                  {item.label}
                </span>
              </a>
            );
          } else {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative p-2.5 rounded-full transition-all duration-300 group ${
                  isActive
                    ? "bg-brand-blue text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-label={item.label}
              >
                {item.icon}
                <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2.5 py-1 rounded-lg liquid-glass text-[10px] text-slate-700 font-mono whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          }
        })}
      </div>
    </nav>
  );
}
