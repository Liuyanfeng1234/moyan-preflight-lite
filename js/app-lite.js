// Moyan Preflight Lite — deterministic-only front end.
// The rule engine (local-checks.js) and samples are reused verbatim from the
// Moyan Preflight web app (R-004); this shell drops the Firebase / model
// layers so the whole demo runs offline from static files.
import { SAMPLES } from "./samples.js";
import { runLocalChecks } from "./local-checks.js";

const specInput = document.getElementById("specInput");
const runButton = document.getElementById("runButton");
const resultPanel = document.getElementById("resultPanel");
const verdictCard = document.getElementById("verdictCard");
const verdictLabel = document.getElementById("verdictLabel");
const verdictMeta = document.getElementById("verdictMeta");
const hashValue = document.getElementById("hashValue");
const findingsEl = document.getElementById("findings");
const sampleButtons = document.getElementById("sampleButtons");

for (const sample of SAMPLES) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = sample.name;
  btn.addEventListener("click", () => {
    specInput.value = sample.spec;
    specInput.focus();
  });
  sampleButtons.appendChild(btn);
}

function verdictClass(verdict) {
  if (verdict === "DO NOT SHIP") return "bad";
  if (verdict === "FIX BEFORE LAUNCH" || verdict === "MINOR FIXES") return "warn";
  return "ok";
}

function renderFindings(findings) {
  findingsEl.innerHTML = "";
  if (!findings.length) {
    const p = document.createElement("p");
    p.className = "clean";
    p.textContent = "No deterministic findings. (Heuristic layer — a clean pass here is a screening result, not a guarantee.)";
    findingsEl.appendChild(p);
    return;
  }
  for (const f of findings) {
    const div = document.createElement("div");
    div.className = `finding ${f.severity}`;
    const sev = document.createElement("div");
    sev.className = "sev";
    sev.textContent = `${f.severity} · ${f.id}`;
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = f.title;
    const rec = document.createElement("div");
    rec.className = "rec";
    rec.textContent = `Fix: ${f.recommendation}`;
    const ev = document.createElement("div");
    ev.className = "ev";
    ev.textContent = `Evidence: ${f.evidence.join(" | ")}`;
    div.append(sev, title, rec, ev);
    findingsEl.appendChild(div);
  }
}

async function fingerprint(spec, result) {
  const payload = JSON.stringify({
    spec,
    verdict: result.verdict,
    score: result.score,
    findings: result.findings.map((f) => f.id),
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

runButton.addEventListener("click", async () => {
  const spec = specInput.value.trim();
  if (!spec) {
    specInput.focus();
    return;
  }
  runButton.disabled = true;
  runButton.textContent = "Checking…";
  try {
    const result = runLocalChecks(spec);
    resultPanel.hidden = false;
    verdictCard.className = `verdict-card ${verdictClass(result.verdict)}`;
    verdictLabel.textContent = result.verdict;
    verdictMeta.textContent = `Risk score ${result.score}/100 · rating ${result.rating} · ${result.findings.length} deterministic finding(s)`;
    hashValue.textContent = await fingerprint(spec, result);
    renderFindings(result.findings);
    resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    runButton.disabled = false;
    runButton.textContent = "Run preflight check";
  }
});
