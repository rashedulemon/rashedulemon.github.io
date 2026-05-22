import { motion } from "framer-motion";

export default function BentoCard({ 
  children, 
  className = "", 
  colSpan = "col-span-1", 
  rowSpan = "row-span-1",
  hoverGlow = "hover:border-brand-cyan/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.07)]"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 ${colSpan} ${rowSpan} ${hoverGlow} ${className}`}
    >
      {children}
    </motion.div>
  );
}
