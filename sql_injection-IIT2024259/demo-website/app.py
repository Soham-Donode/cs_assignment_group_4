"""
TechMart - Demo E-Commerce Web Application
SQL Injection (UNION-based) Exploitation & Mitigation Demo
--------------------------------------------------------------
Course   : Cyber Security (IT-30001), Autumn 2026, IIIT Allahabad
Assignment: Web Server Security - Exploitation and Mitigation
Student  : Soham Donode (IIT2024259)
Variant  : SQL Injection - Variant 2 (UNION-based data extraction)

HOW TO RUN
----------
    pip install flask
    python app.py

Then open http://127.0.0.1:5000/

There is a toggle in the navbar: "Mode: VULNERABLE / SECURE".
This flips the backend between the unsafe (string-concatenated)
query and the safe (parameterized) query, so the SAME payload can
be demonstrated failing against the mitigated endpoint.

!!! FOR LOCAL, ISOLATED, EDUCATIONAL DEMONSTRATION ONLY !!!
Do not deploy this application on a public server. It is
intentionally vulnerable for classroom purposes.
"""

from flask import Flask, render_template, request, g, jsonify
import sqlite3
import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(APP_DIR, "store.db")

app = Flask(__name__)

# Global in-memory flag: toggles between vulnerable and secure query paths.
# (A real app would never do this; it exists purely so the viva demo can
#  flip modes live and show the same payload blocked after mitigation.)
STATE = {"mode": "vulnerable"}


# --------------------------------------------------------------------------
# Database setup
# --------------------------------------------------------------------------
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL
        )
    """)

    # This table is NEVER linked to from the UI. A correctly built app
    # would not expose it through any public query. The UNION-based
    # attack's entire point is to reach it anyway through the product
    # search endpoint.
    cur.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            credit_card TEXT NOT NULL
        )
    """)

    products = [
        (1, "Aurora Wireless Headphones", "Audio", 2999.00,
         "Over-ear ANC headphones with 40h battery life."),
        (2, "Nimbus Mechanical Keyboard", "Accessories", 4499.00,
         "Hot-swappable 75% mechanical keyboard, white backlight."),
        (3, "Pulse Smartwatch Series 4", "Wearables", 7999.00,
         "AMOLED display, SpO2 and heart-rate tracking."),
        (4, "Zenith 27in 4K Monitor", "Displays", 21999.00,
         "27-inch IPS 4K monitor, 99% sRGB, USB-C 90W."),
        (5, "Cascade Backpack 25L", "Bags", 1899.00,
         "Water-resistant daily backpack with laptop sleeve."),
        (6, "Flux Portable SSD 1TB", "Storage", 6499.00,
         "USB-C 3.2 Gen2 portable SSD, 1050MB/s read speed."),
        (7, "Orbit Desk Lamp", "Home", 1299.00,
         "Dimmable LED desk lamp with wireless charging base."),
        (8, "Vertex Gaming Mouse", "Accessories", 2199.00,
         "16000 DPI optical sensor, ultra-light shell."),
    ]
    cur.executemany(
        "INSERT INTO products (id, name, category, price, description) VALUES (?,?,?,?,?)",
        products,
    )

    # Seed "secret" data an attacker is after. credit_card is deliberately
    # fake/obviously-dummy data for the demo.
    users = [
        (1, "admin", "Sup3rSecret_Adm1n!", "admin", "4111-1111-1111-1234"),
        (2, "soham", "hostel@259", "customer", "4242-4242-4242-5678"),
        (3, "priya", "priya_pw_99", "customer", "4000-1234-5678-9010"),
    ]
    cur.executemany(
        "INSERT INTO users (id, username, password, role, credit_card) VALUES (?,?,?,?,?)",
        users,
    )

    conn.commit()
    conn.close()


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@app.route("/")
def index():
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()
    return render_template("index.html", products=products, mode=STATE["mode"])


@app.route("/toggle-mode", methods=["POST"])
def toggle_mode():
    STATE["mode"] = "secure" if STATE["mode"] == "vulnerable" else "vulnerable"
    return jsonify({"mode": STATE["mode"]})


@app.route("/search")
def search():
    """
    Product search box.

    VULNERABLE PATH (mode == "vulnerable")
    ---------------------------------------
    The search term is concatenated directly into the SQL string. This is
    the exact flaw UNION-based SQL injection targets: because the query's
    column count and the response rendering are both attacker-visible,
    an attacker can append their own SELECT (via UNION SELECT) onto the
    legitimate query and have its results rendered on the page, pulling
    data out of tables the application never intended to expose (here,
    `users`).

    SECURE PATH (mode == "secure")
    -------------------------------
    The exact same input is passed as a bound parameter ("?") instead of
    being concatenated into the SQL text. The database driver sends the
    query and the data separately, so the input can never change the
    *structure* of the query -- a UNION SELECT typed into the box is
    treated as a literal search string, not as SQL.
    """
    q = request.args.get("q", "")
    db = get_db()
    error = None
    rows = []

    try:
        if STATE["mode"] == "vulnerable":
            # --- VULNERABLE IMPLEMENTATION -----------------------------
            # String concatenation of untrusted user input into a SQL
            # statement. This is the root cause of the vulnerability.
            query = (
                "SELECT id, name, category, price, description "
                "FROM products WHERE name LIKE '%" + q + "%'"
            )
            cur = db.execute(query)
            rows = cur.fetchall()
        else:
            # --- MITIGATED IMPLEMENTATION -------------------------------
            # Parameterized query: user input is bound as data, never as
            # part of the SQL grammar, so injected SQL syntax is inert.
            query = (
                "SELECT id, name, category, price, description "
                "FROM products WHERE name LIKE ?"
            )
            cur = db.execute(query, ("%" + q + "%",))
            rows = cur.fetchall()
    except sqlite3.Error as e:
        # In the vulnerable mode a malformed payload can throw a DB error;
        # we surface it (as many real, poorly-built apps do) because
        # verbose DB errors are themselves a classic reconnaissance aid.
        error = str(e)

    return render_template(
        "results.html",
        query_text=q,
        rows=rows,
        error=error,
        mode=STATE["mode"],
    )


if __name__ == "__main__":
    init_db()
    print(f"[+] Database initialised at {DB_PATH}")
    print("[+] Starting TechMart demo on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
