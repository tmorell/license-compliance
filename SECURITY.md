# Security Policy

The `license-compliance` project takes the security of our software and its supply chain seriously. This document outlines our security policy, supported versions, reporting procedures, and maintainer responsibilities.

`license-compliance` is maintained on a best-effort, largely solo basis. The timelines below are targets we aim for, not guaranteed SLAs; please bear with us if a response takes a little longer than stated.

---

## Supported Versions

Security updates and patches are actively provided for the following versions of `license-compliance`:

| Version | Supported          | Notes                                  |
| ------- | ------------------ | -------------------------------------- |
| `4.x.x` | :white_check_mark: | Current stable major version (latest)  |
| `3.x.x` | :x:                | End of Life (EOL) — upgrade to `4.x.x` |
| `< 3.0` | :x:                | End of Life (EOL) — unsupported        |

We also run continuous automated dependency and supply-chain scanning (Snyk, Socket, SonarCloud) as part of CI, in addition to responding to manually reported issues.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or public discussions.**

If you believe you have discovered a security vulnerability in `license-compliance`, please report it privately using one of the following channels:

### Preferred Channels

1. **GitHub Private Vulnerability Reporting**:
   Navigate to the repository's [Security tab](https://github.com/tmorell/license-compliance/security) and click **"Report a vulnerability"** to submit a report directly and confidentially.

2. **Direct Email**:
   Send an encrypted or standard email to the maintainer at [teomorell@gmail.com](mailto:teomorell@gmail.com) with the subject line `[SECURITY] Vulnerability Report - license-compliance`.

### Scope

**In scope:**

- Vulnerabilities in `license-compliance`'s own source code (CLI, library entry points, formatters, configuration resolution, etc.).
- Issues that could lead to unintended code execution, privilege escalation, or data exposure when using `license-compliance` as documented.

**Out of scope:**

- Vulnerabilities in third-party dependencies. Please report these directly to the upstream project (though letting us know is still appreciated so we can track and update).
- Issues that require an already-compromised environment, a malicious `.license-compliancerc.js` file the user chose to run themselves, or other scenarios requiring pre-existing local access.
- Denial-of-service reports based purely on large or pathological inputs, without a demonstrated practical impact.

If you're unsure whether something is in scope, report it anyway; we'd rather triage a false positive than miss a real issue.

### What to Include in Your Report

To help us triage and respond to your report quickly, please include:

- A descriptive summary of the vulnerability and its potential impact.
- Detailed steps to reproduce the issue (including any minimal reproduction scripts, payloads, or sample configurations).
- Affected versions of `license-compliance` and Node.js environment details.
- Any proposed fixes or remediation, if available.

### Safe Harbor

We consider security research conducted in good faith, without accessing or modifying data beyond what's needed to demonstrate the issue, without disrupting the service or other users, and reported to us before any public disclosure. We will not pursue legal action against researchers who follow this policy.

---

## Response SLA & Disclosure Process

When a security vulnerability is reported, here's what to expect:

1. **Acknowledgment**: We aim to send an initial response acknowledging receipt within **48 hours**.
2. **Triage & Status Update**: We aim to investigate and provide an initial assessment or status update within **7 days**. If a report turns out to be invalid, out of scope, or a duplicate, we'll let you know at this stage along with our reasoning.
3. **Patch & Coordinated Disclosure**:
    - If validated, a fix will be developed in a private security advisory branch.
    - A patch release (e.g., `4.x.y`) will be published as soon as verified.
    - A GitHub Security Advisory (GHSA) will be published alongside the release notes, with full credit given to the reporter (unless anonymity is requested).

These are best-effort targets from a small maintainer team; if you haven't heard back within the acknowledgment window, a polite follow-up on the same thread is always welcome.
