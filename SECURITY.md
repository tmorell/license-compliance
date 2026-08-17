# Security Policy

The `license-compliance` project takes the security of our software and its supply chain seriously. This document outlines our security policy, supported versions, reporting procedures, and maintainer responsibilities.

---

## Supported Versions

Security updates and patches are actively provided for the following versions of `license-compliance`:

| Version | Supported          | Notes                                  |
| ------- | ------------------ | -------------------------------------- |
| `4.x.x` | :white_check_mark: | Current stable major version (latest)  |
| `3.x.x` | :x:                | End of Life (EOL) — upgrade to `4.x.x` |
| `< 3.0` | :x:                | End of Life (EOL) — unsupported        |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or public discussions.**

If you believe you have discovered a security vulnerability in `license-compliance`, please report it privately using one of the following channels:

### Preferred Channels

1. **GitHub Private Vulnerability Reporting**:
   Navigate to the repository's [Security tab](https://github.com/tmorell/license-compliance/security) and click **"Report a vulnerability"** to submit a report directly and confidentially.

2. **Direct Email**:
   Send an encrypted or standard email to the maintainer at [teomorell@gmail.com](mailto:teomorell@gmail.com) with the subject line `[SECURITY] Vulnerability Report - license-compliance`.

### What to Include in Your Report

To help us triage and respond to your report quickly, please include:

- A descriptive summary of the vulnerability and its potential impact.
- Detailed steps to reproduce the issue (including any minimal reproduction scripts, payloads, or sample configurations).
- Affected versions of `license-compliance` and Node.js environment details.
- Any proposed fixes or remediations, if available.

---

## Response SLA & Disclosure Process

When a security vulnerability is reported, we commit to the following response timeline:

1. **Acknowledgment**: You will receive an initial response acknowledging receipt within **48 hours**.
2. **Triage & Status Update**: The maintainer will investigate the report and provide an initial assessment/status update within **7 days**.
3. **Patch & Coordinated Disclosure**:
    - If validated, a fix will be developed in a private security advisory branch.
    - A patch release (e.g., `4.x.y`) will be published as soon as verified.
    - A GitHub Security Advisory (GHSA) will be published alongside the release notes, with full credit given to the reporter (unless anonymity is requested).
