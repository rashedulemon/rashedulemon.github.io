import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectCard({ project }) {
  // Resolve image paths. Fallback to placeholder if missing.
  const imageUrl = project.image 
    ? (project.image.startsWith("http") ? project.image : `/images/${project.image}`)
    : "/images/placeholder.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col h-full rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-cyan/20 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,240,255,0.08)]"
    >
      {/* Background glow hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/0 via-brand-cyan/0 to-brand-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

      <Link to={`/project/${project.id}`} className="relative h-48 w-full overflow-hidden block z-10">
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=600&auto=format&fit=crop"; // Unsplash hardware fallback
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      </Link>

      <div className="flex flex-col flex-grow p-5 relative z-10">
        <Link to={`/project/${project.id}`}>
          <h3 className="text-lg font-bold text-gray-100 group-hover:text-brand-cyan transition-colors duration-200 flex items-center justify-between">
            {project.title}
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all" />
          </h3>
        </Link>
        
        <p className="text-sm text-gray-400 font-normal line-clamp-2 mt-2 leading-relaxed flex-grow">
          {project.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {project.tags && project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] font-mono border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer info / Outcome */}
        {project.outcome && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 text-brand-green text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
            <span className="font-semibold uppercase tracking-wider">{project.outcome}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
