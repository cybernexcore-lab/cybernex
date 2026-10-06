# CyberNex - Security Lab Vulnerability Matrix

> **Educational Disclaimer**: This matrix is part of the local CyberNex penetration-testing training lab. All vulnerabilities documented below are intentionally implemented for educational training on localhost.

---

## Vulnerability Inventory & Checklist

| Vulnerability ID | Category | Affected Page / Function | Difficulty | Learning Objective | Remediation Concept |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CN-AUTH-01** | Authentication | `/api/auth/login` (Login Form) | Beginner | Exploit SQL injection in authentication logic to bypass credential checks without knowing passwords. | Parameterize SQL query using SQLite prepared statement placeholders (`?`). |
| **CN-AUTH-02** | Authentication | `/api/auth/login` | Beginner | Differentiate valid operator usernames from invalid ones by measuring distinct application error responses. | Unify error messages to a generic string: *"Invalid operator credentials."* |
| **CN-AUTH-03** | Authentication | `/forgot-password` | Intermediate | Exploit weak password recovery flows where security tokens are leaked in responses or easily guessable. | Use cryptographically random tokens sent via out-of-band channels with short TTL. |
| **CN-AUTH-04** | Session Management | `cn_auth_token` & `cn_uid` cookies | Beginner | Tamper with predictable base64 client-side session tokens to hijack other user sessions. | Use cryptographically signed, server-validated session cookies with `HttpOnly`, `Secure`, `SameSite=Lax`. |
| **CN-AUTH-05** | Session Management | `/api/auth/logout` & GET `/logout` | Beginner | Identify GET-based logout vulnerabilities and lack of server-side token invalidation. | Use POST-based CSRF-protected logout endpoints and maintain server session revocation lists. |
| **CN-INJ-01** | Injection | `/dashboard` Threat Search (`?q=`) | Intermediate | Execute UNION-based SQL injection to extract user tables, password hashes, and system API keys. | Enforce prepared statements: `db.prepare('... WHERE title LIKE ?').all(\`%\${q}%\`)`. |
| **CN-INJ-02** | Injection | `/api/user/lookup?id=` | Beginner | Exploit raw numeric SQL injection to query and alter database records. | Cast inputs to integers or use parameterized bindings. |
| **CN-XSS-01** | Cross-Site Scripting | `/dashboard` Search Filter (`?q=`) | Beginner | Exploit reflected XSS where the user-supplied query string is rendered directly without output encoding. | Context-aware HTML entity encoding; avoid `dangerouslySetInnerHTML`. |
| **CN-XSS-02** | Cross-Site Scripting | `/dashboard` (New Incident Form) | Intermediate | Exploit stored XSS where incident title/description is persisted in DB and rendered to all viewers. | Input sanitization with DOMPurify and context-aware escaping on template output. |
| **CN-XSS-03** | Cross-Site Scripting | Client DOM Sink (`#msg=`, `?badge=`) | Intermediate | Identify DOM-based XSS where client JavaScript reads from `location.hash` and writes into an unsafe sink (`innerHTML`). | Use safe DOM properties such as `textContent` or `innerText` instead of `innerHTML`. |
| **CN-AC-01** | Access Control | `/profile?id=` & `/api/user/lookup` | Beginner | Exploit Insecure Direct Object Reference (IDOR) to access and modify another operator's private dossier. | Enforce authorization checks verifying `sessionUser.id === requestedId` or `sessionUser.role === 'admin'`. |
| **CN-AC-02** | Access Control | `DELETE /api/incidents/[id]` | Beginner | Exploit missing authorization checks to delete any security incident regardless of role or ownership. | Validate user ownership or administrative clearance before executing delete actions. |
| **CN-AC-03** | Access Control | `POST /api/user/update` | Intermediate | Perform privilege escalation via mass assignment by injecting unauthorized `role="admin"` parameters. | Implement strict allowlists of permissible fields for user-initiated updates. |
| **CN-FILE-01** | File Upload | `POST /api/upload` | Intermediate | Upload unrestricted file formats (e.g., SVG/HTML with embedded scripts) into public file storage. | Validate file extensions against strict whitelists, verify MIME headers, and store files outside public web roots. |
| **CN-FILE-02** | File Handling | `GET /api/download?file=` | Intermediate | Exploit path traversal via `../` sequences to read sensitive system configuration and backup files. | Sanitize using `path.basename(file)`, resolve paths, and ensure target remains within safe directory sandbox. |
| **CN-CSRF-01** | CSRF | `POST /api/user/update` | Intermediate | Forge cross-site requests targeting state-changing profile updates due to missing anti-CSRF protections. | Enforce anti-CSRF token verification and configure `SameSite=Lax` or `Strict` cookie policies. |
| **CN-SEC-01** | Security Misconfig | `GET /api/debug` & `GET /api/users` | Beginner | Harvest sensitive infrastructure data, secret keys, and passwords from exposed debug/listing endpoints. | Disable debug routes in production; restrict internal metrics to authenticated admin networks. |
| **CN-SEC-02** | Security Misconfig | SQL Syntax Error Responses | Beginner | Leverage verbose database error messages containing table and query syntax for reconnaissance. | Catch database exceptions and return generic, non-informative error messages. |
| **CN-MISC-01** | Open Redirect | `POST /api/auth/login` (`redirect=`) | Beginner | Manipulate open redirect parameters to redirect authenticated users to third-party phishing domains. | Validate destination URLs against an internal whitelist of relative paths. |
| **CN-MISC-02** | Business Logic | `POST /api/transfer-credits` | Intermediate | Exploit missing negative number validation in credit transfers to artificially inflate account balance. | Enforce strict input validation ensuring `amount > 0` and `amount <= sender.credits`. |

---

## Retesting & Verification Guide

1. **Exploitation Phase**:
   - Capture baseline requests using Burp Suite or OWASP ZAP.
   - Confirm reproduction with reproducible curl or browser commands.
2. **Remediation Phase**:
   - Locate the target endpoint in `src/app/api/...` or `src/app/...`.
   - Apply the recommended code patch using safe parameterization, authorization checks, or input sanitization.
3. **Verification Phase**:
   - Re-send the original exploit payload.
   - Verify that the application gracefully rejects the attack without revealing sensitive data.
