# Security

## Reporting a problem

Please **do not** open a public issue for a security bug. Use GitHub's private
[security advisory](https://github.com/yaswantpandey/gdg_hackthon/security/advisories/new) form instead.
We aim to reply within 7 days. Wrong drug names or prices are not security bugs: open a normal issue for those.

## What we protect, and how

| Risk | What we do | Where |
|---|---|---|
| **Wrong drug facts from AI** | Gemma only reads text off a photo. Generic name, strength and price come only from `src/data/drugs.json`. Not in the data → "Not found in our data". | `src/lib/search.js`, `server/parse.js` |
| **Untrusted model output** | The reply is parsed defensively: first valid `{…}` only, `name`/`strength` strings only, control characters stripped, length capped, must contain a real word. The browser re-checks it, uses it **only** as the value of the editable search box (never HTML, never a URL), and search accepts it only if it matches the dataset. | `server/parse.js`, `src/lib/scan.js` |
| **XSS** | React escapes all text; no `innerHTML`, `dangerouslySetInnerHTML` or `eval` (enforced by a test). A strict CSP (`script-src 'self'`) is injected into the production build. | `vite.config.js`, `tests/security.test.js` |
| **Malicious uploads** | One image per request, held in memory only. Type is checked from the **bytes** (JPEG/PNG/WebP magic numbers), not the header. Size limit 2 MB. Anything else → 413/415 before the model is called. | `server/app.js`, `server/image.js` |
| **Abuse / cost** | 10 scans per minute per IP, at most 2 model calls at once, 60 s model timeout, 30 s request timeout (slowloris). | `server/app.js`, `server/index.js` |
| **Strangers using our API key** | The proxy binds to `127.0.0.1` by default, so people on the same Wi-Fi cannot reach it. The key is server-side only; it is never in a `VITE_` variable or the bundle. | `server/index.js`, `.env.example` |
| **Cross-origin calls** | CORS allow-list (`ALLOWED_ORIGINS`); unknown origins get no allow header and a 403 preflight. CORS only limits browsers, which is why binding and rate limits exist too. | `server/app.js` |
| **Leaking health data** | No image is written to disk or logged. Logs hold only method, path, status and time: no body, no IP. The phone shrinks the photo and re-encodes it, which strips EXIF (GPS, device). The prescription list lives only in the phone's IndexedDB and stores drug ids, not prices. | `server/app.js`, `src/lib/scan.js` |
| **Caching / sniffing** | API responses: `Cache-Control: no-store`, `nosniff`, `default-src 'none'`. The service worker never answers `/api/*`. | `server/app.js`, `vite.config.js` |
| **Secrets in git** | `.env` is git-ignored; tests fail if `.env.example` holds a key or any tracked file looks like one. | `.gitignore`, `tests/security.test.js` |
| **Vulnerable dependencies** | `npm audit` is clean at the time of writing; the lockfile is committed. | `package-lock.json` |

## Known limits (honest list)

- **Hosted Gemma sees the photo.** With `GEMMA_PROVIDER=hosted` the image goes to Google's Gemini API. On the free tier Google may use inputs to improve its products. For real prescriptions use local Ollama (`GEMMA_PROVIDER=ollama`) or a paid tier.
- **EXIF is stripped on the phone, not on the server.** Someone calling the API directly could send EXIF to the model provider; it is still never stored by us.
- **Rate limits are per process and in memory.** Running several server instances needs a shared store (e.g. Redis).
- **Plain HTTP on the LAN** is for local testing only. Deploy behind HTTPS (`public/_headers` adds HSTS on Netlify/Cloudflare).
- **`frame-ancestors`** cannot be set from a `<meta>` CSP; it is sent as a real header by `vite preview` and `public/_headers`. Copy those headers to your host if it is not Netlify/Cloudflare.

## Checklist before a release

```bash
npm test          # includes security.test.js
npm audit
git grep -nIE "AIza|AQ\.|sk-" -- . ":!package-lock.json"   # should print nothing
```
