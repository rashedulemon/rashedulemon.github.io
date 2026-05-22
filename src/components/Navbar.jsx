import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Code, FileText, Activity, MessageSquare, Mail, Settings } from "lucide-react";

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
    { type: "route", path: "/guestbook", label: "Guestbook", icon: <MessageSquare className="w-5 h-5" /> },
    { type: "anchor", id: "contact", label: "Contact", icon: <Mail className="w-5 h-5" /> },
    { type: "route", path: "/admin", label: "Dashboard", icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
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
                    ? "bg-brand-cyan text-gray-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                }`}
                aria-label={item.label}
              >
                {item.icon}
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2.5 py-1 rounded bg-slate-950 text-[10px] text-gray-200 border border-white/5 font-mono whitespace-nowrap shadow-lg">
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
                    ? "bg-brand-cyan text-gray-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                }`}
                aria-label={item.label}
              >
                {item.icon}
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2.5 py-1 rounded bg-slate-950 text-[10px] text-gray-200 border border-white/5 font-mono whitespace-nowrap shadow-lg">
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
