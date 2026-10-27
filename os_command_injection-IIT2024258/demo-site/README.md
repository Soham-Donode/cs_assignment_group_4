# OS Command Injection Lab — In-Band (Variant 1)

**Course:** Cyber Security (IT-30001)  
**Semester:** Autumn Semester 2026  
**Institution:** IIIT Allahabad  
**Assignment:** Web Server Security — Exploitation and Mitigation of Four Vulnerability Categories

## Ownership Declaration

| Member Name | Roll Number | Vulnerability Category | Variant Implemented |
|---|---|---|---|
| Chandan Sapkale | IIT2024258 | OS Command Injection | Variant 1 — In-Band OS Command Injection |

## What This Assignment Demonstrates

This assignment uses a small Node.js and Express web application to demonstrate **in-band OS command injection** through a simulated Windows Ping utility. It compares a deliberately vulnerable endpoint that uses `exec()` with a secure endpoint that validates input and uses `execFile()` without invoking a shell.

The assignment is intended for an isolated local classroom lab. The vulnerable endpoint demonstrates how shell metacharacters can alter a command's meaning; the secure endpoint demonstrates rejection of the same input.

## Features

- Browser-based Ping demonstration with separate vulnerable and secure panels.
- Educational payload examples and terminal-style output areas.
- Comparison of `exec()` and `execFile()`.
- Allow-list validation for target input in the secure endpoint.
- Mitigation summary covering the root cause and additional defenses.

## Requirements

- Node.js and npm installed.
- The assignment source files, including `app.js`, `index.html`, and `package.json`.
- A local environment suitable for running the simulated Windows Ping behavior. Commands and executable names may need adjustment for a different operating system.

## Running the Assignment

From the directory containing `app.js` and `package.json`, install dependencies if needed:

```bash
npm install
```

Start the server:

```bash
node app.js
```

If `package.json` defines a start script, `npm start` may also be available. Use the command supported by the supplied `package.json`.

Open the site in your browser:

```text
http://localhost:3000
```

## Folder Structure

```text
assignment-folder/
├── app.js              # Express server and vulnerable/secure endpoints
├── index.html          # Browser UI, input fields, and output panels
├── package.json        # Project metadata and dependencies
└── package-lock.json   # Locked dependency versions, if included
```

`node_modules/` is installed locally through npm and normally does not need to be included in the source archive.

## Vulnerable Implementation

**File:** `app.js`  
**Endpoint:** `POST /ping_vulnerable`

The vulnerable endpoint concatenates the user-supplied target into a command string and passes it to `exec()`.

Representative code pattern:

```javascript
const command = "ping -n 3 " + target;
exec(command, callback);
```

Use the exact implementation in the submitted `app.js` as the authoritative source. The key issue is that user-controlled input becomes part of a shell command string.

On Windows, `exec()` invokes a command shell. Shell metacharacters such as `&`, `|`, and `&&` may be interpreted as command-control syntax rather than as part of a ping target.

## In-Band OS Command Injection

**In-band OS command injection** occurs when an application executes an unintended operating-system command and returns its output through the same communication channel used by the original request. In this assignment, the browser sends input to the web server, and the server returns the command output in the page's terminal-style output area.

### Local Demonstration

Use these examples only in the locally running assignment site.

Representative test input:

```text
127.0.0.1 & whoami
```

In the vulnerable panel, Windows CMD may interpret `&` as a command separator. The ping command can run, followed by `whoami`. If the application returns the output, it appears in the browser response. This is an in-band result because the output is returned through the normal application response.

Other illustrative examples include:

| Pattern | Example Input | What It Demonstrates |
|---|---|---|
| Sequential command | `127.0.0.1 & whoami` | An additional command after ping |
| Pipe operator | `127.0.0.1 | dir` | Shell pipe interpretation |
| Conditional execution | `127.0.0.1 && net user` | Conditional command chaining |
| Network information | `127.0.0.1 & ipconfig /all` | Potential disclosure of network configuration |
| Environment output | `127.0.0.1 | set` | Potential exposure of environment variables |

These examples are for the author's own local lab only. Do not test them against systems without explicit authorization.

## Root Cause

The vulnerability occurs because:

1. Untrusted input is concatenated into a command string.
2. `exec()` invokes a shell that interprets metacharacters.
3. The vulnerable endpoint does not restrict the target to an expected input format.
4. The server returns command output to the browser, making the result observable in-band.

Timeouts and output-size limits can constrain some resource use, but they do not remove the shell-injection root cause.

## Mitigation Implemented

**File:** `app.js`  
**Endpoint:** `POST /ping_secure`

The secure endpoint applies allow-list validation and uses `execFile()` to launch `ping.exe` with a separate argument array and `shell: false`.

The supplied allow-list accepts letters, digits, dots, and hyphens within a defined length. Input containing shell metacharacters such as `&` or `|` should be rejected before process execution.

Representative implementation pattern:

```javascript
if (!ALLOWLIST.test(target)) {
  return res.status(400).json({
    error: "Invalid input detected."
  });
}

execFile(
  "ping.exe",
  ["-n", "3", target],
  { shell: false },
  callback
);
```

If the code changes, use the actual implementation in `app.js` rather than relying on this shortened excerpt.

### Vulnerable vs. Secure Endpoint

| Aspect | Vulnerable Endpoint | Secure Endpoint |
|---|---|---|
| Process execution | `exec()` receives a command string | `execFile()` receives the executable and arguments separately |
| Shell | Invokes the Windows command shell | Uses `shell: false` so a shell is not invoked |
| Input validation | No allow-list on the demonstrated vulnerable path | Restrictive allow-list validation |
| Test input | Additional command may execute | Invalid input should be rejected |
| Response | Output may include the additional command's result | Invalid input returns an error response |

To verify the mitigation, enter `127.0.0.1 & whoami` in both panels. The vulnerable endpoint may display the additional command's output; the secure endpoint should reject the input with an invalid-input message and HTTP 400. Also test a normal target such as `127.0.0.1`. Record only outcomes actually observed during testing.

## Additional Mitigation Strategies

- **Avoid invoking the shell:** launch the required executable directly when possible.
- **Pass an argument vector:** provide arguments as separate array elements instead of building a single shell command.
- **Allow-list validation:** accept only formats and characters expected by the application.
- **Least privilege:** run the server under an account with only the permissions it needs, reducing potential impact if a vulnerability is exploited.
- **Limit resources:** use sensible timeouts and output-size limits as additional safeguards.
- **Handle errors safely:** return appropriate error messages without exposing unnecessary internal details.

The secure endpoint demonstrates shell-free execution and allow-list validation. Least privilege and other deployment safeguards are additional recommendations, not necessarily controls implemented by the endpoint itself.

## Testing Checklist

- [ ] Start the Node.js server and open `http://localhost:3000`.
- [ ] Submit a normal target such as `127.0.0.1` to the vulnerable endpoint.
- [ ] In the local lab, submit `127.0.0.1 & whoami` to the vulnerable endpoint and observe the output.
- [ ] Submit the same test input to the secure endpoint and confirm it is rejected.
- [ ] Confirm the secure endpoint accepts a normal target when the environment supports ping.
- [ ] Capture screenshots of both endpoint results for the assignment report or demonstration video.
- [ ] Confirm that the submitted screenshots and statements match the behavior actually observed.

## Conclusion

This assignment demonstrates how constructing shell commands from untrusted input can lead to OS command injection. The vulnerable endpoint illustrates the risk of passing a user-influenced command string to `exec()`. The secure endpoint reduces this risk by validating the target and using `execFile()` with separate arguments and `shell: false`.

## Disclaimer

This assignment is intended strictly for classroom demonstration of OS command injection and mitigation. Keep the vulnerable endpoint in a local, isolated environment and do not deploy it on a public server. Test only the instance you own or systems for which you have explicit authorization.
