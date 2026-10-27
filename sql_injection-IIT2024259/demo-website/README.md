# TechMart — SQL Injection (UNION-based) Demo

**Course:** Cyber Security (IT-30001), Autumn Semester 2026, IIIT Allahabad
**Assignment:** Web Server Security — Exploitation and Mitigation of Four Vulnerability Categories

## Ownership declaration

| Member name   | Roll number | Category        | Variant implemented                |
|---------------|-------------|------------------|-------------------------------------|
| Soham Donode  | IIT2024259  | SQL Injection    | Variant 2 — UNION-based data extraction |

## What this is

A small Flask + SQLite e-commerce demo site ("TechMart") whose product
search box is deliberately vulnerable to UNION-based SQL injection, with a
one-click toggle to switch the same endpoint into a parameterized
(mitigated) version.

## Running it

```bash
cd demo-website
pip install flask
python app.py
```

Open `http://127.0.0.1:5000/`. The navbar shows the current mode
(**VULNERABLE** / **SECURE**) with a **Switch mode** button.

## (a) Vulnerable implementation

File: `app.py`, `/search` route, vulnerable branch:

```python
query = (
    "SELECT id, name, category, price, description "
    "FROM products WHERE name LIKE '%" + q + "%'"
)
cur = db.execute(query)
```

The user-supplied search term `q` is concatenated directly into the SQL
string instead of being passed as a bound parameter.

## (b) Working exploit

With the app in **VULNERABLE** mode, enter this into the search box
(or visit the URL directly):

```
xyz' UNION SELECT id, username, role, 0, password FROM users-- -
```

URL form:

```
http://127.0.0.1:5000/search?q=xyz%27+UNION+SELECT+id%2C+username%2C+role%2C+0%2C+password+FROM+users--+-
```

The resulting query becomes:

```sql
SELECT id, name, category, price, description
FROM products WHERE name LIKE '%xyz'
UNION SELECT id, username, role, 0, password FROM users-- -%'
```

`products` has 5 columns, so the attacker's `UNION SELECT` supplies 5
values too (id, username, role, 0, password) to match. The trailing
`-- -` comments out the rest of the original query. The results table
on the page then renders rows pulled from the `users` table — usernames,
roles and passwords — through a search box that is supposed to return
only product names.

## (c) Root cause

Untrusted user input (`q`) is concatenated directly into the SQL query
string, so the attacker can change the *structure* of the query — not
just the data being searched for. Because the number and position of
columns in the `SELECT` is predictable and the application renders
every column of every returned row, `UNION SELECT` lets the attacker
splice in an arbitrary second query against any table, including ones
never referenced by the application's own UI (here, `users`).

## (d) Mitigation implemented

Parameterized (bound) queries — `app.py`, `/search` route, secure
branch:

```python
query = (
    "SELECT id, name, category, price, description "
    "FROM products WHERE name LIKE ?"
)
cur = db.execute(query, ("%" + q + "%",))
```

The database driver sends the SQL text and the user's data as two
separate channels. The input is never parsed as SQL syntax, so a
`UNION SELECT` typed into the box is treated as a literal string to
search for, not as a second query.

**Same payload, after mitigation:** click **Switch mode** to **SECURE**
and submit the exact same payload above. The page now shows "No
products matched your search." instead of leaking `users` data — see
the screenshot taken for the report / video.

## (e) Other mitigations (theory only — not implemented here)

- **Input validation with allow-lists** — restrict the search field to
  an expected character set (letters, digits, spaces) and reject or
  strip SQL metacharacters (`'`, `--`, `;`, `UNION`, etc.) before the
  query is built. Weaker than parameterization on its own because
  allow-lists are easy to get subtly wrong, but useful as defense in
  depth.
- **Least-privilege database accounts** — the application's DB user
  should only have `SELECT` rights on the `products` table it actually
  needs, and no access at all to `users`/other sensitive tables. Even
  if injection were still possible, a UNION against an inaccessible
  table would simply fail with a permissions error.
- **Safe/generic error messages** — never return raw database error
  text to the client. Verbose DB errors (as seen in this demo's
  `error-box`) leak schema details (table/column names, DB engine)
  that make follow-on injection far easier; a production app should
  log the real error server-side and show the user a generic message.

## Folder structure

```
demo-website/
├── app.py                  # Flask application (vulnerable + mitigated routes)
├── README.md                # this file
├── templates/
│   ├── index.html            # catalog + search page
│   └── results.html          # search results page
└── static/
    ├── css/style.css         # grey / green / monospace theme
    └── js/app.js              # mode-toggle button logic
```

`store.db` (SQLite) is created automatically by `app.py` on startup —
it is not shipped in the zip.

## Disclaimer

Built strictly for classroom demonstration of a known vulnerability
class and its mitigation. Do not deploy on a public server. Only the
author's own local instance should ever be tested, per the assignment's
authorised-testing instruction.
