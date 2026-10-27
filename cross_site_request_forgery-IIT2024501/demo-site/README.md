# Lab Assignment 4: CSRF Attack Demo

**Group:** Group 4  
**Made by:** Aryan Srivastava (IIT2024501)

---

## Overview

This repository demonstrates a **Cross-Site Request Forgery (CSRF)** attack and its mitigation using a two-site setup:

| Folder | Role |
|---|---|
| `profile/` | Legitimate website with a user profile page with a login system and a sensitive `change-email` API endpoint |
| `attacker-site/` | Malicious static HTML page that silently triggers the `change-email` endpoint on the victim's behalf using a hidden `<img>` tag |

### How the Attack Works

1. The victim logs into the **profile app** at `http://localhost:3000`. A session cookie is set in the browser.
2. The victim then opens the **attacker site**, which presents a fake prize claim page.
3. A hidden zero-pixel `<img>` on the attacker page fires a GET request to `http://localhost:3000/api/change-email?email=hacked@attacker.com`.
4. Because the browser automatically sends the session cookie with every request, the server accepts it and the victim's email is silently changed.

### Mitigation

The `change-email` route can block cross-origin requests by checking the `Sec-Fetch-Site` and `Origin`/`Referer` headers. It will result in rejecting any request not originating from the same site.

---

## How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)
- Any static file server for the attacker site (e.g., VS Code **Live Server** extension, or `npx serve`)

---

### 1. Start the Profile App (Victim Site)

```bash
cd profile
npm install
npm run dev
```

The app will be available at **`http://localhost:3000`**.

**Login credentials:**

| Field | Value |
|---|---|
| Username | `aryan` |
| Password | `aryan123` |

---

### 2. Serve the Attacker Site

```bash
cd attacker-site
npx serve -p 3001
```

The attacker page will be at **`http://localhost:3001`**

---

### 3. Reproduce the Attack

1. Open `http://localhost:3000/login` and log in.
2. Now navigate to the attacker site in the same browser.
3. Observe that the hidden `<img>` fires a request to the profile app, the email is changed silently.
4. Go back to `http://localhost:3000/profile` to confirm the email has been updated to `hacked@attacker.com`.

### 4. Test the Fix

In [`profile/app/api/change-email/route.ts`](profile/app/api/change-email/route.ts), uncomment the CSRF-check block, restart the dev server, and repeat step 3. The request will now be blocked with **HTTP 403**.
