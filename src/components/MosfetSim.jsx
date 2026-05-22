import { useState, useEffect, useRef } from "react";
import { Zap, Play, Pause } from "lucide-react";

export default function MosfetSim() {
  const [vgs, setVgs] = useState(1.8); // 0V to 5V
  const [vds, setVds] = useState(1.5); // 0V to 5V
  const [isPlaying, setIsPlaying] = useState(true);
  
  const Vth = 1.0; // Threshold Voltage
  const k = 2.0; // Transconductance parameter (mA/V^2)

  // Calculate Drain Current ID (in mA)
  let id = 0;
  let region;

  if (vgs < Vth) {
    id = 0;
    region = "Cut-off (No conduction)";
  } else {
    const voverdrive = vgs - Vth;
    if (vds < voverdrive) {
      // Linear / Triode region
      id = k * (voverdrive * vds - 0.5 * vds * vds);
      region = "Linear / Triode Region";
    } else {
      // Saturation region
      id = 0.5 * k * voverdrive * voverdrive;
      region = "Saturation (Pinch-off)";
    }
  }

  // Animation ticks for electron flow
  const [electrons, setElectrons] = useState([]);
  const animationRef = useRef();

  useEffect(() => {
    if (!isPlaying || id === 0) return;
    
    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setElectrons((prev) => {
        // Update position of existing electrons
        let updated = prev.map((el) => {
          // Speed depends on ID
          const speed = 100 + id * 30; // pixels per sec
          return { ...el, x: el.x + speed * delta };
        });

        // Filter out those that reached the drain
        updated = updated.filter((el) => el.x < 360);

        // Periodically spawn new ones at source (x = 100)
        // Rate is proportional to ID
        const spawnChance = id * 5 * delta; // arbitrary scaling
        if (Math.random() < spawnChance && updated.length < 35) {
          // Y coordinate within the inversion layer channel (y ~ 142)
          updated.push({
            id: Math.random(),
            x: 120,
            y: 142 + (Math.random() - 0.5) * 6 * Math.min(1.0, (vgs - Vth) / 2)
          });
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, id, vgs, vds]);

  // Clear electrons when current stops
  useEffect(() => {
    if (id === 0) {
      setElectrons([]);
    }
  }, [id]);

  // Generate data points for ID vs VDS curve (VGS held constant)
  const getCurvePoints = () => {
    const points = [];
    const step = 0.1;
    const currentVgs = vgs;
    
    for (let currentVds = 0; currentVds <= 5.0; currentVds += step) {
      let tempId = 0;
      if (currentVgs >= Vth) {
        const voverdrive = currentVgs - Vth;
        if (currentVds < voverdrive) {
          tempId = k * (voverdrive * currentVds - 0.5 * currentVds * currentVds);
        } else {
          tempId = 0.5 * k * voverdrive * voverdrive;
        }
      }
      // Map to plot coordinates: VDS goes from 0..5 (x: 40..280), ID goes from 0..12 (y: 160..20)
      const x = 40 + (currentVds / 5.0) * 240;
      const y = 160 - (tempId / 12.0) * 140;
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getPinchOffPoint = () => {
    if (vgs < Vth) return null;
    const vod = vgs - Vth;
    // Saturation point VDS = VGS - Vth
    const x = 40 + (Math.min(vod, 5.0) / 5.0) * 240;
    const y = 160 - ((0.5 * k * vod * vod) / 12.0) * 140;
    return { x, y };
  };

  const pinchPoint = getPinchOffPoint();

  return (
    <div className="glass-card p-6 rounded-2xl w-full max-w-4xl mx-auto shadow-xl border border-white/5 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-cyan flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-cyan animate-pulse" />
            MOSFET Semiconductor Physics Simulator
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Visualizing Electron Inversion, Pinch-off, and Drain Current ($I_D$)
          </p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
            vgs < Vth ? "bg-red-500/20 text-red-400 border border-red-500/30" :
            vds < (vgs - Vth) ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
            "bg-green-500/20 text-green-400 border border-green-500/30"
          }`}>
            Region: {region}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-white/10 transition-colors"
            title={isPlaying ? "Pause Carrier Animation" : "Play Carrier Animation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Parameters Sliders & Readouts */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-[#0e1423] p-4 rounded-xl border border-white/5">
          <h4 className="text-sm font-bold text-gray-300 border-b border-white/5 pb-2 uppercase tracking-wider font-mono">
            Control Variables
          </h4>

          {/* Slider VGS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Gate-Source (V_gs):</span>
              <span className="text-brand-cyan font-bold">{vgs.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={vgs}
              onChange={(e) => setVgs(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-gray-800 accent-brand-cyan cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>0V</span>
              <span className="text-red-400">Vth = 1.0V</span>
              <span>5V</span>
            </div>
          </div>

          {/* Slider VDS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Drain-Source (V_ds):</span>
              <span className="text-brand-green font-bold">{vds.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={vds}
              onChange={(e) => setVds(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-gray-800 accent-brand-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>0V</span>
              <span>5V</span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2 font-mono">
            <h4 className="text-xs font-semibold text-gray-400">Calculated Metrics</h4>
            <div className="flex justify-between text-xs py-1 px-2 rounded bg-gray-900/50">
              <span className="text-gray-500">Overdrive (Vgs - Vth):</span>
              <span className="text-gray-300 font-semibold">
                {vgs >= Vth ? `${(vgs - Vth).toFixed(2)} V` : "0.00 V"}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1 px-2 rounded bg-gray-900/50">
              <span className="text-gray-500">Drain Current (Id):</span>
              <span className={`font-bold ${id > 0 ? "text-brand-cyan" : "text-gray-500"}`}>
                {id.toFixed(3)} mA
              </span>
            </div>
          </div>
        </div>

        {/* Center: Semiconductor Cross-section Visualizer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative border border-white/10 rounded-xl overflow-hidden bg-[#070b13] p-4 flex flex-col items-center">
            <span className="absolute top-2 left-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              MOSFET Device Physics Cross-section
            </span>
            
            {/* SVG Cross-section */}
            <svg viewBox="0 0 460 220" className="w-full h-auto mt-4">
              {/* P-Substrate */}
              <rect x="20" y="80" width="420" height="120" fill="#1e2230" rx="4" />
              <text x="230" y="185" fill="#a1a1aa" fontSize="11" textAnchor="middle" fontFamily="monospace">
                p-type Substrate
              </text>

              {/* Source region (N+) */}
              <rect x="50" y="80" width="70" height="40" fill="#2d3748" rx="2" stroke="#3182ce" strokeWidth="1" />
              <text x="85" y="105" fill="#63b3ed" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                n+
              </text>
              <text x="85" y="65" fill="#90cdf4" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Source
              </text>

              {/* Drain region (N+) */}
              <rect x="340" y="80" width="70" height="40" fill="#2d3748" rx="2" stroke="#3182ce" strokeWidth="1" />
              <text x="375" y="105" fill="#63b3ed" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                n+
              </text>
              <text x="375" y="65" fill="#90cdf4" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Drain
              </text>

              {/* Gate Oxide (SiO2) */}
              <rect x="110" y="72" width="240" height="8" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="1" />
              <text x="230" y="64" fill="#a0aec0" fontSize="8" textAnchor="middle" fontFamily="monospace">
                SiO2 Oxide
              </text>

              {/* Gate Metal/Polysilicon Contact */}
              <rect x="130" y="52" width="200" height="20" fill="#4a5568" rx="2" stroke="#718096" strokeWidth="1" />
              <text x="230" y="66" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                GATE (Vgs)
              </text>

              {/* Channel / Inversion layer region */}
              {/* Width: 120 to 340 (length: 220), Height centered at y=80 */}
              {vgs >= Vth && (
                <path
                  d={`M 120,80 
                      L 340,80 
                      L 340,${80 + 15 * Math.max(0.1, Math.min(1.0, (vgs - Vth - Math.min(vds, vgs - Vth)) / 4))} 
                      C 280,${80 + 15 * Math.max(0.1, (vgs - Vth) / 4)} 180,${80 + 18 * Math.max(0.1, (vgs - Vth) / 4)} 120,${80 + 20 * Math.max(0.1, (vgs - Vth) / 4)} 
                      Z`}
                  fill="url(#channelGlow)"
                  className="transition-all duration-300"
                />
              )}

              {/* Animated Electrons */}
              {isPlaying && electrons.map((el) => (
                <circle
                  key={el.id}
                  cx={el.x}
                  cy={el.y}
                  r="2.5"
                  fill="#39ff14"
                  className="shadow-md"
                  style={{ filter: "drop-shadow(0 0 2px #39ff14)" }}
                />
              ))}

              {/* Electrodes / Contacts */}
              {/* Source wire */}
              <line x1="85" y1="80" x2="85" y2="40" stroke="#718096" strokeWidth="3" />
              <line x1="50" y1="40" x2="120" y2="40" stroke="#718096" strokeWidth="3" />
              {/* Drain wire */}
              <line x1="375" y1="80" x2="375" y2="40" stroke="#718096" strokeWidth="3" />
              <line x1="340" y1="40" x2="410" y2="40" stroke="#718096" strokeWidth="3" />

              {/* Voltage signs indicators */}
              {vgs >= Vth && (
                <text x="230" y="94" fill="#00f0ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Inversion Channel (e- Accumulation)
                </text>
              )}
              {vgs >= Vth && vds >= (vgs - Vth) && (
                <text x="325" y="115" fill="#f6ad55" fontSize="8" textAnchor="end" fontFamily="monospace">
                  Pinch-Off Point
                </text>
              )}

              {/* Gradients */}
              <defs>
                <linearGradient id="channelGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.6" />
                  <stop 
                    offset="100%" 
                    stopColor="#00f0ff" 
                    stopOpacity={vds >= (vgs - Vth) ? "0.08" : "0.5"} 
                  />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Side Plot: Live ID vs VDS Graph */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13] p-4 flex flex-col">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              Characteristic Curves: Id vs Vds (Constant Vgs)
            </span>
            
            <div className="flex justify-center items-center">
              <svg viewBox="0 0 320 180" className="w-full max-w-md h-auto">
                {/* Background grid */}
                <line x1="40" y1="20" x2="280" y2="20" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="40" y1="55" x2="280" y2="55" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="40" y1="90" x2="280" y2="90" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="40" y1="125" x2="280" y2="125" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />

                <line x1="88" y1="20" x2="88" y2="160" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="136" y1="20" x2="136" y2="160" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="184" y1="20" x2="184" y2="160" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="232" y1="20" x2="232" y2="160" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />

                {/* Axes */}
                <line x1="40" y1="160" x2="290" y2="160" stroke="#4b5563" strokeWidth="1.5" /> {/* Vds Axis */}
                <line x1="40" y1="15" x2="40" y2="160" stroke="#4b5563" strokeWidth="1.5" />  {/* Id Axis */}
                
                {/* Labels */}
                <text x="290" y="174" fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="monospace">
                  Vds (V)
                </text>
                <text x="15" y="25" fill="#9ca3af" fontSize="9" writingMode="tb" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 15 25)">
                  Id (mA)
                </text>
                
                {/* Tick numbers */}
                {/* VDS ticks: 0, 1, 2, 3, 4, 5 */}
                <text x="40" y="170" fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">0</text>
                <text x="88" y="170" fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">1</text>
                <text x="136" y="170" fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">2</text>
                <text x="184" y="170" fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">3</text>
                <text x="232" y="170" fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">4</text>
                <text x="280" y="170" fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">5</text>

                {/* ID ticks: 0, 4, 8, 12 */}
                <text x="32" y="163" fill="#4b5563" fontSize="8" textAnchor="end" fontFamily="monospace">0</text>
                <text x="32" y="128" fill="#4b5563" fontSize="8" textAnchor="end" fontFamily="monospace">3</text>
                <text x="32" y="93" fill="#4b5563" fontSize="8" textAnchor="end" fontFamily="monospace">6</text>
                <text x="32" y="58" fill="#4b5563" fontSize="8" textAnchor="end" fontFamily="monospace">9</text>
                <text x="32" y="23" fill="#4b5563" fontSize="8" textAnchor="end" fontFamily="monospace">12</text>

                {/* Curve plotting */}
                {vgs >= Vth && (
                  <polyline
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                    points={getCurvePoints()}
                    className="transition-all duration-200"
                  />
                )}

                {/* Saturation boundary (dashed line VDS = VGS - Vth) */}
                {pinchPoint && (
                  <line
                    x1={pinchPoint.x}
                    y1={pinchPoint.y}
                    x2={pinchPoint.x}
                    y2="160"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="3"
                  />
                )}
                {pinchPoint && (
                  <text
                    x={pinchPoint.x}
                    y={Math.max(35, pinchPoint.y - 12)}
                    fill="#f59e0b"
                    fontSize="7"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    Vds = Vgs - Vth
                  </text>
                )}

                {/* Operating Point marker */}
                {vgs >= Vth && (
                  <circle
                    cx={40 + (vds / 5.0) * 240}
                    cy={160 - (id / 12.0) * 140}
                    r="5"
                    fill="#39ff14"
                    className="animate-ping"
                    style={{ transformOrigin: `${40 + (vds / 5.0) * 240}px ${160 - (id / 12.0) * 140}px` }}
                  />
                )}
                {vgs >= Vth && (
                  <circle
                    cx={40 + (vds / 5.0) * 240}
                    cy={160 - (id / 12.0) * 140}
                    r="4"
                    fill="#39ff14"
                    stroke="#0b0f19"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
