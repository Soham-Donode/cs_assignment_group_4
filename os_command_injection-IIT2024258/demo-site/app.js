"use strict";

//  CS Assignment 4 – IIT2024258
//  Topic  : In-Band OS Command Injection Demo (Windows)
//  Stack  : Node.js + Express
//  ROOT CAUSE (one-liner):
//  child_process.exec() internally calls "cmd.exe /d /s /c <user_input>",
//  so meta-characters like & and | in user input become shell command
//  separators, allowing arbitrary commands to execute alongside ping.
//
//  EXPLOIT PAYLOADS (Windows-specific):
//    127.0.0.1 & whoami          → sequential – runs ping THEN whoami
//    127.0.0.1 | dir             → pipe       – pipes ping output into dir
//    127.0.0.1 && net user       → conditional– runs net user if ping succeeds
//    127.0.0.1 & ipconfig /all   → sequential – dumps full NIC info
//    127.0.0.1 | set             → pipe       – leaks all env variables
//
//  MITIGATION:
//  execFile() spawns ping.exe DIRECTLY without invoking cmd.exe.
//  Arguments are passed as an array, never interpolated into a string,
//  so meta-characters have no special meaning to ping.exe.
// =============================================================================

const path               = require("path");
const express            = require("express");
const { exec, execFile } = require("child_process");

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve the HTML frontend ───────────────────────────────────────────────────
// index.html lives in the same directory as this file.
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/ping_vulnerable", function(req, res) {
  var target = req.body.target; // ← raw, unsanitised user input

  //VULNERABLE LINE 
  // Direct string concatenation → shell injection possible
  var command = "ping -n 3 " + target;
  //VULNERABLE LINE 

  console.log("[VULNERABLE] Executing: " + command);

  exec(
    command,
    {
      timeout   : 10000,       // prevent infinite hang
      maxBuffer : 64 * 1024   // 64 KB output cap
      // NOTE: on Windows, exec() spawns: cmd.exe /d /s /c "<command>"
      //       The shell IS active — all meta-chars are interpreted.
    },
    function(error, stdout, stderr) {
      var output = stdout || stderr || (error ? error.message : "No output");
      res.json({ output: output });
    }
  );
});

//  SECURE ENDPOINT  →  POST /ping_secure
//  Three layers of defence:
//
//  Layer 1 – Allowlist validation
//    Regex /^[a-zA-Z0-9.\-]{1,253}$/ accepts only chars valid in an
//    IPv4 address or hostname.  Rejects: & | ; ` ( ) < > ' " \ spaces.
//
//  Layer 2 – Parameterised execution via execFile()
//    execFile(binary, [args]) spawns ping.exe directly without cmd.exe.
//    The OS passes `target` as a literal element of argv[].
//    "& whoami" has NO special meaning to ping.exe — it is just a bad hostname.
//
//  Layer 3 – Explicit { shell: false }
//    Redundant (it is the default for execFile) but self-documenting.
app.post("/ping_secure", function(req, res) {
  var target = req.body.target;

  var ALLOWLIST = /^[a-zA-Z0-9.\-]{1,253}$/;

  if (!ALLOWLIST.test(target)) {
    console.log("[SECURE] Rejected suspicious input: " + target);
    return res.status(400).json({
      error:
        "Invalid input detected.\n\n" +
        "Only alphanumeric characters, dots and hyphens are allowed.\n" +
        "Shell meta-characters ( & | ; ` etc. ) are NOT permitted.\n\n" +
        "Rejected value: \"" + target + "\""
    });
  }

  console.log("[SECURE] Validated input accepted: " + target);

  // ── Layers 2 & 3: Parameterised execution, no shell ─────────────────────
  execFile(
    "ping.exe",            // spawn the binary directly – NOT via cmd.exe
    ["-n", "3", target],   // arguments as an ARRAY – never a shell string
    {
      shell     : false,   // explicit: no shell involvement (default for execFile)
      timeout   : 10000,
      maxBuffer : 64 * 1024
    },
    function(error, stdout, stderr) {
      var output = stdout || stderr || (error ? error.message : "No output");
      res.json({ output: output });
    }
  );
  // ▲ `target` is NEVER concatenated into a string a shell evaluates.
  //   Even "127.0.0.1 & whoami" is ONE literal argument to ping.exe.
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, function() {
  console.log("============================================================");
  console.log("  OS Command Injection Lab  --  IIT2024258");
  console.log("============================================================");
  console.log("  Frontend   :  http://localhost:" + PORT + "/");
  console.log("  Vulnerable :  POST /ping_vulnerable   (exec + shell)");
  console.log("  Secure     :  POST /ping_secure        (execFile, no shell)");
  console.log("============================================================");
  console.log("  WARNING: EDUCATIONAL USE ONLY");
  console.log("============================================================");
});
