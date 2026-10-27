# 🧪 Reflected XSS Lab

### Agam Ghotra · IIT2024226

> A local-only educational demo of reflected Cross-Site Scripting (XSS), prepared for the Cyber Security (IT-30001) assignment.

> [!NOTE]
> The app binds to `127.0.0.1` and does not collect data, use cookies, or contact external systems.

---

## 📋 Requirements
- Node.js 18 or newer
- npm

## 🚀 Run locally
1. Open Terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Open `http://127.0.0.1:3000` in your browser.

## 🔎 Demonstration
- Open the comment board and choose **Vulnerable mode** or **Mitigated mode**.
- Enter your own comment or test case and select **Add comment**.
- Compare how the comment is reflected: vulnerable mode inserts it without output encoding, while mitigated mode displays encoded markup as text.
- The form is intentionally empty; no test case is prefilled. Comments are reflected in the response and are not stored.

## 🛠️ Implementation notes
- `GET /?mode=vulnerable&q=...` reflects the submitted comment without output encoding in the result area.
- `GET /?mode=safe&q=...` applies HTML entity encoding before reflection.
- The comment form preserves its textarea content safely in both modes; the deliberately vulnerable output location is the reflected comment area.
- `GET /health` returns a basic health status.

## 📸 Evidence to capture yourself
Capture screenshots of:
1. The vulnerable mode showing the result of a test case you entered yourself.
2. The mitigated mode displaying the same input as text.
3. The app running locally in the browser.

Screenshots are intentionally not fabricated or prefilled. Add your own genuine captures to an `evidence/` folder before final submission if required.

## ⚠️ Limitations
This is a teaching example, not a production-ready application. For real applications, use framework auto-escaping, context-aware output encoding, safe DOM APIs such as `textContent`, sanitization only when rich HTML is required, and a Content Security Policy as defense in depth.
