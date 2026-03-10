import React, { useState, useEffect, useRef, useCallback } from "react";

const molecules = [
  {
    id: 1, name: "L-Alanine", formula: "C₃H₇NO₂", category: "Amino Acid",
    rotation: -8.5, chiralCenters: 1, configuration: "S",
    description: "The simplest chiral amino acid found in proteins.",
    stereoInfo: "Single chiral center at Cα. S-configuration by CIP rules.",
    enantiomer: "D-Alanine", enantiomerRotation: +8.5, color: "#4ade80",
  },
  {
    id: 2, name: "D-Glucose", formula: "C₆H₁₂O₆", category: "Monosaccharide",
    rotation: +52.7, chiralCenters: 4, configuration: "R,R,S,R",
    description: "The primary energy source for cells. Dextrorotatory.",
    stereoInfo: "Four chiral centers (C2–C5). Mutarotation observed in solution.",
    enantiomer: "L-Glucose", enantiomerRotation: -52.7, color: "#f59e0b",
  },
  {
    id: 3, name: "R-Carvone", formula: "C₁₀H₁₄O", category: "Terpenoid",
    rotation: +61.2, chiralCenters: 1, configuration: "R",
    description: "Found in spearmint oil. Levorotatory enantiomer smells like caraway.",
    stereoInfo: "Single chiral center. The two enantiomers smell distinctly different.",
    enantiomer: "S-Carvone", enantiomerRotation: -61.2, color: "#a78bfa",
  },
  {
    id: 4, name: "S-Ibuprofen", formula: "C₁₃H₁₈O₂", category: "NSAID",
    rotation: +54.8, chiralCenters: 1, configuration: "S",
    description: "The pharmacologically active form of ibuprofen.",
    stereoInfo: "Only S-enantiomer inhibits cyclooxygenase. R-form converts to S in vivo.",
    enantiomer: "R-Ibuprofen", enantiomerRotation: -54.8, color: "#38bdf8",
  },
  {
    id: 5, name: "L-Tartaric Acid", formula: "C₄H₆O₆", category: "Organic Acid",
    rotation: -12.0, chiralCenters: 2, configuration: "S,S",
    description: "Found in grapes. Historically used by Pasteur to study chirality.",
    stereoInfo: "Two chiral centers. Meso form (R,S) is optically inactive despite stereocenters.",
    enantiomer: "D-Tartaric Acid", enantiomerRotation: +12.0, color: "#fb7185",
  },
  {
    id: 6, name: "Meso-Tartaric Acid", formula: "C₄H₆O₆", category: "Organic Acid",
    rotation: 0, chiralCenters: 2, configuration: "R,S",
    description: "Optically inactive despite having two stereocenters.",
    stereoInfo: "Internal mirror plane makes it achiral. A perfect example of a meso compound.",
    enantiomer: "None (meso compound)", enantiomerRotation: 0, color: "#94a3b8",
  },
  {
    id: 7, name: "S-Naproxen", formula: "C₁₄H₁₄O₃", category: "NSAID",
    rotation: -66.0, chiralCenters: 1, configuration: "S",
    description: "The active enantiomer in Aleve. R-form is hepatotoxic.",
    stereoInfo: "Critical example of chiral drugs — wrong enantiomer causes liver damage.",
    enantiomer: "R-Naproxen", enantiomerRotation: +66.0, color: "#f97316",
  },
  {
    id: 8, name: "R-Limonene", formula: "C₁₀H₁₆", category: "Terpenoid",
    rotation: +125.6, chiralCenters: 1, configuration: "R",
    description: "Smells like oranges. S-enantiomer smells like turpentine/pine.",
    stereoInfo: "Strongest natural rotation shown here. Both enantiomers occur naturally.",
    enantiomer: "S-Limonene", enantiomerRotation: -125.6, color: "#facc15",
  },
];

const PolarimeterViz = ({ rotation, isAnimating, concentration, pathLength }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const observed = rotation * concentration * pathLength;

  const drawPolarimeter = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (isAnimating) timeRef.current = timestamp * 0.001;
    const t = timeRef.current;
    const cx = W / 2, cy = H / 2;

    const bgGrad = ctx.createLinearGradient(0, 0, W, 0);
    bgGrad.addColorStop(0, "#0a0a1a");
    bgGrad.addColorStop(0.5, "#0d1229");
    bgGrad.addColorStop(1, "#0a0a1a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const tubeY = cy, tubeLeft = 90, tubeRight = W - 90, tubeH = 36;
    const tubeGrad = ctx.createLinearGradient(0, tubeY - tubeH / 2, 0, tubeY + tubeH / 2);
    tubeGrad.addColorStop(0, "#1e293b");
    tubeGrad.addColorStop(0.5, "#334155");
    tubeGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = tubeGrad;
    ctx.beginPath();
    ctx.roundRect(tubeLeft, tubeY - tubeH / 2, tubeRight - tubeLeft, tubeH, 8);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const solutionColor = rotation > 0 ? "rgba(251,191,36,0.12)" : rotation < 0 ? "rgba(99,102,241,0.12)" : "rgba(100,116,139,0.08)";
    ctx.fillStyle = solutionColor;
    ctx.beginPath();
    ctx.roundRect(tubeLeft + 2, tubeY - tubeH / 2 + 2, tubeRight - tubeLeft - 4, tubeH - 4, 6);
    ctx.fill();

    const waveColor = rotation > 0 ? "#fbbf24" : rotation < 0 ? "#818cf8" : "#94a3b8";
    for (let layer = 0; layer < 3; layer++) {
      const alpha = [0.6, 0.35, 0.15][layer];
      const amplitude = [8, 5, 3][layer];
      ctx.beginPath();
      ctx.strokeStyle = `${waveColor}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = [2, 1.5, 1][layer];
      for (let x = tubeLeft; x <= tubeRight; x += 2) {
        const progress = (x - tubeLeft) / (tubeRight - tubeLeft);
        const y = cy + Math.sin(progress * Math.PI * 6 - t * 3 + layer * 0.8) * amplitude * Math.sin(progress * Math.PI);
        if (x === tubeLeft) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const drawPolarizer = (x, angle, label) => {
      ctx.save();
      ctx.translate(x, cy);
      ctx.rotate(angle);
      const pg = ctx.createLinearGradient(-22, -22, 22, 22);
      pg.addColorStop(0, "#1e3a5f");
      pg.addColorStop(1, "#0f2237");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, 32);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#64748b";
      ctx.font = "10px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText(label, x, cy + 58);
    };

    drawPolarizer(tubeLeft - 22, 0, "POLARIZER");
    const analyzerAngle = (observed * Math.PI) / 180;
    drawPolarizer(tubeRight + 22, analyzerAngle, "ANALYZER");

    if (Math.abs(observed) > 0.5) {
      const arcR = 55;
      ctx.beginPath();
      ctx.arc(tubeRight + 22, cy, arcR, -Math.PI / 2, -Math.PI / 2 + analyzerAngle, analyzerAngle < 0);
      ctx.strokeStyle = observed > 0 ? "rgba(251,191,36,0.6)" : "rgba(129,140,248,0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const lsX = 38;
    const lsGrad = ctx.createRadialGradient(lsX, cy, 0, lsX, cy, 28);
    lsGrad.addColorStop(0, "rgba(255,255,255,0.95)");
    lsGrad.addColorStop(0.4, "rgba(200,220,255,0.6)");
    lsGrad.addColorStop(1, "rgba(100,150,255,0)");
    ctx.fillStyle = lsGrad;
    ctx.beginPath();
    ctx.ellipse(lsX, cy, 18, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("Na-D", lsX, cy + 28);
    ctx.fillText("LAMP", lsX, cy + 38);

    const detX = W - 38;
    const intensity = Math.cos(analyzerAngle) ** 2;
    const detColor = observed > 0 ? `rgba(251,191,36,${0.3 + intensity * 0.7})` : observed < 0 ? `rgba(129,140,248,${0.3 + intensity * 0.7})` : `rgba(148,163,184,${0.3 + intensity * 0.7})`;
    const detGrad = ctx.createRadialGradient(detX, cy, 0, detX, cy, 24);
    detGrad.addColorStop(0, detColor);
    detGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = detGrad;
    ctx.beginPath();
    ctx.ellipse(detX, cy, 20, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.font = "9px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("DETECTOR", detX, cy + 34);

    if (isAnimating) animFrameRef.current = requestAnimationFrame(drawPolarimeter);
  }, [rotation, observed, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      animFrameRef.current = requestAnimationFrame(drawPolarimeter);
    } else {
      drawPolarimeter(0);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [drawPolarimeter, isAnimating]);

  return <canvas ref={canvasRef} width={580} height={160} style={{ width: "100%", borderRadius: 12 }} />;
};

const QuizMode = ({ molecule, onAnswer, questionNum, totalQ }) => {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const questions = [
    {
      q: `What is the sign of optical rotation for ${molecule.name}?`,
      opts: ["+  (dextrorotatory)", "−  (levorotatory)", "0  (optically inactive)"],
      correct: molecule.rotation > 0 ? 0 : molecule.rotation < 0 ? 1 : 2,
    },
    {
      q: `${molecule.name} has ${molecule.chiralCenters} chiral center(s). What do we call a molecule with internal symmetry that renders it optically inactive?`,
      opts: ["Racemic mixture", "Meso compound", "Enantiomer", "Diastereomer"],
      correct: 1,
    },
    {
      q: `If you mix equal amounts of ${molecule.name} and its enantiomer, what is the observed rotation?`,
      opts: ["Double the rotation", "Same rotation", "0° (racemic mixture)", "Unpredictable"],
      correct: 2,
    },
  ];

  const [qIdx] = useState(Math.floor(Math.random() * questions.length));
  const q = questions[qIdx];

  const handleSelect = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    setTimeout(() => onAnswer(i === q.correct), 1200);
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontFamily: "Courier New", letterSpacing: 2 }}>
        QUESTION {questionNum} OF {totalQ}
      </div>
      <div style={{ fontSize: 15, color: "#e2e8f0", marginBottom: 18, lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
        {q.q}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, i) => {
          let bg = "rgba(30,41,59,0.8)", border = "1px solid #334155", color = "#94a3b8";
          if (revealed) {
            if (i === q.correct) { bg = "rgba(74,222,128,0.15)"; border = "1px solid #4ade80"; color = "#4ade80"; }
            else if (i === selected) { bg = "rgba(248,113,113,0.15)"; border = "1px solid #f87171"; color = "#f87171"; }
          } else if (selected === i) {
            bg = "rgba(99,102,241,0.2)"; border = "1px solid #818cf8"; color = "#c7d2fe";
          }
          return (
            <button key={i} onClick={() => handleSelect(i)}
              style={{ background: bg, border, color, padding: "12px 16px", borderRadius: 8, textAlign: "left", cursor: revealed ? "default" : "pointer", transition: "all 0.2s", fontSize: 13, fontFamily: "Courier New" }}>
              {revealed && i === q.correct && "✓ "}{revealed && i === selected && i !== q.correct && "✗ "}{opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [selected, setSelected] = useState(molecules[0]);
  const [concentration, setConcentration] = useState(1.0);
  const [pathLength, setPathLength] = useState(1.0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showEnantiomer, setShowEnantiomer] = useState(false);
  const [mode, setMode] = useState("explore");
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizKey, setQuizKey] = useState(0);
  const [filter, setFilter] = useState("All");

  const currentRotation = showEnantiomer ? selected.enantiomerRotation : selected.rotation;
  const observed = currentRotation * concentration * pathLength;
  const categories = ["All", ...new Set(molecules.map((m) => m.category))];

  const handleQuizAnswer = (correct) => {
    setQuizScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setQuizKey((k) => k + 1);
  };

  const filteredMols = filter === "All" ? molecules : molecules.filter((m) => m.category === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#060912", color: "#e2e8f0", fontFamily: "Courier New, monospace", padding: "24px 16px" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        .mol-btn:hover { border-color: #4b5563 !important; background: rgba(30,41,59,0.9) !important; transform: translateY(-1px); }
        .tab-btn:hover { background: rgba(30,41,59,0.7) !important; }
        .ctrl-btn:hover { border-color: #6366f1 !important; color: #a5b4fc !important; }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#4b5563", marginBottom: 8 }}>HONORS ORGANIC CHEMISTRY</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 400, margin: 0, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Optical Activity Simulator
          </h1>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #4b5563, transparent)", margin: "12px auto 8px" }} />
          <p style={{ color: "#64748b", fontSize: 12, margin: 0, letterSpacing: 1 }}>
            α = [α] · c · l &nbsp;|&nbsp; POLARIMETRY VIRTUAL LAB
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(15,23,42,0.8)", borderRadius: 10, padding: 4, border: "1px solid #1e293b" }}>
          {[["explore", "⬡ EXPLORE"], ["quiz", "◈ QUIZ MODE"], ["compare", "⇄ COMPARE"]].map(([m, label]) => (
            <button key={m} className="tab-btn" onClick={() => setMode(m)}
              style={{ flex: 1, padding: "10px 8px", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, letterSpacing: 2, transition: "all 0.2s", background: mode === m ? "rgba(99,102,241,0.25)" : "transparent", color: mode === m ? "#a5b4fc" : "#475569", fontFamily: "Courier New" }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "clamp(200px, 28%, 280px) 1fr", gap: 16 }}>
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              {categories.map((c) => (
                <button key={c} onClick={() => setFilter(c)}
                  style={{ fontSize: 9, padding: "4px 8px", borderRadius: 4, border: `1px solid ${filter === c ? "#4f46e5" : "#1e293b"}`, background: filter === c ? "rgba(79,70,229,0.2)" : "transparent", color: filter === c ? "#a5b4fc" : "#475569", cursor: "pointer", letterSpacing: 1, fontFamily: "Courier New" }}>
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredMols.map((mol) => (
                <button key={mol.id} className="mol-btn" onClick={() => { setSelected(mol); setShowEnantiomer(false); }}
                  style={{ background: selected.id === mol.id ? "rgba(30,41,59,0.95)" : "rgba(15,23,42,0.6)", border: `1px solid ${selected.id === mol.id ? mol.color + "60" : "#1e293b"}`, borderRadius: 8, padding: "10px 12px", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: mol.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: selected.id === mol.id ? "#e2e8f0" : "#94a3b8", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{mol.name}</div>
                  </div>
                  <div style={{ fontSize: 9, color: "#475569", paddingLeft: 16, letterSpacing: 1 }}>
                    {mol.rotation === 0 ? "INACTIVE" : mol.rotation > 0 ? `+${mol.rotation}°` : `${mol.rotation}°`} · {mol.chiralCenters} STEREOCENTER{mol.chiralCenters !== 1 ? "S" : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 12, padding: "16px 20px", border: `1px solid ${selected.color}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#4b5563", marginBottom: 4 }}>{selected.category.toUpperCase()}</div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 400, margin: 0, color: selected.color }}>{showEnantiomer ? selected.enantiomer : selected.name}</h2>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{selected.formula}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: "#4b5563", marginBottom: 2 }}>SPECIFIC ROTATION [α]</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: currentRotation > 0 ? "#fbbf24" : currentRotation < 0 ? "#818cf8" : "#64748b" }}>
                    {currentRotation > 0 ? "+" : ""}{currentRotation}°
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", margin: "10px 0 0", lineHeight: 1.6, fontFamily: "Georgia, serif", fontStyle: "italic" }}>{selected.description}</p>
            </div>

            <div style={{ background: "rgba(10,10,26,0.9)", borderRadius: 12, padding: 16, border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155" }}>POLARIMETER DIAGRAM</div>
                <button onClick={() => setIsAnimating(!isAnimating)}
                  style={{ fontSize: 9, padding: "4px 12px", border: "1px solid #334155", borderRadius: 4, background: "transparent", color: isAnimating ? "#4ade80" : "#64748b", cursor: "pointer", letterSpacing: 1, fontFamily: "Courier New" }}>
                  {isAnimating ? "● LIVE" : "○ PAUSED"}
                </button>
              </div>
              <PolarimeterViz rotation={currentRotation} isAnimating={isAnimating} concentration={concentration} pathLength={pathLength} />
            </div>

            {mode === "explore" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Concentration (c)", unit: "g/mL", val: concentration, set: setConcentration, min: 0.1, max: 2.0, step: 0.1 },
                    { label: "Path Length (l)", unit: "dm", val: pathLength, set: setPathLength, min: 0.5, max: 5.0, step: 0.5 },
                  ].map(({ label, unit, val, set, min, max, step }) => (
                    <div key={label} style={{ background: "rgba(15,23,42,0.8)", borderRadius: 10, padding: "12px 14px", border: "1px solid #1e293b" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{val.toFixed(1)} <span style={{ color: "#475569", fontSize: 10 }}>{unit}</span></div>
                      </div>
                      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(parseFloat(e.target.value))}
                        style={{ width: "100%", accentColor: selected.color }} />
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 10, padding: "14px 18px", border: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 4 }}>OBSERVED ROTATION</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>α = [α] × c × l = {currentRotation} × {concentration.toFixed(1)} × {pathLength.toFixed(1)}</div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: observed > 0 ? "#fbbf24" : observed < 0 ? "#818cf8" : "#64748b" }}>
                    {observed > 0 ? "+" : ""}{observed.toFixed(2)}°
                  </div>
                </div>

                <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 10, padding: "14px 18px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 8 }}>STEREOCHEMICAL ANALYSIS</div>
                  <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 12px", fontFamily: "Georgia, serif" }}>{selected.stereoInfo}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(99,102,241,0.15)", border: "1px solid #4f46e5", color: "#a5b4fc", letterSpacing: 1 }}>
                      {selected.chiralCenters} STEREOCENTER{selected.chiralCenters !== 1 ? "S" : ""}
                    </span>
                    <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(30,41,59,0.8)", border: "1px solid #334155", color: "#64748b", letterSpacing: 1 }}>
                      CONFIG: {selected.configuration}
                    </span>
                    {selected.rotation !== 0 && (
                      <button className="ctrl-btn" onClick={() => setShowEnantiomer(!showEnantiomer)}
                        style={{ fontSize: 10, padding: "4px 12px", borderRadius: 4, border: `1px solid ${showEnantiomer ? "#4ade80" : "#334155"}`, background: showEnantiomer ? "rgba(74,222,128,0.1)" : "transparent", color: showEnantiomer ? "#4ade80" : "#64748b", cursor: "pointer", letterSpacing: 1, fontFamily: "Courier New", transition: "all 0.2s" }}>
                        {showEnantiomer ? "ENANTIOMER ✓" : "VIEW ENANTIOMER"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {mode === "quiz" && (
              <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 10, padding: "16px 18px", border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155" }}>ASSESSMENT</div>
                  <div style={{ fontSize: 11, color: quizScore.total === 0 ? "#475569" : quizScore.correct / quizScore.total > 0.7 ? "#4ade80" : "#f87171" }}>
                    {quizScore.correct}/{quizScore.total} CORRECT
                  </div>
                </div>
                <QuizMode key={`${selected.id}-${quizKey}`} molecule={selected} onAnswer={handleQuizAnswer} questionNum={quizScore.total + 1} totalQ="∞" />
                <button onClick={() => setQuizScore({ correct: 0, total: 0 })}
                  style={{ marginTop: 12, fontSize: 9, padding: "6px 14px", border: "1px solid #334155", borderRadius: 4, background: "transparent", color: "#475569", cursor: "pointer", letterSpacing: 2, fontFamily: "Courier New" }}>
                  RESET SCORE
                </button>
              </div>
            )}

            {mode === "compare" && (
              <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 10, padding: "16px 18px", border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14 }}>ROTATION COMPARISON CHART</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...molecules].sort((a, b) => Math.abs(b.rotation) - Math.abs(a.rotation)).map((mol) => {
                    const maxAbs = 125.6;
                    const barW = (Math.abs(mol.rotation) / maxAbs) * 100;
                    const isPos = mol.rotation >= 0;
                    return (
                      <div key={mol.id} style={{ cursor: "pointer" }} onClick={() => { setSelected(mol); setShowEnantiomer(false); }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <div style={{ fontSize: 10, color: selected.id === mol.id ? mol.color : "#64748b", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{mol.name}</div>
                          <div style={{ fontSize: 10, color: isPos ? "#fbbf24" : mol.rotation === 0 ? "#475569" : "#818cf8" }}>
                            {mol.rotation > 0 ? "+" : ""}{mol.rotation}°
                          </div>
                        </div>
                        <div style={{ height: 6, background: "#0f172a", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${barW}%`, background: isPos ? "linear-gradient(90deg, #d97706, #fbbf24)" : mol.rotation === 0 ? "#334155" : "linear-gradient(90deg, #4338ca, #818cf8)", borderRadius: 3, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 16 }}>
                  <div style={{ fontSize: 10, color: "#475569" }}><span style={{ color: "#fbbf24" }}>■</span> Dextrorotatory (+)</div>
                  <div style={{ fontSize: 10, color: "#475569" }}><span style={{ color: "#818cf8" }}>■</span> Levorotatory (−)</div>
                  <div style={{ fontSize: 10, color: "#475569" }}><span style={{ color: "#475569" }}>■</span> Inactive</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 9, color: "#1e293b", letterSpacing: 2 }}>
          BIOT'S LAW · α = [α]·c·l · POLARIMETRY SIMULATION
        </div>
      </div>
    </div>
  );
}
