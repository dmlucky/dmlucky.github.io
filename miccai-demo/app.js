const cases = [
  {
    id: "normal",
    label: "Case A",
    name: "正常老化样例",
    age: 62,
    sex: "female",
    gap: 1.1,
    stage: { CN: 0.82, MCI: 0.14, AD: 0.04 },
    state: "Normal brain aging",
    finalLabel: "CN-like pattern",
    confidence: 0.89,
    npv: 0.986,
    catastrophicRisk: 0.011,
    cost: 0.061,
    risk: "low",
    regions: "轻度年龄相关改变，未见显著内侧颞叶异常模式。",
    patientNote: "脑龄与实际年龄接近，当前影像模式更接近正常老化范围。",
    recommendation: "维持常规随访；如有记忆下降、睡眠改变或家族史，可结合认知量表进一步观察。",
    subjectId: "sub-0002",
    preview: "samples/sub-0002_axial.png",
    views: {
      axial: "samples/sub-0002_axial.png",
      coronal: "samples/sub-0002_coronal.png",
      sagittal: "samples/sub-0002_sagittal.png"
    },
    seed: 4,
    heat: [
      { x: 0.47, y: 0.55, r: 0.11, a: 0.22 },
      { x: 0.58, y: 0.48, r: 0.08, a: 0.16 }
    ]
  },
  {
    id: "mci",
    label: "Case B",
    name: "轻度异常样例",
    age: 68,
    sex: "female",
    gap: 6.2,
    stage: { CN: 0.18, MCI: 0.63, AD: 0.19 },
    state: "Accelerated brain aging",
    finalLabel: "MCI-like pattern",
    confidence: 0.81,
    npv: 0.965,
    catastrophicRisk: 0.021,
    cost: 0.143,
    risk: "medium",
    regions: "海马旁回、内侧颞叶、侧脑室周围区域出现较高关注。",
    patientNote: "脑龄高于实际年龄，MRI 形态提示轻度异常风险，建议结合临床检查确认。",
    recommendation: "建议 6 - 12 个月后复查 MRI，并进行记忆、注意力等认知筛查。",
    subjectId: "sub-0001",
    preview: "samples/sub-0001_axial.png",
    views: {
      axial: "samples/sub-0001_axial.png",
      coronal: "samples/sub-0001_coronal.png",
      sagittal: "samples/sub-0001_sagittal.png"
    },
    seed: 11,
    heat: [
      { x: 0.41, y: 0.58, r: 0.12, a: 0.36 },
      { x: 0.61, y: 0.59, r: 0.13, a: 0.34 },
      { x: 0.51, y: 0.45, r: 0.10, a: 0.22 }
    ]
  },
  {
    id: "ad",
    label: "Case C",
    name: "高风险样例",
    age: 72,
    sex: "male",
    gap: 11.4,
    stage: { CN: 0.06, MCI: 0.24, AD: 0.70 },
    state: "Significant neurodegenerative pattern",
    finalLabel: "AD-like pattern",
    confidence: 0.86,
    npv: 0.941,
    catastrophicRisk: 0.034,
    cost: 0.226,
    risk: "high",
    regions: "双侧内侧颞叶、海马区域、脑室扩大相关区域显示明显模型关注。",
    patientNote: "脑龄显著高于实际年龄，影像模式提示较高神经退行性风险。",
    recommendation: "建议尽快进行专科评估，结合神经心理量表、实验室检查和临床病史综合判断。",
    subjectId: "sub-0003",
    preview: "samples/sub-0003_axial.png",
    views: {
      axial: "samples/sub-0003_axial.png",
      coronal: "samples/sub-0003_coronal.png",
      sagittal: "samples/sub-0003_sagittal.png"
    },
    seed: 19,
    heat: [
      { x: 0.37, y: 0.59, r: 0.15, a: 0.46 },
      { x: 0.64, y: 0.58, r: 0.15, a: 0.44 },
      { x: 0.52, y: 0.43, r: 0.14, a: 0.32 },
      { x: 0.50, y: 0.67, r: 0.10, a: 0.22 }
    ]
  }
];

const atlasFrames = [
  { id: "actual", title: "实际年龄", sub: "Chronological", offset: 0, severity: 0.18, slice: 7 },
  { id: "predicted", title: "预测脑龄", sub: "Model estimate", offset: null, severity: null, slice: 12 },
  { id: "transitionA", title: "轻度偏移", sub: "Early drift", offset: 3.8, severity: 0.38, slice: 14 },
  { id: "mciRef", title: "轻度异常", sub: "MCI-like ref", offset: 6, severity: 0.58, slice: 16 },
  { id: "transitionB", title: "明显偏移", sub: "Mid drift", offset: 9.2, severity: 0.72, slice: 19 },
  { id: "adRef", title: "高风险参考", sub: "AD-like ref", offset: 11, severity: 0.88, slice: 21 }
];

const state = {
  caseId: "mci",
  view: "doctor",
  age: 68,
  sex: "female",
  slice: 12,
  heatmap: true,
  motion: true,
  uploadedImage: null,
  uploadedName: "",
  analyzing: false,
  activeStep: 0,
  result: null
};

const sampleImageCache = new Map();

const el = {
  caseList: document.querySelector("#caseList"),
  dataMode: document.querySelector("#dataMode"),
  canvas: document.querySelector("#mriCanvas"),
  viewerBadge: document.querySelector("#viewerBadge"),
  sliceRange: document.querySelector("#sliceRange"),
  sliceValue: document.querySelector("#sliceValue"),
  heatmapToggle: document.querySelector("#heatmapToggle"),
  motionToggle: document.querySelector("#motionToggle"),
  ageInput: document.querySelector("#ageInput"),
  sexInput: document.querySelector("#sexInput"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  analysisState: document.querySelector("#analysisState"),
  resetBtn: document.querySelector("#resetBtn"),
  chronAge: document.querySelector("#chronAge"),
  brainAge: document.querySelector("#brainAge"),
  brainGap: document.querySelector("#brainGap"),
  ringAge: document.querySelector("#ringAge"),
  ringGap: document.querySelector("#ringGap"),
  ringCopy: document.querySelector("#ringCopy"),
  ageArc: document.querySelector("#ageArc"),
  gapLabel: document.querySelector("#gapLabel"),
  gapMarker: document.querySelector("#gapMarker"),
  riskChip: document.querySelector("#riskChip"),
  stateLabel: document.querySelector("#stateLabel"),
  finalLabel: document.querySelector("#finalLabel"),
  summaryText: document.querySelector("#summaryText"),
  patientNote: document.querySelector("#patientNote"),
  patientRecommendation: document.querySelector("#patientRecommendation"),
  confidenceVal: document.querySelector("#confidenceVal"),
  npvVal: document.querySelector("#npvVal"),
  catRiskVal: document.querySelector("#catRiskVal"),
  costVal: document.querySelector("#costVal"),
  regionText: document.querySelector("#regionText"),
  regionGrid: document.querySelector("#regionGrid"),
  promptText: document.querySelector("#promptText"),
  patientView: document.querySelector("#patientView"),
  doctorView: document.querySelector("#doctorView"),
  prdDrawer: document.querySelector("#prdDrawer"),
  prdBackdrop: document.querySelector("#prdBackdrop"),
  prdCloseBtn: document.querySelector("#prdCloseBtn"),
  mriUpload: document.querySelector("#mriUpload"),
  brainAgeGallery: document.querySelector("#brainAgeGallery"),
  atlasHint: document.querySelector("#atlasHint"),
  pipelineSteps: Array.from(document.querySelectorAll(".pipeline-step")),
  modeButtons: Array.from(document.querySelectorAll(".mode-button"))
};

const ctx = el.canvas.getContext("2d");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentCase() {
  return cases.find((item) => item.id === state.caseId) || cases[0];
}

function normalizeStage(stage) {
  const total = stage.CN + stage.MCI + stage.AD;
  return {
    CN: stage.CN / total,
    MCI: stage.MCI / total,
    AD: stage.AD / total
  };
}

function deriveResult() {
  const item = currentCase();
  const ageShift = clamp((state.age - item.age) * 0.055, -1.4, 1.8);
  const uploadShift = state.uploadedImage ? 0.7 : 0;
  const gap = Number((item.gap + ageShift + uploadShift).toFixed(1));
  const brainAge = Number((state.age + gap).toFixed(1));
  const stage = normalizeStage({
    CN: clamp(item.stage.CN - Math.max(gap - 4, 0) * 0.012, 0.02, 0.9),
    MCI: clamp(item.stage.MCI + Math.max(gap - 2, 0) * 0.006, 0.04, 0.82),
    AD: clamp(item.stage.AD + Math.max(gap - 7, 0) * 0.014, 0.02, 0.86)
  });

  let risk = "low";
  let finalLabel = "CN-like pattern";
  let stateLabel = "Normal brain aging";
  if (stage.AD >= 0.46 || gap >= 9) {
    risk = "high";
    finalLabel = "AD-like pattern";
    stateLabel = "Significant neurodegenerative pattern";
  } else if (stage.MCI >= 0.42 || gap >= 4) {
    risk = "medium";
    finalLabel = "MCI-like pattern";
    stateLabel = "Accelerated brain aging";
  }

  return {
    ...item,
    age: state.age,
    sex: state.sex,
    gap,
    brainAge,
    stage,
    risk,
    finalLabel,
    state: stateLabel,
    confidence: clamp(item.confidence + (state.uploadedImage ? -0.03 : 0), 0.72, 0.93),
    npv: clamp(item.npv - Math.max(gap - 5, 0) * 0.002, 0.90, 0.99),
    catastrophicRisk: clamp(item.catastrophicRisk + Math.max(gap - 6, 0) * 0.002, 0.006, 0.055),
    cost: clamp(item.cost + Math.max(gap - 6, 0) * 0.008, 0.045, 0.28)
  };
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function viewForSlice(slice) {
  if (slice <= 8) return "axial";
  if (slice <= 16) return "coronal";
  return "sagittal";
}

function viewLabel(view) {
  return {
    axial: "Axial 轴位",
    coronal: "Coronal 冠状",
    sagittal: "Sagittal 矢状"
  }[view] || "MRI view";
}

function getCachedSampleImage(src) {
  if (!src) return null;
  if (sampleImageCache.has(src)) {
    const cached = sampleImageCache.get(src);
    return cached.complete ? cached : null;
  }
  const image = new Image();
  image.onload = () => renderMri();
  image.src = src;
  sampleImageCache.set(src, image);
  return null;
}

function renderCaseButtons() {
  el.caseList.innerHTML = cases.map((item) => `
    <button class="case-button ${item.id === state.caseId ? "active" : ""}" type="button" data-case="${item.id}">
      <img src="${item.preview}" alt="${item.label} MRI preview">
      <span class="case-copy">
        <strong>${item.label}</strong>
        <span>${item.subjectId.toUpperCase()} · Age ${item.age}</span>
      </span>
    </button>
  `).join("");
}

function setPipeline(activeStep, completeAll = false) {
  el.pipelineSteps.forEach((step, index) => {
    step.classList.toggle("active", !completeAll && index === activeStep);
    step.classList.toggle("done", completeAll || index < activeStep);
  });
}

function renderResult() {
  const result = state.result || deriveResult();
  state.result = result;

  document.body.classList.toggle("motion", state.motion);
  el.ageInput.value = state.age;
  el.sexInput.value = state.sex;
  el.chronAge.textContent = state.age;
  el.brainAge.textContent = result.brainAge.toFixed(1);
  el.brainGap.textContent = `${result.gap >= 0 ? "+" : ""}${result.gap.toFixed(1)}`;
  el.ringAge.textContent = result.brainAge.toFixed(1);
  el.ringGap.textContent = `${result.gap >= 0 ? "+" : ""}${result.gap.toFixed(1)} years`;
  el.ringCopy.textContent = result.gap >= 9 ? "脑龄显著高于实际年龄，建议尽快临床评估。" : result.gap >= 4 ? "脑龄高于实际年龄，提示加速老化倾向。" : "脑龄与实际年龄接近，整体处于相对稳定范围。";
  const ageRatio = clamp(result.brainAge / 100, 0, 1);
  const circumference = 2 * Math.PI * 61;
  el.ageArc.style.strokeDashoffset = `${circumference * (1 - ageRatio)}`;
  el.ageArc.style.stroke = result.risk === "high" ? "var(--red)" : result.risk === "medium" ? "var(--amber)" : "var(--green)";

  const gapLeft = clamp(((result.gap + 8) / 20) * 100, 0, 100);
  el.gapMarker.style.left = `${gapLeft}%`;
  el.gapLabel.textContent = result.gap >= 9 ? "显著加速老化" : result.gap >= 4 ? "加速老化倾向" : "接近正常范围";

  el.stateLabel.textContent = result.state;
  el.finalLabel.textContent = result.finalLabel;
  el.summaryText.textContent = result.patientNote;
  el.riskChip.textContent = result.finalLabel.replace(" pattern", "");
  el.riskChip.className = `risk-chip ${result.risk}`;

  updateProbability("CN", result.stage.CN);
  updateProbability("MCI", result.stage.MCI);
  updateProbability("AD", result.stage.AD);

  if (el.patientNote) {
    el.patientNote.textContent = result.patientNote;
  }
  if (el.patientRecommendation) {
    el.patientRecommendation.textContent = result.recommendation;
  }
  el.confidenceVal.textContent = result.confidence.toFixed(2);
  el.npvVal.textContent = percent(result.npv);
  el.catRiskVal.textContent = percent(result.catastrophicRisk);
  el.costVal.textContent = result.cost.toFixed(3);
  el.regionText.textContent = result.regions;
  el.promptText.textContent = `${state.sex === "female" ? "Female" : "Male"} subject, age ${state.age}, undergoing brain MRI for cognitive assessment.`;
  renderRegionGrid(result);

  if (el.patientView) {
    el.patientView.classList.add("hidden");
  }
  if (el.doctorView) {
    el.doctorView.classList.remove("hidden");
  }
  const prdOpen = state.view === "prd";
  document.body.classList.toggle("prd-open", prdOpen);
  if (el.prdDrawer) {
    el.prdDrawer.classList.toggle("hidden", !prdOpen);
    el.prdDrawer.setAttribute("aria-hidden", String(!prdOpen));
  }
  if (el.prdBackdrop) {
    el.prdBackdrop.classList.toggle("hidden", !prdOpen);
    el.prdBackdrop.setAttribute("aria-hidden", String(!prdOpen));
  }
  el.modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));

  el.analysisState.textContent = state.analyzing ? "分析中" : "已生成";
  el.dataMode.textContent = state.uploadedImage ? "本地上传" : "示例病例";
  const view = viewForSlice(state.slice);
  const subject = currentCase().subjectId?.toUpperCase() || "DEMO";
  el.viewerBadge.textContent = state.uploadedImage ? state.uploadedName : `${subject} · ${viewLabel(view)} · ${state.slice}/24`;
  renderBrainAgeGallery();
}

function updateProbability(label, value) {
  document.querySelector(`#bar${label}`).style.width = percent(value);
  document.querySelector(`#prob${label}`).textContent = percent(value);
}

function renderMri() {
  const w = el.canvas.width;
  const h = el.canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (state.uploadedImage) {
    drawUploadedImage(w, h);
  } else {
    drawSyntheticMri(w, h);
  }

  if (state.heatmap) {
    drawHeatmap(w, h);
  }

  renderBrainAgeGallery();
}

function renderRegionGrid(result) {
  if (!el.regionGrid) return;
  const severityBoost = result.risk === "high" ? 18 : result.risk === "medium" ? 9 : 0;
  const gapBoost = Math.max(0, result.gap) * 2;
  const regions = [
    ["海马体", "Hippocampus", 70],
    ["内侧颞叶", "Medial Temporal", 64],
    ["脑室系统", "Ventricular", 48],
    ["前额叶皮层", "Prefrontal", 42]
  ].map(([name, sub, base], index) => ({
    name,
    sub,
    score: Math.round(clamp(base + severityBoost + gapBoost - index * 4, 8, 98))
  }));

  el.regionGrid.innerHTML = regions.map((region) => `
    <div class="region-card">
      <span>${region.name}</span>
      <small>${region.sub}</small>
      <div class="region-bar"><i style="width:${region.score}%"></i></div>
      <strong>${region.score}%</strong>
    </div>
  `).join("");
}

function renderBrainAgeGallery() {
  if (!el.brainAgeGallery) return;
  const result = state.result || deriveResult();
  const frames = atlasFrames.map((frame) => {
    const gap = frame.offset === null ? result.gap : frame.offset;
    const age = Number((state.age + gap).toFixed(1));
    const severity = frame.severity === null ? clamp((result.gap + 1) / 13, 0.12, 0.9) : frame.severity;
    return { ...frame, gap, age, severity };
  });

  el.brainAgeGallery.innerHTML = frames.map((frame) => `
    <button class="thumb-card ${frame.id === "predicted" ? "active" : ""}" type="button" data-slice="${frame.slice}">
      <canvas width="220" height="180" aria-label="${frame.title}脑龄图像"></canvas>
      <span class="thumb-title">${frame.title}<em>${frame.age.toFixed(1)}y</em></span>
      <span class="thumb-sub">${frame.sub} · gap ${frame.gap >= 0 ? "+" : ""}${frame.gap.toFixed(1)}</span>
    </button>
  `).join("");

  const canvases = Array.from(el.brainAgeGallery.querySelectorAll("canvas"));
  canvases.forEach((canvas, index) => {
    drawBrainAgeThumbnail(canvas, frames[index], result.seed + index * 7);
  });

  if (el.atlasHint) {
    el.atlasHint.textContent = state.uploadedImage ? "上传图像 + 模型参考图像" : "实际年龄 → 预测脑龄 → 风险参考";
  }
}

function drawBrainAgeThumbnail(canvas, frame, seed) {
  const mini = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h * 0.49;
  const rx = w * (0.30 - frame.severity * 0.018);
  const ry = h * (0.39 - frame.severity * 0.022);

  mini.clearRect(0, 0, w, h);
  mini.fillStyle = "#02050a";
  mini.fillRect(0, 0, w, h);

  mini.save();
  mini.beginPath();
  mini.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  mini.clip();

  const base = mini.createRadialGradient(cx, cy, 5, cx, cy, rx);
  base.addColorStop(0, frame.severity > .7 ? "#a49191" : "#a7b1bd");
  base.addColorStop(.48, frame.severity > .5 ? "#716b73" : "#6c7887");
  base.addColorStop(1, "#17202c");
  mini.fillStyle = base;
  mini.fillRect(0, 0, w, h);

  let value = seed * 1201;
  function random() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  }

  for (let i = 0; i < 130; i += 1) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random());
    mini.fillStyle = `rgba(232, 240, 250, ${0.035 + random() * 0.075})`;
    mini.beginPath();
    mini.arc(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r, 0.8 + random() * 1.6, 0, Math.PI * 2);
    mini.fill();
  }

  mini.lineWidth = 1.2;
  for (let i = 0; i < 9; i += 1) {
    const y = cy - ry * .56 + i * (ry * 1.1 / 8);
    mini.strokeStyle = i % 2 === 0 ? "rgba(13, 21, 34, .35)" : "rgba(235, 241, 250, .12)";
    mini.beginPath();
    mini.moveTo(cx - rx * .52, y);
    mini.bezierCurveTo(cx - rx * .18, y + 10, cx + rx * .2, y - 12, cx + rx * .54, y + 5);
    mini.stroke();
  }

  const vent = 0.78 + frame.severity * 0.62;
  mini.fillStyle = "rgba(6, 12, 22, .72)";
  mini.beginPath();
  mini.ellipse(cx - rx * .12, cy, rx * .08 * vent, ry * .18 * vent, -.2, 0, Math.PI * 2);
  mini.ellipse(cx + rx * .12, cy, rx * .08 * vent, ry * .18 * vent, .2, 0, Math.PI * 2);
  mini.fill();
  mini.restore();

  mini.strokeStyle = "rgba(218, 231, 248, .22)";
  mini.lineWidth = 1.4;
  mini.beginPath();
  mini.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  mini.stroke();

  if (state.heatmap || frame.severity > .52) {
    const alpha = 0.12 + frame.severity * 0.28;
    const heat = mini.createRadialGradient(cx - rx * .32, cy + ry * .16, 0, cx - rx * .32, cy + ry * .16, rx * .46);
    heat.addColorStop(0, `rgba(255, 92, 94, ${alpha})`);
    heat.addColorStop(.52, `rgba(255, 187, 92, ${alpha * .58})`);
    heat.addColorStop(1, "rgba(255, 187, 92, 0)");
    mini.fillStyle = heat;
    mini.beginPath();
    mini.arc(cx - rx * .32, cy + ry * .16, rx * .48, 0, Math.PI * 2);
    mini.fill();

    const heatRight = mini.createRadialGradient(cx + rx * .33, cy + ry * .15, 0, cx + rx * .33, cy + ry * .15, rx * .45);
    heatRight.addColorStop(0, `rgba(255, 92, 94, ${alpha * .9})`);
    heatRight.addColorStop(1, "rgba(255, 187, 92, 0)");
    mini.fillStyle = heatRight;
    mini.beginPath();
    mini.arc(cx + rx * .33, cy + ry * .15, rx * .46, 0, Math.PI * 2);
    mini.fill();
  }

  mini.fillStyle = "rgba(255, 255, 255, .08)";
  mini.fillRect(w * .1, h * .48, w * .8, 1);
}

function drawUploadedImage(w, h) {
  ctx.fillStyle = "#02050a";
  ctx.fillRect(0, 0, w, h);
  const img = state.uploadedImage;
  const scale = Math.min(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  const x = (w - iw) / 2;
  const y = (h - ih) / 2;
  ctx.drawImage(img, x, y, iw, ih);
  ctx.fillStyle = "rgba(2, 5, 10, .08)";
  ctx.fillRect(0, 0, w, h);
}

function drawSyntheticMri(w, h) {
  const item = currentCase();
  const view = viewForSlice(state.slice);
  const sampleSrc = item.views?.[view] || item.preview;
  const sampleImage = getCachedSampleImage(sampleSrc);
  if (sampleImage) {
    drawReferenceScan(sampleImage, w, h);
    return;
  }

  const sliceOffset = (state.slice - 12) / 12;
  const cx = w / 2;
  const cy = h / 2 + sliceOffset * 8;
  const rx = w * (0.35 - Math.abs(sliceOffset) * 0.025);
  const ry = h * (0.42 - Math.abs(sliceOffset) * 0.035);

  ctx.fillStyle = "#02050a";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  const base = ctx.createRadialGradient(cx, cy, 20, cx, cy, rx);
  base.addColorStop(0, "#9ba7b4");
  base.addColorStop(.42, "#6d7886");
  base.addColorStop(.78, "#364354");
  base.addColorStop(1, "#161f2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  drawBrainTexture(cx, cy, rx, ry, item.seed + state.slice);
  drawSulci(cx, cy, rx, ry, item.seed);
  drawVentricles(cx, cy, rx, ry, item.risk);
  ctx.restore();

  ctx.strokeStyle = "rgba(210, 226, 245, .32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(77, 163, 255, .11)";
  ctx.fillRect(w * .05, h * .5, w * .9, 1);
  ctx.fillRect(w * .5, h * .05, 1, h * .9);
}

function drawReferenceScan(image, w, h) {
  ctx.fillStyle = "#0f1117";
  ctx.fillRect(0, 0, w, h);

  const frameW = w * 0.86;
  const frameH = h * 0.72;
  const scale = Math.min(frameW / image.width, frameH / image.height);
  const iw = image.width * scale;
  const ih = image.height * scale;
  const x = (w - iw) / 2;
  const y = (h - ih) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, .35)";
  ctx.shadowBlur = 24;
  ctx.drawImage(image, x, y, iw, ih);
  ctx.restore();

  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * .12, w / 2, h / 2, w * .58);
  vignette.addColorStop(0, "rgba(255, 255, 255, .04)");
  vignette.addColorStop(0.72, "rgba(0, 0, 0, .06)");
  vignette.addColorStop(1, "rgba(0, 0, 0, .45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255, 255, 255, .10)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, iw, ih);

  ctx.fillStyle = "rgba(77, 163, 255, .13)";
  ctx.fillRect(w * .08, h * .5, w * .84, 1);
  ctx.fillRect(w * .5, h * .08, 1, h * .84);
}

function drawBrainTexture(cx, cy, rx, ry, seed) {
  let value = seed * 997;
  function random() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  }
  for (let i = 0; i < 520; i += 1) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random());
    const x = cx + Math.cos(a) * rx * r;
    const y = cy + Math.sin(a) * ry * r;
    const alpha = 0.025 + random() * 0.06;
    const size = 1 + random() * 2.8;
    ctx.fillStyle = `rgba(230, 239, 250, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSulci(cx, cy, rx, ry, seed) {
  ctx.lineWidth = 2;
  for (let i = 0; i < 19; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const y = cy - ry * .62 + i * (ry * 1.2 / 18);
    const offset = Math.sin((i + seed) * .8) * 18;
    ctx.strokeStyle = i % 3 === 0 ? "rgba(15, 24, 38, .32)" : "rgba(230, 238, 250, .10)";
    ctx.beginPath();
    ctx.moveTo(cx + side * rx * .08 + offset, y);
    ctx.bezierCurveTo(
      cx + side * rx * .25,
      y + 20,
      cx + side * rx * .35,
      y - 22,
      cx + side * rx * .55,
      y + 4
    );
    ctx.stroke();
  }
}

function drawVentricles(cx, cy, rx, ry, risk) {
  const scale = risk === "high" ? 1.22 : risk === "medium" ? 1.08 : .94;
  ctx.fillStyle = "rgba(7, 13, 22, .72)";
  ctx.beginPath();
  ctx.ellipse(cx - rx * .11, cy - ry * .02, rx * .085 * scale, ry * .18 * scale, -.22, 0, Math.PI * 2);
  ctx.ellipse(cx + rx * .11, cy - ry * .02, rx * .085 * scale, ry * .18 * scale, .22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(180, 196, 212, .18)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + ry * .11, rx * .08 * scale, ry * .055 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeatmap(w, h) {
  const result = state.result || currentCase();
  const heatPoints = result.heat || currentCase().heat;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  heatPoints.forEach((point) => {
    const x = point.x * w;
    const y = point.y * h;
    const r = point.r * w;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(255, 82, 88, ${point.a})`);
    gradient.addColorStop(.45, `rgba(255, 188, 88, ${point.a * .72})`);
    gradient.addColorStop(1, "rgba(255, 188, 88, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function syncFromCase(id) {
  const item = cases.find((caseItem) => caseItem.id === id);
  if (!item) return;
  state.caseId = item.id;
  state.age = item.age;
  state.sex = item.sex;
  state.uploadedImage = null;
  state.uploadedName = "";
  state.result = deriveResult();
  renderCaseButtons();
  renderResult();
  renderMri();
}

function analyze() {
  if (state.analyzing) return;
  state.analyzing = true;
  el.analyzeBtn.disabled = true;
  el.analysisState.textContent = "分析中";

  let step = 0;
  setPipeline(step);
  const stepDelay = state.motion ? 420 : 80;

  const timer = window.setInterval(() => {
    step += 1;
    if (step >= el.pipelineSteps.length) {
      window.clearInterval(timer);
      state.result = deriveResult();
      state.analyzing = false;
      el.analyzeBtn.disabled = false;
      setPipeline(0, true);
      renderResult();
      renderMri();
      return;
    }
    setPipeline(step);
  }, stepDelay);
}

function bindEvents() {
  el.caseList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-case]");
    if (button) {
      syncFromCase(button.dataset.case);
    }
  });

  el.brainAgeGallery.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slice]");
    if (!button) return;
    state.slice = Number(button.dataset.slice);
    el.sliceRange.value = String(state.slice);
    el.sliceValue.textContent = String(state.slice);
    renderMri();
    renderResult();
  });

  el.ageInput.addEventListener("input", () => {
    state.age = clamp(Number(el.ageInput.value || 0), 35, 95);
    state.result = deriveResult();
    renderResult();
  });

  el.sexInput.addEventListener("change", () => {
    state.sex = el.sexInput.value;
    state.result = deriveResult();
    renderResult();
  });

  el.sliceRange.addEventListener("input", () => {
    state.slice = Number(el.sliceRange.value);
    el.sliceValue.textContent = state.slice;
    renderMri();
    renderResult();
  });

  el.heatmapToggle.addEventListener("change", () => {
    state.heatmap = el.heatmapToggle.checked;
    renderMri();
  });

  el.motionToggle.addEventListener("change", () => {
    state.motion = el.motionToggle.checked;
    renderResult();
  });

  el.analyzeBtn.addEventListener("click", analyze);

  el.resetBtn.addEventListener("click", () => {
    state.view = "doctor";
    state.slice = 12;
    state.heatmap = true;
    state.motion = true;
    el.sliceRange.value = 12;
    el.sliceValue.textContent = "12";
    el.heatmapToggle.checked = true;
    el.motionToggle.checked = true;
    syncFromCase("mci");
    setPipeline(0);
    el.analysisState.textContent = "待分析";
  });

  el.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      renderResult();
      if (state.view === "prd" && el.prdDrawer) {
        el.prdDrawer.scrollTop = 0;
      }
    });
  });

  if (el.prdCloseBtn) {
    el.prdCloseBtn.addEventListener("click", () => {
      state.view = "doctor";
      renderResult();
    });
  }

  if (el.prdBackdrop) {
    el.prdBackdrop.addEventListener("click", () => {
      state.view = "doctor";
      renderResult();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.view === "prd") {
      state.view = "doctor";
      renderResult();
    }
  });

  el.mriUpload.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        state.uploadedImage = image;
        state.uploadedName = file.name;
        state.result = deriveResult();
        renderCaseButtons();
        renderResult();
        renderMri();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function init() {
  state.result = deriveResult();
  renderCaseButtons();
  bindEvents();
  setPipeline(0);
  renderResult();
  renderMri();
}

init();
