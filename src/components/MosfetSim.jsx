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
          // Y coordinate within the inversion layer channel (y ~ 72)
          updated.push({
            id: Math.random(),
            x: 120,
            y: 72 + (Math.random() - 0.5) * 4 * Math.min(1.0, (vgs - Vth) / 2)
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
      // Map to plot coordinates: VDS goes from 0..5 (x: 40..280), ID goes from 0..12 (y: 130..10)
      const x = 40 + (currentVds / 5.0) * 240;
      const y = 130 - (tempId / 12.0) * 120;
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getPinchOffPoint = () => {
    if (vgs < Vth) return null;
    const vod = vgs - Vth;
    // Saturation point VDS = VGS - Vth
    const x = 40 + (Math.min(vod, 5.0) / 5.0) * 240;
    const y = 130 - ((0.5 * k * vod * vod) / 12.0) * 120;
    return { x, y };
  };

  const pinchPoint = getPinchOffPoint();

  return (
    <div className="glass-card p-3 rounded-xl w-full max-w-4xl mx-auto shadow-sm flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-sm font-bold text-brand-blue flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
            MOSFET Semiconductor Physics Simulator
          </h3>
          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
            Visualizing Electron Inversion, Pinch-off, and Drain Current ($I_D$)
          </p>
        </div>
        <div className="mt-1 sm:mt-0 flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-semibold ${
            vgs < Vth ? "bg-red-50 text-red-700 border border-red-200" :
            vds < (vgs - Vth) ? "bg-amber-50 text-amber-700 border border-amber-200" :
            "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {region}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors"
            title={isPlaying ? "Pause Carrier Animation" : "Play Carrier Animation"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-stretch">
        {/* Column 1: Parameters Sliders & Readouts */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 justify-between">
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[9px] font-bold text-slate-600 border-b border-slate-200 pb-1 uppercase tracking-wider font-mono">
              Control Variables
            </h4>

            {/* Slider VGS */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">Vgs (Gate):</span>
                <span className="text-brand-blue font-bold">{vgs.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={vgs}
                onChange={(e) => setVgs(parseFloat(e.target.value))}
                className="w-full h-1 rounded bg-slate-200 accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                <span>0V</span>
                <span className="text-red-500 font-semibold">Vth=1.0V</span>
                <span>5V</span>
              </div>
            </div>

            {/* Slider VDS */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">Vds (Drain):</span>
                <span className="text-green-600 font-bold">{vds.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={vds}
                onChange={(e) => setVds(parseFloat(e.target.value))}
                className="w-full h-1 rounded bg-slate-200 accent-green-600 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                <span>0V</span>
                <span>5V</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 flex flex-col gap-1 font-mono">
            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Metrics</h4>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex flex-col p-1 rounded bg-slate-100/50 border border-slate-200/40 text-center">
                <span className="text-[8px] text-slate-400 uppercase tracking-tight">V_ov</span>
                <span className="text-[10px] text-slate-700 font-bold">
                  {vgs >= Vth ? `${(vgs - Vth).toFixed(1)}V` : "0.0V"}
                </span>
              </div>
              <div className="flex flex-col p-1 rounded bg-slate-100/50 border border-slate-200/40 text-center">
                <span className="text-[8px] text-slate-400 uppercase tracking-tight">Id</span>
                <span className={`text-[10px] font-bold ${id > 0 ? "text-brand-blue" : "text-slate-400"}`}>
                  {id.toFixed(2)} mA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Semiconductor Cross-section Visualizer */}
        <div className="col-span-1 lg:col-span-5 border border-slate-200 rounded-lg bg-slate-100/30 p-2.5 flex flex-col relative justify-between">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            Device Physics Cross-section
          </span>
          
          {/* SVG Cross-section */}
          <svg viewBox="0 0 460 170" className="w-full h-auto mt-1">
            {/* P-Substrate */}
            <rect x="20" y="70" width="420" height="85" fill="#f1f5f9" rx="4" />
            <text x="230" y="145" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="monospace">
              p-type Substrate
            </text>

            {/* Source region (N+) */}
            <rect x="50" y="70" width="70" height="30" fill="#cbd5e1" rx="2" stroke="#3b82f6" strokeWidth="1" />
            <text x="85" y="90" fill="#1e40af" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              n+
            </text>
            <text x="85" y="55" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">
              Source
            </text>

            {/* Drain region (N+) */}
            <rect x="340" y="70" width="70" height="30" fill="#cbd5e1" rx="2" stroke="#3b82f6" strokeWidth="1" />
            <text x="375" y="90" fill="#1e40af" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              n+
            </text>
            <text x="375" y="55" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">
              Drain
            </text>

            {/* Gate Oxide (SiO2) */}
            <rect x="110" y="63" width="240" height="7" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <text x="230" y="55" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
              SiO2 Oxide
            </text>

            {/* Gate Metal/Polysilicon Contact */}
            <rect x="130" y="45" width="200" height="18" fill="#94a3b8" rx="2" stroke="#475569" strokeWidth="1" />
            <text x="230" y="57" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              GATE (Vgs)
            </text>

            {/* Channel / Inversion layer region */}
            {/* Width: 120 to 340 (length: 220), Height centered at y=70 */}
            {vgs >= Vth && (
              <path
                d={`M 120,70 
                    L 340,70 
                    L 340,${70 + 12 * Math.max(0.1, Math.min(1.0, (vgs - Vth - Math.min(vds, vgs - Vth)) / 4))} 
                    C 280,${70 + 12 * Math.max(0.1, (vgs - Vth) / 4)} 180,${70 + 14 * Math.max(0.1, (vgs - Vth) / 4)} 120,${70 + 16 * Math.max(0.1, (vgs - Vth) / 4)} 
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
                r="2"
                fill="#16a34a"
                className="shadow-sm"
              />
            ))}

            {/* Electrodes / Contacts */}
            {/* Source wire */}
            <line x1="85" y1="70" x2="85" y2="35" stroke="#64748b" strokeWidth="3.5" />
            <line x1="50" y1="35" x2="120" y2="35" stroke="#64748b" strokeWidth="2.5" />
            {/* Drain wire */}
            <line x1="375" y1="70" x2="375" y2="35" stroke="#64748b" strokeWidth="3.5" />
            <line x1="340" y1="35" x2="410" y2="35" stroke="#64748b" strokeWidth="2.5" />

            {/* Voltage signs indicators */}
            {vgs >= Vth && (
              <text x="230" y="82" fill="#1d4ed8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                Inversion Channel
              </text>
            )}
            {vgs >= Vth && vds >= (vgs - Vth) && (
              <text x="325" y="102" fill="#d97706" fontSize="8" textAnchor="end" fontFamily="monospace">
                Pinch-Off Point
              </text>
            )}

            {/* Gradients */}
            <defs>
              <linearGradient id="channelGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop 
                  offset="100%" 
                  stopColor="#3b82f6" 
                  stopOpacity={vds >= (vgs - Vth) ? "0.08" : "0.4"} 
                />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Column 3: Right Side Plot: Live ID vs VDS Graph */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 border border-slate-200 rounded-lg bg-slate-100/30 p-2.5 flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            Characteristic Curves: Id vs Vds
          </span>
          
          <div className="flex justify-center items-center mt-1">
            <svg viewBox="0 0 320 148" className="w-full h-auto">
              {/* Background grid */}
              <line x1="40" y1="10" x2="280" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="40" y1="40" x2="280" y2="40" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="40" y1="70" x2="280" y2="70" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="40" y1="100" x2="280" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />

              <line x1="88" y1="10" x2="88" y2="130" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="136" y1="10" x2="136" y2="130" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="184" y1="10" x2="184" y2="130" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="232" y1="10" x2="232" y2="130" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />

              {/* Axes */}
              <line x1="40" y1="130" x2="290" y2="130" stroke="#94a3b8" strokeWidth="1.5" /> {/* Vds Axis */}
              <line x1="40" y1="10" x2="40" y2="130" stroke="#94a3b8" strokeWidth="1.5" />  {/* Id Axis */}
              
              {/* Labels */}
              <text x="290" y="142" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                Vds
              </text>
              <text x="15" y="20" fill="#64748b" fontSize="8" writingMode="tb" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 15 20)">
                Id
              </text>
              
              {/* Tick numbers */}
              <text x="40" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">0</text>
              <text x="88" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">1</text>
              <text x="136" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">2</text>
              <text x="184" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">3</text>
              <text x="232" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">4</text>
              <text x="280" y="140" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">5</text>

              {/* ID ticks: 0, 3, 6, 9, 12 */}
              <text x="32" y="133" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">0</text>
              <text x="32" y="103" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">3</text>
              <text x="32" y="73" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">6</text>
              <text x="32" y="43" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">9</text>
              <text x="32" y="13" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">12</text>

              {/* Curve plotting */}
              {vgs >= Vth && (
                <polyline
                  fill="none"
                  stroke="#1d4ed8"
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
                  y2="130"
                  stroke="#d97706"
                  strokeWidth="1"
                  strokeDasharray="3"
                />
              )}
              {pinchPoint && (
                <text
                  x={pinchPoint.x}
                  y={Math.max(22, pinchPoint.y - 10)}
                  fill="#d97706"
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
                  cy={130 - (id / 12.0) * 120}
                  r="4.5"
                  fill="#16a34a"
                  className="animate-ping"
                  style={{ transformOrigin: `${40 + (vds / 5.0) * 240}px ${130 - (id / 12.0) * 120}px` }}
                />
              )}
              {vgs >= Vth && (
                <circle
                  cx={40 + (vds / 5.0) * 240}
                  cy={130 - (id / 12.0) * 120}
                  r="3.5"
                  fill="#16a34a"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
