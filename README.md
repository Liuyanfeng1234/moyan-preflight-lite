# Moyan Preflight Lite

A pre-launch security check-up for AI agents — deterministic, fully local, reproducible.

Paste your agent's specification (system prompt + tool list + behaviour rules) and get an evidence-graded verdict in seconds. No server, no model call, no network: the same spec always produces the same verdict, and every report carries a SHA-256 fingerprint you can re-verify.

## Run it

No build step. Serve the folder statically and open `index.html`:

```bash
npx serve .        # or: python3 -m http.server
```

Then load one of the three built-in samples (risky / mid-risk / clean) or paste your own spec and click **Run preflight check**.

## Verify the engine headlessly

```bash
node tests/run-local-checks.mjs
```

Checks sample verdicts (DO NOT SHIP / FIX BEFORE LAUNCH / READY), determinism (identical repeat runs), and empty-input handling.

## How it works

`js/local-checks.js` is a transparent rule engine scanning for launch-blocking patterns — exposed credentials, unrestricted shell access, irreversible actions without approval gates, prompt-injection trust, cross-user memory sharing, PII egress, missing audit logs, missing refusal boundaries — with a negation guard so clearly-forbidden behaviour is not flagged. Rules are distilled from a public exam bank of real-world AI-agent security incidents maintained by Sixu AI · Moyan Audit.

## Provenance & license

The rule engine (`js/local-checks.js`) and samples (`js/samples.js`) are reused verbatim from the team's previously shipped Moyan Preflight web app; the Lite shell, fingerprinting and submission materials were produced for SLAY HACKS 2026. MIT licensed — see `LICENSE`.

*Preflight Lite is a screening tool, not a certification. High-stakes agents still need a full human-led audit.*
