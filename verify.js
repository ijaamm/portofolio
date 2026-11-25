#!/usr/bin/env node
/**
 * verify.js — Canonical verification for the static portfolio.
 *
 * Rebuilds index.html from partials and asserts the built output is correct:
 * sections present, no leftover partial slots, every referenced asset exists,
 * contact/social wiring intact, and the build is idempotent.
 *
 * Usage: node verify.js   (or: npm run verify)
 * Exit code 0 = all checks passed, 1 = one or more failed.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const INDEX = path.join(ROOT, "index.html");

let failures = 0;
function check(name, cond) {
  console.log((cond ? "PASS " : "FAIL ") + name);
  if (!cond) failures += 1;
}

const read = (p) => fs.readFileSync(p, "utf8");
const html = read(INDEX);

// 1. Build output has no unresolved partial slots
check("no leftover <template data-partial>", !html.includes("<template data-partial"));

// 2. Required sections + footer
["home", "about", "skills", "projects", "contact"].forEach((id) =>
  check(`section id="${id}"`, html.includes(`id="${id}"`)),
);
check("footer present", html.includes('class="site-footer"'));

// 3. Build is idempotent (re-run build.js -> byte identical)
const before = crypto.createHash("sha256").update(html).digest("hex");
execFileSync("node", ["build.js"], { cwd: ROOT, stdio: "ignore" });
const after = crypto.createHash("sha256").update(read(INDEX)).digest("hex");
check("index.html idempotent after rebuild", before === after);

// 4. Every assets/* reference exists on disk
const refs = [...new Set(html.match(/assets\/[A-Za-z0-9._%\- ]+/g) || [])];
refs.forEach((ref) =>
  check(`asset exists: ${ref}`, fs.existsSync(path.join(ROOT, ref))),
);

// 5. Contact wiring
check("WhatsApp number correct", html.includes("wa.me/6281291605094"));
check("mailto present", html.includes("mailto:ijammusyaf@gmail.com"));
check("nav -> #contact", /<a href="#contact">Contact<\/a>/.test(html));

// 6. Head / meta / favicon
check("title set", html.includes("Ilzam Roin Musyafa — Web Developer"));
check("meta description", html.includes('name="description"'));
check("og:title", html.includes('property="og:title"'));
check("favicon svg", html.includes("assets/favicon.svg"));

// 7. Socials (each URL once in Contact + once in footer)
const SOCIALS = [
  "https://github.com/ijaamm",
  "https://www.linkedin.com/in/ilzam-roin-musyafa-712742353/",
  "https://www.instagram.com/jamfrcs/",
  "https://discord.com/users/717345372241920072",
];
SOCIALS.forEach((u) => check(`social url x2: ${u}`, html.split(u).length - 1 === 2));
check("contact social-link x4", (html.match(/class="social-link"/g) || []).length === 4);
check("footer social x4", (html.match(/class="footer__social"/g) || []).length === 4);
check("svg tags balanced", (html.match(/<svg/g) || []).length === (html.match(/<\/svg>/g) || []).length);

// 8. Skills count fix
check('skills "4 Frameworks"', html.includes("4 Frameworks") && !html.includes("5 Frameworks"));

console.log(
  `\nRESULT: ${failures === 0 ? "ALL PASS" : `${failures} FAILED`} ` +
    `(${refs.length} assets checked)`,
);
process.exit(failures === 0 ? 0 : 1);
