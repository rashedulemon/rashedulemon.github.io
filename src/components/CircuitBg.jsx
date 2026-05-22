

export default function CircuitBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#f8fafc]"></div>
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]" 
        style={{
          backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      ></div>

      {/* SVG PCB Circuit Traces */}
      <svg 
        className="absolute w-full h-full min-h-[500px] opacity-25" 
        viewBox="0 0 1440 800" 
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="trace-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="50%" stopColor="rgba(59,130,246,0.3)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>

        {/* Trace 1 - Top Left to Center */}
        <path 
          className="circuit-trace" 
          d="M -20,100 L 250,100 L 320,170 L 600,170" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1.5" 
          opacity="0.3" 
        />
        <circle cx="600" cy="170" r="3.5" fill="#3b82f6" className="animate-pulse" />

        {/* Trace 2 - Bottom Right to Mid Right */}
        <path 
          className="circuit-trace" 
          style={{ animationDelay: "1.5s" }}
          d="M 1460,700 L 1200,700 L 1130,630 L 950,630" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1.5" 
          opacity="0.3" 
        />
        <circle cx="950" cy="630" r="3.5" fill="#3b82f6" className="animate-pulse" />

        {/* Trace 3 - Bottom Left to Mid Bottom */}
        <path 
          className="circuit-trace" 
          style={{ animationDelay: "3s" }}
          d="M -20,680 L 150,680 L 220,610 L 400,610" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1.5" 
          opacity="0.3" 
        />
        <circle cx="400" cy="610" r="3.5" fill="#3b82f6" className="animate-pulse" />

        {/* Trace 4 - Top Right to Center Top */}
        <path 
          className="circuit-trace" 
          style={{ animationDelay: "4.5s" }}
          d="M 1460,150 L 1150,150 L 1080,220 L 800,220" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1.5" 
          opacity="0.3" 
        />
        <circle cx="800" cy="220" r="3.5" fill="#3b82f6" className="animate-pulse" />
      </svg>
      
      {/* Top and Bottom Shadows to blend with background */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#f8fafc] to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
    </div>
  );
}
