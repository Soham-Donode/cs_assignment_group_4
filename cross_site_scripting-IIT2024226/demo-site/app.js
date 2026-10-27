const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:900px;margin:44px auto;padding:0 20px;line-height:1.6;color:#25324a;background:linear-gradient(135deg,#f5f8ff 0%,#fbfcff 55%,#f3f8f8 100%);min-height:100vh}
    h1{color:#1d3155;letter-spacing:-.03em;margin-bottom:4px}
    body>p{color:#65738b;margin-top:0}
    .card{background:#fff;border:1px solid #e1e7f0;border-top:3px solid #8da9df;border-radius:14px;padding:22px 24px;margin:20px 0;box-shadow:0 8px 24px rgba(37,50,74,.06)}
    .card h2{color:#304a76;margin-top:0}
    textarea{display:block;width:100%;min-height:110px;padding:11px 12px;margin:8px 0 14px;border:1px solid #cbd5e3;border-radius:8px;font:inherit;resize:vertical}
    textarea:focus{outline:3px solid #dce8ff;border-color:#6889ca}
    button{padding:10px 16px;cursor:pointer;border:0;border-radius:8px;background:#4169a8;color:#fff;font:inherit;font-weight:600;transition:background .15s ease}
    button:hover{background:#31568f}
    button:focus-visible,a:focus-visible{outline:3px solid #9ab8f0;outline-offset:3px}
    .warning{color:#873c2b;background:#fff4ef;border:1px solid #f3d9ce;padding:12px 14px;border-radius:9px}
    .mode-switch{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
    .mode-switch a{display:inline-block;padding:8px 13px;border:1px solid #d7e0ee;border-radius:8px;background:#fff}
    .mode-switch a[aria-current="page"]{color:#fff;background:#4169a8;border-color:#4169a8}
    .result{min-height:54px;background:#f4f7fc;border:1px solid #e4eaf3;padding:14px 16px;border-radius:9px;overflow-wrap:anywhere}
    .result-label{font-size:.9rem;font-weight:650;color:#526682}
    a{color:#365f9f;text-decoration:none;font-weight:550}
    a:hover{text-decoration:underline}
    @media(max-width:600px){body{margin:28px auto;padding:0 14px}.card{padding:18px}}
  </style>
</head>
<body>
  <h1>Reflected XSS Educational Lab</h1>
  <p>Local-only demonstration for Cyber Security coursework. Use only on your own machine.</p>
  ${body}
</body>
</html>`;
}

app.get("/", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const vulnerable = req.query.mode === "vulnerable";
  const rendered = vulnerable ? q : escapeHtml(q);
  const warning = vulnerable
    ? '<p class="warning"><strong>Vulnerable mode:</strong> this local demo reflects the submitted comment into HTML without output encoding. Use only on this local application.</p>'
    : '<p>This mode HTML-escapes the submitted comment before reflecting it into the response.</p>';

  res.type("html").send(page("Reflected XSS Lab", `
    <div class="card">
      <h2>Comment board</h2>
      <p>Choose a mode, enter your own test case, and submit it as a comment. Comments are reflected in this response only; they are not saved.</p>
      <nav class="mode-switch" aria-label="Demo mode">
        <a href="/?mode=vulnerable" ${vulnerable ? 'aria-current="page"' : ""}>Vulnerable mode</a>
        <a href="/?mode=safe" ${!vulnerable ? 'aria-current="page"' : ""}>Mitigated mode</a>
      </nav>
      ${warning}
      <form method="GET" action="/" autocomplete="off">
        <input type="hidden" name="mode" value="${vulnerable ? "vulnerable" : "safe"}">
        <label for="q">Add a comment</label>
        <textarea id="q" name="q" placeholder="Write your own comment or test case">${escapeHtml(q)}</textarea>
        <button type="submit">Add comment</button>
      </form>
      <h3>Reflected comment</h3>
      <p class="result-label">Your submitted comment</p>
      <div class="result">${q ? rendered : "No comment submitted yet."}</div>
    </div>
    <div class="card">
      <h2>What to compare</h2>
      <ul>
        <li>Vulnerable mode reflects the comment without HTML output encoding.</li>
        <li>Mitigated mode encodes the comment so markup is displayed as text instead of being interpreted by the browser.</li>
      </ul>
      <p><strong>Important:</strong> this lab has no login, cookies, database, external network calls, or data collection. The comment is not stored.</p>
    </div>
  `));
});

app.get("/health", (_req, res) => res.json({ status: "ok", lab: "reflected-xss" }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Reflected XSS lab running at http://127.0.0.1:${PORT}`);
});
