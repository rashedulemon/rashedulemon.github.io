import { useState } from "react";
import { ToggleLeft, ToggleRight, Info } from "lucide-react";

export default function CmosSim() {
  const [gateType, setGateType] = useState("inverter"); // "inverter" or "nand"
  const [inputA, setInputA] = useState(0); // 0 or 1
  const [inputB, setInputB] = useState(0); // 0 or 1 (used for NAND)

  // Calculate Logic output
  const outputInverter = inputA === 0 ? 1 : 0;
  const outputNand = !(inputA === 1 && inputB === 1) ? 1 : 0;
  const outVal = gateType === "inverter" ? outputInverter : outputNand;

  // Transistor States:
  // For Inverter:
  // PMOS (pull-up): conducts when Input A is 0
  const invPmosOn = inputA === 0;
  // NMOS (pull-down): conducts when Input A is 1
  const invNmosOn = inputA === 1;

  // For NAND:
  // PMOS A: conducts when Input A is 0
  const nandPmosAOn = inputA === 0;
  // PMOS B: conducts when Input B is 0
  const nandPmosBOn = inputB === 0;
  // NMOS A: conducts when Input A is 1
  const nandNmosAOn = inputA === 1;
  // NMOS B: conducts when Input B is 1
  const nandNmosBOn = inputB === 1;

  return (
    <div className="glass-card p-6 rounded-2xl w-full max-w-4xl mx-auto shadow-xl border border-white/5 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-cyan flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-cyan"></span>
            </span>
            CMOS Gate Transistor-Level Simulator
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            VLSI Circuit Behavior & PMOS/NMOS Transistor Network Conducting Paths
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex bg-gray-800/80 p-1 rounded-lg border border-white/10 self-start">
          <button
            onClick={() => setGateType("inverter")}
            className={`px-3 py-1 text-xs font-mono rounded-md font-semibold transition-all ${
              gateType === "inverter"
                ? "bg-brand-cyan text-gray-950 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            CMOS Inverter
          </button>
          <button
            onClick={() => setGateType("nand")}
            className={`px-3 py-1 text-xs font-mono rounded-md font-semibold transition-all ${
              gateType === "nand"
                ? "bg-brand-cyan text-gray-950 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            CMOS NAND Gate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Control Panel & Truth Table */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-[#0e1423] p-4 rounded-xl border border-white/5 flex flex-col gap-4 font-mono">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
              Gate Inputs
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Input A (V_inA):</span>
              <button
                onClick={() => setInputA(inputA === 0 ? 1 : 0)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-white/10 hover:border-brand-cyan/40 transition-all"
              >
                <span className={`text-xs font-bold ${inputA === 1 ? "text-brand-cyan" : "text-gray-500"}`}>
                  {inputA === 1 ? "HIGH (1)" : "LOW (0)"}
                </span>
                {inputA === 1 ? (
                  <ToggleRight className="w-6 h-6 text-brand-cyan" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>

            {gateType === "nand" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Input B (V_inB):</span>
                <button
                  onClick={() => setInputB(inputB === 0 ? 1 : 0)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-white/10 hover:border-brand-cyan/40 transition-all"
                >
                  <span className={`text-xs font-bold ${inputB === 1 ? "text-brand-cyan" : "text-gray-500"}`}>
                    {inputB === 1 ? "HIGH (1)" : "LOW (0)"}
                  </span>
                  {inputB === 1 ? (
                    <ToggleRight className="w-6 h-6 text-brand-cyan" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Truth Table */}
          <div className="bg-[#0e1423] p-4 rounded-xl border border-white/5 flex flex-col gap-3 font-mono">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
              Static Truth Table
            </h4>
            
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-2">Input A</th>
                  {gateType === "nand" && <th className="py-2">Input B</th>}
                  <th className="py-2 text-brand-green font-bold">Output (Y)</th>
                </tr>
              </thead>
              <tbody>
                {gateType === "inverter" ? (
                  <>
                    <tr className={`border-b border-white/5 transition-colors duration-150 ${inputA === 0 ? "bg-brand-cyan/10 text-brand-cyan font-bold" : "text-gray-500"}`}>
                      <td className="py-2">0</td>
                      <td className="py-2">1</td>
                    </tr>
                    <tr className={`transition-colors duration-150 ${inputA === 1 ? "bg-brand-cyan/10 text-brand-cyan font-bold" : "text-gray-500"}`}>
                      <td className="py-2">1</td>
                      <td className="py-2">0</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className={`border-b border-white/5 transition-colors duration-150 ${inputA === 0 && inputB === 0 ? "bg-brand-cyan/10 text-brand-cyan font-bold" : "text-gray-500"}`}>
                      <td className="py-2">0</td>
                      <td className="py-2">0</td>
                      <td className="py-2">1</td>
                    </tr>
                    <tr className={`border-b border-white/5 transition-colors duration-150 ${inputA === 0 && inputB === 1 ? "bg-brand-cyan/10 text-brand-cyan font-bold" : "text-gray-500"}`}>
                      <td className="py-2">0</td>
                      <td className="py-2">1</td>
                      <td className="py-2">1</td>
                    </tr>
                    <tr className={`border-b border-white/5 transition-colors duration-150 ${inputA === 1 && inputB === 0 ? "bg-brand-cyan/10 text-brand-cyan font-bold" : "text-gray-500"}`}>
                      <td className="py-2">1</td>
                      <td className="py-2">0</td>
                      <td className="py-2">1</td>
                    </tr>
                    <tr className={`transition-colors duration-150 ${inputA === 1 && inputB === 1 ? "bg-brand-cyan/10 text-brand-cyan font-bold" : "text-gray-500"}`}>
                      <td className="py-2">1</td>
                      <td className="py-2">1</td>
                      <td className="py-2">0</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Transistor Schematic Diagram */}
        <div className="lg:col-span-7 bg-[#070b13] p-4 rounded-xl border border-white/10 flex flex-col items-center relative min-h-[300px]">
          <span className="absolute top-2 left-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            {gateType === "inverter" ? "CMOS INVERTER SCHEMATIC" : "CMOS NAND SCHEMATIC"}
          </span>

          <div className="w-full flex justify-center items-center mt-6">
            {gateType === "inverter" ? (
              // INVERTER SVG
              <svg viewBox="0 0 240 280" className="w-full max-w-[240px] h-auto">
                {/* VDD Node (top) */}
                <line x1="120" y1="10" x2="120" y2="40" stroke="#f43f5e" strokeWidth="2.5" />
                <text x="120" y="8" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">VDD (+5V)</text>
                
                {/* PMOS Transistor (Pull-up) */}
                {/* PMOS gate bubble */}
                <circle cx="85" cy="70" r="3.5" fill="none" stroke={invPmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                {/* Gate line */}
                <line x1="60" y1="70" x2="81" y2="70" stroke={inputA === 0 ? "#00f0ff" : "#4b5563"} strokeWidth="2" />
                <text x="50" y="65" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">In A ({inputA})</text>
                {/* Gate backplate */}
                <line x1="92" y1="50" x2="92" y2="90" stroke={invPmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                {/* Source/Drain plates */}
                <line x1="120" y1="50" x2="100" y2="50" stroke={invPmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="120" y1="90" x2="100" y2="90" stroke={invPmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="120" y1="40" x2="120" y2="50" stroke={invPmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="120" y1="90" x2="120" y2="105" stroke={invPmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <text x="135" y="74" fill={invPmosOn ? "#39ff14" : "#6b7280"} fontSize="9" fontWeight="bold" fontFamily="monospace">
                  PMOS: {invPmosOn ? "ON (PullUp)" : "OFF"}
                </text>

                {/* Connection Output Node */}
                {/* Connection wire joining PMOS and NMOS */}
                <line x1="120" y1="105" x2="120" y2="175" stroke={outVal === 1 ? "#39ff14" : "#3b82f6"} strokeWidth="2.5" />
                {/* Join dot */}
                <circle cx="120" cy="140" r="3.5" fill={outVal === 1 ? "#39ff14" : "#3b82f6"} />
                {/* Output branch wire */}
                <line x1="120" y1="140" x2="180" y2="140" stroke={outVal === 1 ? "#39ff14" : "#3b82f6"} strokeWidth="2.5" />
                {/* Output Label */}
                <text x="195" y="137" fill={outVal === 1 ? "#39ff14" : "#9ca3af"} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Out Y ({outVal})
                </text>
                {/* LED bulb indicator */}
                <circle cx="215" cy="140" r="6" fill={outVal === 1 ? "#39ff14" : "#1f2937"} stroke={outVal === 1 ? "#39ff14" : "#4b5563"} strokeWidth="1" />
                {outVal === 1 && <circle cx="215" cy="140" r="10" fill="#39ff14" opacity="0.35" className="animate-pulse" />}

                {/* NMOS Transistor (Pull-down) */}
                {/* Gate line */}
                <line x1="60" y1="210" x2="92" y2="210" stroke={inputA === 1 ? "#00f0ff" : "#4b5563"} strokeWidth="2" />
                {/* Connection wire connecting gate A inputs */}
                <line x1="60" y1="70" x2="60" y2="210" stroke={inputA === 1 ? "#00f0ff" : (inputA === 0 ? "#00f0ff" : "#4b5563")} strokeWidth="2" />
                {/* Gate backplate */}
                <line x1="92" y1="190" x2="92" y2="230" stroke={invNmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                {/* Source/Drain plates */}
                <line x1="120" y1="190" x2="100" y2="190" stroke={invNmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="120" y1="230" x2="100" y2="230" stroke={invNmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="120" y1="175" x2="120" y2="190" stroke={invNmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="120" y1="230" x2="120" y2="260" stroke={invNmosOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <text x="135" y="214" fill={invNmosOn ? "#39ff14" : "#6b7280"} fontSize="9" fontWeight="bold" fontFamily="monospace">
                  NMOS: {invNmosOn ? "ON (PullDn)" : "OFF"}
                </text>

                {/* GND Node (bottom) */}
                <line x1="100" y1="260" x2="140" y2="260" stroke="#4b5563" strokeWidth="2.5" />
                <line x1="105" y1="264" x2="135" y2="264" stroke="#4b5563" strokeWidth="2" />
                <line x1="113" y1="268" x2="127" y2="268" stroke="#4b5563" strokeWidth="1.5" />
                <text x="120" y="278" fill="#9ca3af" fontSize="9" textAnchor="middle" fontFamily="monospace">GND (0V)</text>
              </svg>
            ) : (
              // NAND SVG
              <svg viewBox="0 0 300 280" className="w-full max-w-[300px] h-auto">
                {/* VDD Node */}
                <line x1="150" y1="10" x2="150" y2="30" stroke="#f43f5e" strokeWidth="2" />
                <line x1="100" y1="30" x2="200" y2="30" stroke="#f43f5e" strokeWidth="2" />
                <text x="150" y="8" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">VDD (+5V)</text>

                {/* Parallel PMOS Transistor A */}
                {/* Bubble */}
                <circle cx="75" cy="65" r="3.5" fill="none" stroke={nandPmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="50" y1="65" x2="71" y2="65" stroke={inputA === 0 ? "#00f0ff" : "#4b5563"} strokeWidth="2" />
                <text x="35" y="60" fill="#00f0ff" fontSize="9" fontFamily="monospace" fontWeight="bold">A ({inputA})</text>
                <line x1="82" y1="45" x2="82" y2="85" stroke={nandPmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="100" y1="45" x2="90" y2="45" stroke={nandPmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="100" y1="85" x2="90" y2="85" stroke={nandPmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="100" y1="30" x2="100" y2="45" stroke={nandPmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="100" y1="85" x2="100" y2="100" stroke={nandPmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />

                {/* Parallel PMOS Transistor B */}
                {/* Bubble */}
                <circle cx="175" cy="65" r="3.5" fill="none" stroke={nandPmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="65" x2="171" y2="65" stroke={inputB === 0 ? "#00f0ff" : "#4b5563"} strokeWidth="2" />
                <text x="135" y="60" fill="#00f0ff" fontSize="9" fontFamily="monospace" fontWeight="bold">B ({inputB})</text>
                <line x1="182" y1="45" x2="182" y2="85" stroke={nandPmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="200" y1="45" x2="190" y2="45" stroke={nandPmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="200" y1="85" x2="190" y2="85" stroke={nandPmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="200" y1="30" x2="200" y2="45" stroke={nandPmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="200" y1="85" x2="200" y2="100" stroke={nandPmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />

                {/* Join PMOS Outputs to Y */}
                <line x1="100" y1="100" x2="200" y2="100" stroke={(nandPmosAOn || nandPmosBOn) ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                {/* Branch to Y */}
                <line x1="150" y1="100" x2="150" y2="120" stroke={outVal === 1 ? "#39ff14" : "#3b82f6"} strokeWidth="2.5" />
                <line x1="150" y1="120" x2="230" y2="120" stroke={outVal === 1 ? "#39ff14" : "#3b82f6"} strokeWidth="2.5" />
                <circle cx="150" cy="120" r="3" fill={outVal === 1 ? "#39ff14" : "#3b82f6"} />
                <text x="240" y="117" fill={outVal === 1 ? "#39ff14" : "#9ca3af"} fontSize="11" fontWeight="bold" fontFamily="monospace">Y ({outVal})</text>
                <circle cx="265" cy="120" r="5" fill={outVal === 1 ? "#39ff14" : "#1f2937"} stroke={outVal === 1 ? "#39ff14" : "#4b5563"} strokeWidth="1" />
                {outVal === 1 && <circle cx="265" cy="120" r="9" fill="#39ff14" opacity="0.35" className="animate-pulse" />}

                {/* Series NMOS A (top pull-down) */}
                <line x1="110" y1="150" x2="132" y2="150" stroke={inputA === 1 ? "#00f0ff" : "#4b5563"} strokeWidth="2" />
                {/* Wire connecting gate A */}
                <line x1="50" y1="65" x2="50" y2="150" stroke={inputA === 0 ? "#00f0ff" : "#4b5563"} strokeWidth="1.5" />
                <line x1="50" y1="150" x2="110" y2="150" stroke={inputA === 1 ? "#00f0ff" : "#4b5563"} strokeWidth="1.5" />
                <line x1="132" y1="130" x2="132" y2="170" stroke={nandNmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="130" x2="140" y2="130" stroke={nandNmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="170" x2="140" y2="170" stroke={nandNmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="120" x2="150" y2="130" stroke={nandNmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="170" x2="150" y2="190" stroke={nandNmosAOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <text x="165" y="154" fill={nandNmosAOn ? "#39ff14" : "#6b7280"} fontSize="8" fontWeight="bold" fontFamily="monospace">NMOS A: {nandNmosAOn ? "ON" : "OFF"}</text>

                {/* Series NMOS B (bottom pull-down) */}
                <line x1="110" y1="210" x2="132" y2="210" stroke={inputB === 1 ? "#00f0ff" : "#4b5563"} strokeWidth="2" />
                {/* Wire connecting gate B */}
                <line x1="150" y1="65" x2="105" y2="65" stroke={inputB === 0 ? "#00f0ff" : "#4b5563"} strokeWidth="1.5" />
                <line x1="105" y1="65" x2="105" y2="210" stroke={inputB === 1 ? "#00f0ff" : "#4b5563"} strokeWidth="1.5" />
                <line x1="105" y1="210" x2="110" y2="210" stroke={inputB === 1 ? "#00f0ff" : "#4b5563"} strokeWidth="1.5" />
                <line x1="132" y1="190" x2="132" y2="230" stroke={nandNmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="190" x2="140" y2="190" stroke={nandNmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="230" x2="140" y2="230" stroke={nandNmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="190" x2="150" y2="190" stroke={nandNmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <line x1="150" y1="230" x2="150" y2="250" stroke={nandNmosBOn ? "#39ff14" : "#4b5563"} strokeWidth="2" />
                <text x="165" y="214" fill={nandNmosBOn ? "#39ff14" : "#6b7280"} fontSize="8" fontWeight="bold" fontFamily="monospace">NMOS B: {nandNmosBOn ? "ON" : "OFF"}</text>

                {/* GND Connection */}
                <line x1="130" y1="250" x2="170" y2="250" stroke="#4b5563" strokeWidth="2" />
                <line x1="135" y1="254" x2="165" y2="254" stroke="#4b5563" strokeWidth="1.5" />
                <line x1="143" y1="258" x2="157" y2="258" stroke="#4b5563" strokeWidth="1" />
                <text x="150" y="268" fill="#9ca3af" fontSize="8" textAnchor="middle" fontFamily="monospace">GND (0V)</text>
              </svg>
            )}
          </div>

          <div className="mt-4 flex gap-2 items-start border border-white/5 bg-[#0e1423] p-3 rounded-lg w-full text-xs font-mono text-gray-400">
            <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="text-gray-300 font-semibold uppercase tracking-wider text-[10px]">How it works:</span>
              {gateType === "inverter" ? (
                <p>
                  When Input A is <b>LOW (0)</b>, the PMOS conducts current from VDD to Output Y (charging the load capacitor, Y = 1). When A is <b>HIGH (1)</b>, the NMOS conducts discharging the output Y to GND (Y = 0).
                </p>
              ) : (
                <p>
                  For NAND, PMOS transistors are in parallel. Output Y is pulled <b>HIGH (1)</b> if <i>either</i> Input A or B is <b>LOW (0)</b>. The NMOS are in series; Output Y is pulled <b>LOW (0)</b> only when <i>both</i> inputs are <b>HIGH (1)</b>, completing the path to GND.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
