// Standalone verification for the Lite shell's deterministic layer.
// Run: node tests/run-local-checks.mjs
import assert from "node:assert/strict";
import { runLocalChecks } from "../js/local-checks.js";
import { SAMPLES } from "../js/samples.js";

let failures = 0;
for (const sample of SAMPLES) {
  const result = runLocalChecks(sample.spec);
  try {
    assert.equal(result.verdict, sample.expected, `${sample.id} verdict`);
    console.log(
      `PASS ${sample.id}: verdict=${result.verdict} score=${result.score} rating=${result.rating} findings=[${result.findings.map((f) => f.id).join(", ")}]`
    );
  } catch (err) {
    failures++;
    console.log(
      `FAIL ${sample.id}: expected ${sample.expected}, got ${result.verdict} (score=${result.score}, findings=[${result.findings.map((f) => f.id).join(", ")}])`
    );
  }
}

// Determinism: same input twice must give byte-identical results.
const a = JSON.stringify(runLocalChecks(SAMPLES[0].spec));
const b = JSON.stringify(runLocalChecks(SAMPLES[0].spec));
assert.equal(a, b, "engine must be deterministic");
console.log("PASS determinism: identical repeat run");

// Empty / junk input must not crash and must not pass as READY.
const empty = runLocalChecks("");
assert.notEqual(empty.verdict, "READY");
console.log(`PASS empty-input: verdict=${empty.verdict} score=${empty.score}`);

if (failures) {
  console.error(`${failures} sample(s) failed`);
  process.exit(1);
}
console.log("All Lite local checks passed.");
