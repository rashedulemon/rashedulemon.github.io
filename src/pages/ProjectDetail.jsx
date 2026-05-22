import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProjects } from "../firebase/db";
import CircuitBg from "../components/CircuitBg";
import { ArrowLeft, Cpu, BadgeAlert, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom inline parser to avoid dependency conflicts on React 19
function parseInline(text, onImageClick) {
  if (!text) return [];

  let parts = [{ text: text, type: "text" }];

  // 1. Parse image tags: `![alt](url)`
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return [part];
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const result = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: part.text.substring(lastIndex, match.index), type: "text" });
      }
      result.push({ alt: match[1], src: match[2], type: "image" });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      result.push({ text: part.text.substring(lastIndex), type: "text" });
    }
    return result;
  });

  // 2. Parse links: `[label](url)`
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return [part];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const result = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: part.text.substring(lastIndex, match.index), type: "text" });
      }
      result.push({ label: match[1], url: match[2], type: "link" });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      result.push({ text: part.text.substring(lastIndex), type: "text" });
    }
    return result;
  });

  // 3. Parse bold text: `**text**`
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return [part];
    const regex = /\*\*([^*]+)\*\*/g;
    const result = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: part.text.substring(lastIndex, match.index), type: "text" });
      }
      result.push({ text: match[1], type: "bold" });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      result.push({ text: part.text.substring(lastIndex), type: "text" });
    }
    return result;
  });

  // 4. Parse inline code: `` `code` ``
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return [part];
    const regex = /`([^`]+)`/g;
    const result = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: part.text.substring(lastIndex, match.index), type: "text" });
      }
      result.push({ text: match[1], type: "code" });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      result.push({ text: part.text.substring(lastIndex), type: "text" });
    }
    return result;
  });

  return parts.map((part, i) => {
    if (part.type === "image") {
      const src = part.src.startsWith("http") ? part.src : `/images/${part.src}`;
      return (
        <span key={i} className="inline-block my-2 mx-1">
          <img 
            src={src} 
            alt={part.alt} 
            className="rounded-lg border border-slate-200 shadow-sm max-h-48 object-contain cursor-zoom-in inline-block hover:scale-[1.01] transition-transform duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (onImageClick) onImageClick(src, part.alt);
            }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=900";
            }}
          />
        </span>
      );
    }
    if (part.type === "link") {
      return (
        <a 
          key={i} 
          href={part.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-brand-blue hover:underline font-semibold"
        >
          {part.label}
        </a>
      );
    }
    if (part.type === "bold") {
      return <strong key={i} className="font-bold text-slate-900">{part.text}</strong>;
    }
    if (part.type === "code") {
      return <code key={i} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200/80">{part.text}</code>;
    }
    return part.text;
  });
}

function renderParagraphLines(text, onImageClick) {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {parseInline(line, onImageClick)}
    </span>
  ));
}

function MarkdownRenderer({ text, onImageClick }) {
  if (!text) return null;

  const normalizedText = text.replace(/\r\n/g, "\n");
  const blocks = normalizedText.split(/\n\n+/);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // 1. Headings
        if (trimmedBlock.startsWith("### ")) {
          return (
            <h3 key={index} className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wide mt-6 mb-2">
              {parseInline(trimmedBlock.slice(4), onImageClick)}
            </h3>
          );
        }
        if (trimmedBlock.startsWith("## ")) {
          return (
            <h2 key={index} className="text-base font-bold text-slate-800 mt-8 mb-3 border-b border-slate-200/80 pb-1">
              {parseInline(trimmedBlock.slice(3), onImageClick)}
            </h2>
          );
        }
        if (trimmedBlock.startsWith("# ")) {
          return (
            <h1 key={index} className="text-lg font-extrabold text-slate-900 mt-10 mb-4">
              {parseInline(trimmedBlock.slice(2), onImageClick)}
            </h1>
          );
        }

        // 2. Bullet list block
        const lines = trimmedBlock.split("\n");
        const isBulletList = lines.every((line) => /^\s*[-*•]\s+/.test(line));
        if (isBulletList) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-1.5 text-slate-650 my-3">
              {lines.map((line, lIdx) => {
                const content = line.replace(/^\s*[-*•]\s+/, "");
                return <li key={lIdx}>{parseInline(content, onImageClick)}</li>;
              })}
            </ul>
          );
        }

        // 3. Numbered list block
        const isNumberedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));
        if (isNumberedList) {
          return (
            <ol key={index} className="list-decimal pl-5 space-y-1.5 text-slate-650 my-3">
              {lines.map((line, lIdx) => {
                const content = line.replace(/^\s*\d+\.\s+/, "");
                return <li key={lIdx}>{parseInline(content, onImageClick)}</li>;
              })}
            </ol>
          );
        }

        // 4. Blockquote
        const isBlockquote = lines.every((line) => line.startsWith(">"));
        if (isBlockquote) {
          const content = lines.map((line) => line.replace(/^>\s?/, "")).join("\n");
          return (
            <blockquote key={index} className="border-l-4 border-slate-350 pl-4 py-1.5 italic text-slate-500 my-4 bg-slate-50 rounded-r-xl">
              {renderParagraphLines(content, onImageClick)}
            </blockquote>
          );
        }

        // 5. Code block
        if (trimmedBlock.startsWith("```") && trimmedBlock.endsWith("```")) {
          const content = trimmedBlock.slice(3, -3).trim();
          const firstLineBreak = content.indexOf("\n");
          let codeText = content;
          let language = "";
          if (firstLineBreak !== -1) {
            const potentialLang = content.slice(0, firstLineBreak).trim();
            if (/^[a-zA-Z0-9_-]+$/.test(potentialLang)) {
              language = potentialLang;
              codeText = content.slice(firstLineBreak + 1);
            }
          }
          return (
            <pre key={index} className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 shadow-sm border border-slate-800">
              {language && (
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-2 border-b border-slate-800/60 pb-1 select-none">
                  {language}
                </div>
              )}
              <code>{codeText}</code>
            </pre>
          );
        }

        // 6. Standalone image block
        const imageMatch = trimmedBlock.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
          const alt = imageMatch[1];
          const rawSrc = imageMatch[2];
          const src = rawSrc.startsWith("http") ? rawSrc : `/images/${rawSrc}`;
          return (
            <div key={index} className="my-6 flex flex-col items-center gap-2">
              <div 
                className="relative group overflow-hidden rounded-xl border border-slate-200 bg-white max-h-[450px] cursor-zoom-in"
                onClick={() => onImageClick(src, alt)}
              >
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full max-h-[450px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=900";
                  }}
                />
              </div>
              {alt && <span className="text-[11px] text-slate-400 font-mono italic">{alt}</span>}
            </div>
          );
        }

        // 7. Standard text block
        return (
          <p key={index} className="text-slate-650 leading-relaxed font-normal">
            {renderParagraphLines(trimmedBlock, onImageClick)}
          </p>
        );
      })}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(null);

  // Close Zoom Modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setZoomImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-brand-blue hover:text-brand-blue/80 mb-8 border border-slate-200 hover:border-slate-355 bg-white/80 px-4 py-2 rounded-full transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shell
        </Link>

        <motion.article 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl overflow-hidden shadow-lg border border-slate-200/50"
        >
          {/* Cover Image with Click to Zoom */}
          <div 
            className="h-64 md:h-96 w-full relative overflow-hidden group cursor-zoom-in"
            onClick={() => setZoomImage({ src: imageUrl, alt: project.title })}
          >
            <img 
              src={imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-[1.02]"
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

            <div className="border-t border-slate-200/80 pt-6 font-normal text-sm text-slate-650 leading-relaxed">
              <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider mb-4">Technical Description & Architecture</h3>
              <MarkdownRenderer 
                text={project.details || project.desc} 
                onImageClick={(src, alt) => setZoomImage({ src, alt })} 
              />
            </div>
          </div>
        </motion.article>
      </div>

      {/* Click-to-Zoom Backdrop Blur Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-900 text-white rounded-full border border-slate-800/80 transition-colors shadow-lg z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <img 
                src={zoomImage.src} 
                alt={zoomImage.alt} 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20 select-none cursor-zoom-out"
                onClick={() => setZoomImage(null)}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=900";
                }}
              />
              {zoomImage.alt && (
                <p className="text-white/90 font-mono text-xs mt-3 bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800 shadow-md">
                  {zoomImage.alt}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="relative py-8 z-10 border-t border-slate-200/80 bg-white">
        <div className="container mx-auto px-6 text-center text-xs text-slate-400 font-mono leading-relaxed">
          <p>&copy; {new Date().getFullYear()} Md. Rashedul Islam Emon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
