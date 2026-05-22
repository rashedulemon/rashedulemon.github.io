import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProjects } from "../firebase/db";
import CircuitBg from "../components/CircuitBg";
import { ArrowLeft, Cpu, BadgeAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProject = async () => {
      setLoading(true);
      try {
        const projs = await fetchProjects();
        const found = projs.find((p) => p.id === id);
        setProject(found || null);
      } catch (err) {
        console.error("Error fetching project detail:", err);
      } finally {
        setLoading(false);
      }
    };
    getProject();
  }, [id]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-mono text-sm z-10">
        <CircuitBg />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <Cpu className="w-8 h-8 text-brand-blue animate-spin" />
          <span className="text-slate-650">Fetching device records...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-mono text-sm z-10">
        <CircuitBg />
        <div className="flex flex-col items-center gap-4 relative z-10 bg-white/80 p-8 rounded-2xl border border-slate-200/80 shadow-md max-w-md text-center">
          <BadgeAlert className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Record Not Found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">The project ID specified does not exist in the database archives.</p>
          </div>
          <Link to="/" className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg text-xs hover:bg-brand-blue/90 transition-all shadow-sm">
            Return to Core Shell
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = project.image 
    ? (project.image.startsWith("http") ? project.image : `/images/${project.image}`)
    : "/images/placeholder.jpg";

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 z-10">
      <CircuitBg />

      <div className="container mx-auto px-6 pt-24 pb-20 max-w-4xl relative z-10">
        <Link 
          to="/#projects" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-brand-blue hover:text-brand-blue/80 mb-8 border border-slate-200 hover:border-slate-350 bg-white/80 px-4 py-2 rounded-full transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shell
        </Link>

        <motion.article 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl overflow-hidden shadow-lg border border-slate-200/50"
        >
          {/* Cover Image */}
          <div className="h-64 md:h-96 w-full relative overflow-hidden">
            <img 
              src={imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=900"; // Fallback placeholder
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent"></div>
          </div>

          <div className="p-6 md:p-10 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">{project.title}</h1>
              
              <div className="flex flex-wrap gap-2 items-center mt-3">
                {project.tags && project.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2.5 py-0.5 rounded bg-slate-150 text-slate-650 text-xs font-mono border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {project.outcome && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-mono text-sm leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase text-green-600/70 block font-bold">PROJECT OUTCOME / VERIFICATION</span>
                  <span className="font-bold text-green-800">{project.outcome}</span>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200/80 pt-6 font-normal text-sm text-slate-600 leading-relaxed space-y-4">
              <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider mb-2">Technical Description & Architecture</h3>
              <p className="whitespace-pre-wrap">{project.details || project.desc}</p>
            </div>
          </div>
        </motion.article>
      </div>

      {/* FOOTER */}
      <footer className="relative py-8 z-10 border-t border-slate-200/80 bg-white">
        <div className="container mx-auto px-6 text-center text-xs text-slate-400 font-mono leading-relaxed">
          <p>&copy; {new Date().getFullYear()} Md. Rashedul Islam Emon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
