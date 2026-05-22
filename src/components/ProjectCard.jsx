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
      className="group relative flex flex-col h-full rounded-2xl bg-white border border-slate-200/80 hover:border-brand-blue/30 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <Link to={`/project/${project.id}`} className="relative h-48 w-full overflow-hidden block z-10">
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=600&auto=format&fit=crop"; // Unsplash hardware fallback
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100/30 via-transparent to-transparent"></div>
      </Link>

      <div className="flex flex-col flex-grow p-5 relative z-10">
        <Link to={`/project/${project.id}`}>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-blue transition-colors duration-200 flex items-center justify-between">
            {project.title}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
          </h3>
        </Link>
        
        <p className="text-sm text-slate-500 font-normal line-clamp-2 mt-2 leading-relaxed flex-grow">
          {project.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {project.tags && project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer info / Outcome */}
        {project.outcome && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-200/60 text-brand-green text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
            <span className="font-semibold uppercase tracking-wider">{project.outcome}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
