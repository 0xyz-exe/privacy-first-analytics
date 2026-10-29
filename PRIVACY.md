# Privacy Architecture & Data Processing Overview

**Privacy-First Analytics** is engineered around the principle of strict data minimization and privacy-by-design.

---

## 1. What We Collect

When a visitor loads a website running Privacy-First Analytics, the client tracker collects only the following minimal payload:

- **Page Path:** Normalized pathname (e.g. `/docs/getting-started`). Any query parameters containing sensitive tokens or credentials (`token`, `auth`, `email`, `session_id`) are stripped before processing. Safe UTM tags (`utm_source`, `utm_medium`, `utm_campaign`) are preserved if configured.
- **Page Title:** The `document.title` string.
- **Referrer Domain:** Extracted domain host (e.g., `github.com`, `news.ycombinator.com`). Search keywords and user query strings are deliberately discarded.
- **Device & Browser Family:** Generalized categories derived from the `User-Agent` (e.g., `Desktop`, `macOS`, `Chrome`).
- **Country Code:** Coarse geographic location (country-level only) extracted via edge proxy headers (`cf-ipcountry` or `x-vercel-ip-country`). No precise GPS or city coordinates are collected.

---

## 2. What We NEVER Collect

- **NO Persistent Cookies:** No cookies are ever placed in the visitor's browser.
- **NO Browser Fingerprinting:** Zero canvas rendering, WebGL probing, audio context analysis, or font enumeration.
- **NO Raw IP Addresses:** The server hashes incoming IP addresses in memory using a daily-rotating salt:
  $$\text{Visitor Hash} = \text{SHA256}(\text{IP} \parallel \text{Website ID} \parallel \text{UTC Date} \parallel \text{Salt})$$
  Raw IP addresses are discarded immediately and never persisted to the database.
- **NO Cross-Site Tracking:** Daily hashes reset at 00:00 UTC and include the `Website ID`, making it mathematically impossible to link a visitor across multiple days or across different websites.
- **NO PII in Custom Events:** Custom event property payloads are automatically inspected to strip keys containing `email`, `password`, `token`, `ssn`, `nik`, `phone`, or credit card numbers.

---

## 3. Do Not Track (DNT) & Global Privacy Control (GPC)

Privacy-First Analytics respects user privacy signals:
- If `navigator.doNotTrack === "1"` or `Sec-GPC === "1"`, and the website administrator has enabled the DNT toggle, the event is immediately dropped client-side or rejected server-side with a `204 No Content` response.

---

## 4. Data Retention & Erasure

- Retention periods can be configured per website (default 90 days, or 30 days for strict GDPR compliance).
- Automated pruning routines delete raw events older than the retention threshold while maintaining aggregated metrics.
