# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability within Privacy-First Analytics, please report it responsibly.

**Do NOT report security vulnerabilities via public GitHub issues.**

Instead, please send an encrypted or direct email to:
- **Email:** danielachmadf@gmail.com
- **Maintainer:** `0xyz-exe`

Please include:
1. Description of the vulnerability.
2. Steps to reproduce or proof-of-concept payload.
3. Potential impact on user data or tenant isolation.

We acknowledge receipt of reports within 24 hours and will provide a timeline for remediation.

---

## Security Architecture

1. **Authentication:** Passwords are encrypted with `bcrypt` using 10 salt rounds.
2. **Session Security:** Session tokens use cryptographically signed JWTs (`HS256`) stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
3. **Database Integrity:** Parameterized queries with prepared statements are strictly enforced across all database queries to prevent SQL injection.
4. **Tenant Isolation:** Multi-tenant boundaries are verified on the server side (`verifyWebsiteAccess`).
5. **PII Redaction:** In-memory sanitization routines strip potential personal identifiable information from URLs and custom event payloads before database storage.
