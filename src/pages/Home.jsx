import { useState, useEffect } from "react";
import CircuitBg from "../components/CircuitBg";
import BentoCard from "../components/BentoCard";
import ProjectCard from "../components/ProjectCard";
import MosfetSim from "../components/MosfetSim";
import CmosSim from "../components/CmosSim";
import { 
  fetchProjects, 
  fetchEducation, 
  fetchExperience, 
  fetchCertificates, 
  fetchActivities,
  submitMessage 
} from "../firebase/db";
import { 
  Cpu, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  HelpingHand, 
  Award, 
  Send,
  Plus,
  Minus,
  Binary,
  ChevronDown,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activities, setActivities] = useState([]);

  // Active lab simulator tab: "mosfet" or "cmos"
  const [activeLabTab, setActiveLabTab] = useState("mosfet");

  // Active resume tab: "experience" or "education" or "certificates"
  const [activeResumeTab, setActiveResumeTab] = useState("experience");

  // Activities toggle (Show more/less)
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);

  // Contact Form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formStatus, setFormStatus] = useState({ type: null, text: "" }); // { type: 'success'|'error', text: '' }
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projs = await fetchProjects();
        const edu = await fetchEducation();
        const exp = await fetchExperience();
        const certs = await fetchCertificates();
        const acts = await fetchActivities();
        
        setProjects(projs || []);
        setEducation(edu || []);
        setExperience(exp || []);
        setCertificates(certs || []);
        setActivities(acts || []);
      } catch (err) {
        console.error("Error loading portfolio data:", err);
      }
    };
    loadData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setFormStatus({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ type: null, text: "" });

    try {
      const res = await submitMessage({
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });

      if (res.success) {
        setFormStatus({ type: "success", text: "Thank you! Your message was sent successfully." });
        setContactName("");
        setContactEmail("");
        setContactMessage("");
      } else {
        setFormStatus({ type: "error", text: "Failed to send. Please try again." });
      }
    } catch (err) {
      console.error("Error submitting contact form message:", err);
      setFormStatus({ type: "error", text: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group experiences by category
  const workExp = experience.filter(item => item.category === "work");
  const volunteerExp = experience.filter(item => item.category === "volunteering");

  // Tech stack icon components/images mapping
  const techStack = [
    { name: "Python", icon: "fab fa-python text-[#3776ab]" },
    { name: "C / C++", icon: "fab fa-cuttlefish text-[#00599c]" },
    { name: "MATLAB & Simulink", icon: "fas fa-wave-square text-[#d22d2d]" },
    { name: "Microchips / ESP32", icon: "fas fa-microchip text-[#e28743]" },
    { name: "VLSI / Cadence Virtuoso", icon: "fas fa-network-wired text-[#00c4cc]" },
    { name: "Verilog HDL", icon: "fas fa-code text-[#4f46e5]" }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Animated Circuit Background */}
      <CircuitBg />

      {/* --- HERO SECTION --- */}
      <section 
        id="hero" 
        className="relative min-h-screen flex items-center justify-center pt-20 pb-16 z-10"
      >
        <div className="container mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-32 h-32 rounded-full p-1 bg-slate-200 border border-slate-300 shadow-sm overflow-hidden mb-6"
          >
            <img 
              src="/images/main.jpg" 
              alt="Md. Rashedul Islam Emon" 
              className="w-full h-full object-cover rounded-full border-2 border-white"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"; // Fallback beautiful avatar
              }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900"
          >
            Md. Rashedul Islam Emon
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-lg md:text-xl font-mono text-brand-blue font-semibold uppercase tracking-wider"
          >
            EEE Undergraduate | VLSI | Semiconductor Chip Design
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mt-8"
          >
            <a 
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold flex items-center gap-2 shadow-sm transition-all font-mono text-sm border border-brand-blue/30"
            >
              <Cpu className="w-4 h-4" /> View Projects
            </a>
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 transition-all font-mono text-sm border border-slate-200 shadow-sm"
            >
              <Send className="w-4 h-4 text-slate-500" /> Let's Connect
            </a>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          >
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </motion.div>
        </div>
      </section>

      {/* --- ABOUT SECTION (BENTO GRID) --- */}
      <section id="about" className="relative py-20 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">About Me</h2>
            <div className="h-1 w-12 bg-brand-blue mx-auto mt-2 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Bio Card (Large - Span 2 Columns) */}
            <BentoCard colSpan="col-span-1 lg:col-span-2">
              <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
                <Cpu className="w-5 h-5" /> Who I Am
              </h3>
              <div className="mt-4 text-slate-600 space-y-4 text-sm leading-relaxed">
                <p>
                  I am an Electrical and Electronic Engineering undergraduate driven by the fusion of
                  <strong> Semiconductor Chip Design</strong>, <strong>VLSI Systems</strong>, and <strong>Analog Circuit Engineering</strong>.
                </p>
                <p>
                  My research and work bridge the gap between material semiconductor physics and structural logic designs. I enjoy designing efficient analog schematics, laying out silicon paths, and compiling logic gates using professional EDA suites like <strong>Cadence Virtuoso</strong>, <strong>HSpice</strong>, and <strong>Verilog</strong> compilers.
                </p>
              </div>
            </BentoCard>

            {/* Focus Card */}
            <BentoCard>
              <div className="h-10 w-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-4">
                <Cpu className="w-5 h-5 text-brand-blue" />
              </div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider font-mono">Core Focus</h4>
              <p className="text-lg font-bold text-slate-800 mt-1">VLSI Layout & CMOS Design</p>
              <p className="text-xs text-slate-500 mt-2 font-mono leading-relaxed">
                Specializing in micro-level transistor architectures, analog integrated circuits, and physical chip layout rules.
              </p>
            </BentoCard>

            {/* Education Card */}
            <BentoCard>
              <div className="h-10 w-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-4">
                <GraduationCap className="w-5 h-5 text-brand-blue" />
              </div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider font-mono">Education</h4>
              <p className="text-base font-bold text-slate-800 mt-1">Varendra University</p>
              <p className="text-xs text-slate-600 mt-0.5">B.Sc. in EEE (CGPA 3.92/4.00)</p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono leading-relaxed">
                Engaged in deep study of integrated circuit engineering, DSP, control networks, and power systems.
              </p>
            </BentoCard>

            {/* Location Card */}
            <BentoCard>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-brand-green/10 border border-brand-green/25 flex items-center justify-center text-brand-green mb-4">
                    <MapPin className="w-5 h-5 text-brand-green" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider font-mono">Location</h4>
                  <p className="text-base font-bold text-slate-800 mt-1">Rajshahi, Bangladesh</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 uppercase tracking-wide">
                    Open to Work
                  </span>
                </div>
              </div>
            </BentoCard>

            {/* Tech Stack Scroller Card */}
            <BentoCard>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider font-mono">Technical Toolbox</h4>
              <div className="relative mt-5 overflow-hidden w-full h-16 flex items-center bg-slate-50 border border-slate-200/60 rounded-xl">
                <div className="tech-track gap-8 px-4">
                  {/* Render set twice for loop effect */}
                  {[...techStack, ...techStack, ...techStack].map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 shrink-0 px-4 py-2 bg-white border border-slate-200 text-slate-750 font-mono text-xs text-slate-700">
                      <i className={`${tech.icon} text-lg`}></i>
                      <span>{tech.name}</span>
                    </div>
                  ))}
                </div>
                {/* Side overlays to blur scroll edges */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white/95 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/95 to-transparent pointer-events-none"></div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="relative py-20 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Projects</h2>
            <div className="h-1 w-12 bg-brand-blue mx-auto mt-2 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))
            ) : (
              <p className="text-center text-slate-500 font-mono text-sm col-span-2 py-12">
                No projects loaded. Seeding database...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- RESUME SECTION (EXPERIENCE / EDUCATION / CERTS) --- */}
      <section id="resume" className="relative py-20 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Resume</h2>
            <div className="h-1 w-12 bg-brand-blue mx-auto mt-2 rounded"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Resume Tabs Toggle */}
            <div className="flex justify-center border-b border-slate-200 mb-8">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveResumeTab("experience")}
                  className={`py-3 px-4 text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeResumeTab === "experience"
                      ? "border-brand-blue text-brand-blue"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Experience
                </button>
                <button
                  onClick={() => setActiveResumeTab("education")}
                  className={`py-3 px-4 text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeResumeTab === "education"
                      ? "border-brand-blue text-brand-blue"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Education
                </button>
                <button
                  onClick={() => setActiveResumeTab("certificates")}
                  className={`py-3 px-4 text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeResumeTab === "certificates"
                      ? "border-brand-blue text-brand-blue"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Award className="w-4 h-4" /> Certificates
                </button>
              </div>
            </div>

            {/* Resume Tab Panels */}
            <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-md">
              <AnimatePresence mode="wait">
                {activeResumeTab === "experience" && (
                  <motion.div
                    key="exp"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div>
                      <h3 className="text-md font-bold text-brand-cyan flex items-center gap-2 uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2">
                        <Briefcase className="w-4 h-4" /> Professional Work
                      </h3>
                      <div className="space-y-6">
                        {workExp.map((item) => (
                          <div key={item.id} className="relative pl-5 border-l-2 border-slate-200 hover:border-brand-cyan transition-colors">
                            <div className="absolute w-2 h-2 rounded-full bg-brand-cyan -left-[5px] top-[7px]" />
                            <h4 className="text-base font-bold text-slate-800">{item.role}</h4>
                            <h5 className="text-sm text-slate-600 font-semibold font-mono">{item.company}</h5>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60 font-mono inline-block mt-1">{item.date}</span>
                            <ul className="text-xs text-slate-500 mt-2 list-disc pl-4 space-y-1">
                              {item.details.map((detail, dIdx) => (
                                <li key={dIdx}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-bold text-brand-green flex items-center gap-2 uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2">
                        <HelpingHand className="w-4 h-4" /> Leadership & Volunteering
                      </h3>
                      <div className="space-y-6">
                        {volunteerExp.map((item) => (
                          <div key={item.id} className="relative pl-5 border-l-2 border-slate-200 hover:border-brand-green transition-colors">
                            <div className="absolute w-2 h-2 rounded-full bg-brand-green -left-[5px] top-[7px]" />
                            <h4 className="text-base font-bold text-slate-800">{item.role}</h4>
                            <h5 className="text-sm text-slate-600 font-semibold font-mono">{item.company}</h5>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60 font-mono inline-block mt-1">{item.date}</span>
                            <ul className="text-xs text-slate-500 mt-2 list-disc pl-4 space-y-1">
                              {item.details.map((detail, dIdx) => (
                                <li key={dIdx}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeResumeTab === "education" && (
                  <motion.div
                    key="edu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {education.map((item) => (
                      <div key={item.id} className="relative pl-6 border-l-2 border-slate-200 hover:border-brand-blue transition-colors">
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-brand-blue -left-[6px] top-[6px]" />
                        <h4 className="text-lg font-bold text-slate-800">{item.degree}</h4>
                        <h5 className="text-sm text-slate-600 font-semibold font-mono">{item.institution}</h5>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60 font-mono">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.details}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeResumeTab === "certificates" && (
                  <motion.div
                    key="certs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {certificates.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50/50 border border-slate-200/80 rounded-xl hover:border-brand-blue/20 transition-all flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h4>
                          <span className="text-[10px] text-brand-blue font-mono font-semibold">{item.issuer} | {item.date}</span>
                          <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* --- RECENT ACTIVITY SECTION --- */}
      <section id="activity" className="relative py-20 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Recent Activity</h2>
            <div className="h-1 w-12 bg-brand-blue mx-auto mt-2 rounded"></div>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {activities.map((act, idx) => {
              // Hide everything beyond index 2 if not expanded
              const isHidden = !activitiesExpanded && idx >= 3;
              if (isHidden) return null;

              const activityIconPath = act.image ? `/activity/${act.image}` : null;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  key={act.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm hover:border-brand-blue/15 transition-all"
                >
                  <div className="flex-grow pr-4">
                    <h3 className="text-base font-bold text-slate-800">{act.title}</h3>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1">{act.desc}</p>
                    <span className="text-[9px] font-mono text-slate-400 block mt-2 uppercase tracking-wide">
                      Timeframe: {act.date}
                    </span>
                  </div>
                  {activityIconPath && (
                    <div className="relative group mt-3 sm:mt-0 w-24 h-16 rounded-lg border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center p-1 cursor-zoom-in">
                      <img 
                        src={activityIconPath} 
                        alt={act.title} 
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Zoom Pop-up Overlay */}
                      <div className="absolute right-0 bottom-full mb-3 w-[75vw] sm:w-[420px] p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 pointer-events-none opacity-0 scale-95 origin-bottom-right transition-all duration-200 transform group-hover:opacity-100 group-hover:scale-100">
                        <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                          <img 
                            src={activityIconPath} 
                            alt={act.title} 
                            className="w-full h-auto max-h-72 object-contain"
                          />
                        </div>
                        <div className="mt-2 text-center px-1 pb-1">
                          <p className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider">{act.title}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-0.5">Timeframe: {act.date}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {activities.length > 3 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setActivitiesExpanded(!activitiesExpanded)}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-semibold border border-slate-200 hover:border-slate-355 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {activitiesExpanded ? (
                    <>
                      <Minus className="w-3.5 h-3.5" /> Show Less
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Show More
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE LABS SECTION --- */}
      <section id="labs" className="relative py-20 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <Binary className="w-8 h-8 text-brand-blue" />
              Interactive VLSI & Semiconductor Labs
            </h2>
            <p className="text-sm text-slate-500 font-mono mt-1">
              Explore dynamic microelectronic device simulations directly in the browser
            </p>
            <div className="h-1 w-12 bg-brand-blue mx-auto mt-3 rounded"></div>
          </div>

          {/* Labs Tab Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200/80 shadow-sm">
              <button
                onClick={() => setActiveLabTab("mosfet")}
                className={`px-5 py-2 rounded-full text-xs font-mono font-bold transition-all ${
                  activeLabTab === "mosfet"
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                MOSFET Physics Simulator
              </button>
              <button
                onClick={() => setActiveLabTab("cmos")}
                className={`px-5 py-2 rounded-full text-xs font-mono font-bold transition-all ${
                  activeLabTab === "cmos"
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                CMOS Transistor Gate Simulator
              </button>
            </div>
          </div>

          {/* Dynamic Lab Container */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeLabTab === "mosfet" ? (
                <motion.div
                  key="mosfet"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <MosfetSim />
                </motion.div>
              ) : (
                <motion.div
                  key="cmos"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <CmosSim />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION & CONNECT HUB --- */}
      <section id="contact" className="relative py-20 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Let's Connect</h2>
            <div className="h-1 w-12 bg-brand-blue mx-auto mt-2 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Left Connect Hub */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <a 
                href="mailto:emonrasedul@gmail.com" 
                className="flex items-center gap-4 p-5 rounded-2xl bg-red-50/60 hover:bg-red-100/80 border border-red-100/85 hover:border-red-300 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center text-red-650 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 font-mono uppercase tracking-wider">Email Me</h3>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">emonrasedul@gmail.com</p>
                </div>
              </a>

              <a 
                href="https://github.com/rashedulemon" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-4 p-5 rounded-2xl bg-slate-100/60 hover:bg-slate-200/80 border border-slate-200/80 hover:border-slate-400 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform">
                  <i className="fab fa-github text-xl text-slate-700"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 font-mono uppercase tracking-wider">GitHub</h3>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">@rashedulemon</p>
                </div>
              </a>

              <a 
                href="https://www.linkedin.com/in/rashedulemon/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-100/80 hover:border-blue-300 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-650 group-hover:scale-105 transition-transform">
                  <i className="fab fa-linkedin-in text-xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 font-mono uppercase tracking-wider">LinkedIn</h3>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">in/rashedulemon</p>
                </div>
              </a>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col justify-center">
              <h3 className="text-lg font-bold text-slate-800 font-mono uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Send a Direct Message
              </h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name"
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 font-mono transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 font-mono transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Message</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Hello Emon! Let's talk about chip design."
                    rows="4"
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 font-mono transition-all resize-none"
                    required
                  ></textarea>
                </div>

                {formStatus.text && (
                  <div className={`p-3 rounded-lg text-xs font-mono font-semibold border ${
                    formStatus.type === "success" 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {formStatus.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-mono text-xs font-bold text-white uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting 
                      ? "bg-brand-blue/50 cursor-not-allowed" 
                      : "bg-brand-blue hover:bg-brand-blue/95 shadow-sm hover:shadow-md"
                  }`}
                >
                  <Send className="w-4 h-4" /> {isSubmitting ? "Sending..." : "Submit Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative pt-8 pb-24 z-10 border-t border-slate-200/80">
        <div className="container mx-auto px-6 text-left text-xs text-slate-500 font-mono leading-relaxed">
          <p>&copy; {new Date().getFullYear()} Md. Rashedul Islam Emon. All rights reserved.</p>
          <p className="mt-3">
            <a href="/#/admin" className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors duration-200 font-mono">⚙ admin</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
