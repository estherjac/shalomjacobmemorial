// ---------- Settings you may want to change ----------
// Where form messages are delivered (FormSubmit sends a one-time activation email on first use).
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/shalomjacobmemorial@gmail.com";
// Fundraising progress toward the $2.5M goal. Leave as null to hide the progress bar.
const FUNDRAISING = { goal: 2500000, raised: null };
// Donation page (Donorbox, Charidy, PayPal…). Leave empty to fall back to email.
const DONATE_URL = "";

const HE = document.documentElement.lang === "he";
const T = HE
  ? {
      count: (n, total) => (n === total ? "יותר מ-25 ספרים שיצאו לאור ע״י הרב שלום זצ״ל" : `מציג ${n} מתוך ${total}`),
      none: (q) => `לא נמצאו ספרים עבור ״${q}״`,
      gallery: "ספרים מאוסף הרב שלום",
      fill: "נא למלא את השדות המסומנים.",
      fail: "אירעה שגיאה. ניתן לפנות אלינו ישירות בכתובת shalomjacobmemorial@gmail.com",
      sending: "שולח…",
      noMemories: "היו הראשונים לשתף זיכרון.",
      haskamah: (rav) => `הסכמת ${rav}`,
    }
  : {
      count: (n, total) => (n === total ? `More than 25 Sefarim published by Rav Shalom <span class="he">זצ״ל</span>` : `Showing ${n} of ${total}`),
      none: (q) => `No Sefarim match “${q}”.`,
      gallery: "Sefarim in Rav Shalom's collection",
      fill: "Please fill in the highlighted fields.",
      fail: "Sorry, something went wrong. Please email us directly at shalomjacobmemorial@gmail.com.",
      sending: "Sending…",
      noMemories: "Be the first to share a memory.",
      haskamah: (rav) => `Haskamah of ${rav}`,
    };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ---------- Mobile menu ----------
const toggle = document.querySelector(".menu-toggle");
const links = document.getElementById("nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) links.classList.remove("open");
});

// ---------- Active nav link ----------
const navMap = new Map([...links.querySelectorAll('a[href^="#"]:not(.btn)')].map((a) => [a.getAttribute("href").slice(1), a]));
const navObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navMap.forEach((a) => a.classList.remove("active"));
    navMap.get(e.target.id)?.classList.add("active");
  }),
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("section[id]").forEach((s) => navObserver.observe(s));

// ---------- Covers ----------
const SEFARIM = window.SEFARIM || [];
document.getElementById("covers").innerHTML = SEFARIM.filter((s) => s.cover)
  .map((s) => `<a href="sefarim/${s.id}.html"><img src="images/${s.cover}" alt="${esc(s.title)} — ${esc(s.en)}" loading="lazy"><span>${esc(s.title)}</span></a>`)
  .join("");

// ---------- Published Sefarim table ----------
const body = document.getElementById("sefarim-body");
const count = document.getElementById("sefer-count");
const strip = (s) => s.replace(/[״׳"'\/—\-]/g, "").toLowerCase();
function renderSefarim(q = "") {
  const needle = strip(q.trim());
  const rows = SEFARIM.filter((s) => !needle || strip([s.title, s.en, s.author, s.subject].join(" ")).includes(needle));
  body.innerHTML = rows.length
    ? rows.map((s) => `<tr><td>${s.id}</td><td class="title"><a href="sefarim/${s.id}.html">${esc(s.title)}</a></td><td>${esc(s.author)}</td><td>${esc(s.subject)}</td><td class="year">${esc(s.first) || "—"}</td><td class="year">${esc(s.republished)}</td></tr>`).join("")
    : `<tr><td colspan="6" class="empty">${esc(T.none(q))}</td></tr>`;
  count.innerHTML = T.count(rows.length, SEFARIM.length);
}
renderSefarim();
document.getElementById("sefer-search").addEventListener("input", (e) => renderSefarim(e.target.value));

// ---------- Gallery ----------
document.getElementById("gallery-grid").innerHTML = Array.from({ length: 16 }, (_, i) =>
  `<img src="images/library-${String(i + 1).padStart(2, "0")}.jpg" alt="${T.gallery}" loading="lazy" data-lightbox data-group="gallery">`
).join("");

// ---------- Lightbox ----------
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let group = [], idx = 0;
const show = (i) => {
  idx = (i + group.length) % group.length;
  lbImg.src = group[idx].src;
  lbImg.alt = group[idx].alt;
  lb.querySelector(".lb-prev").hidden = lb.querySelector(".lb-next").hidden = group.length < 2;
};
const openLb = (items, start = 0) => {
  group = items;
  show(start);
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
};
document.addEventListener("click", (e) => {
  const img = e.target.closest("img[data-lightbox]");
  if (img) {
    const items = img.dataset.group ? [...document.querySelectorAll(`img[data-group="${img.dataset.group}"]`)] : [img];
    return openLb(items.map((el) => ({ src: el.src, alt: el.alt })), items.indexOf(img));
  }
  const rav = e.target.closest("[data-rav]");
  if (rav) {
    const name = rav.querySelector("h3").textContent.trim();
    openLb(["a", "b"].map((x) => ({ src: `images/hask-${rav.dataset.rav}-${x}.jpg`, alt: T.haskamah(name) })));
  }
});
const closeLb = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
lb.addEventListener("click", (e) => {
  if (e.target.closest(".lb-prev")) show(idx - 1);
  else if (e.target.closest(".lb-next")) show(idx + 1);
  else if (e.target !== lbImg) closeLb();
});
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "ArrowRight") show(idx + 1);
});

// ---------- Memories ----------
const memList = document.getElementById("memories-list");
fetch("data/memories.json")
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => [])
  .then((items) => {
    memList.innerHTML = items.length
      ? items.map((m) => `<article class="memory reveal in"><p>${esc(m.text)}</p><footer><b>${esc(m.name)}</b>${m.relationship ? ` · ${esc(m.relationship)}` : ""}</footer></article>`).join("")
      : `<p class="memories-empty">${T.noMemories}</p>`;
  });

// ---------- Fundraising + donate ----------
if (FUNDRAISING.raised) {
  const prog = document.getElementById("progress");
  prog.hidden = false;
  document.getElementById("raised").textContent = "$" + FUNDRAISING.raised.toLocaleString("en-US");
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    prog.querySelector("i").style.width = Math.min(100, (FUNDRAISING.raised / FUNDRAISING.goal) * 100) + "%";
    obs.disconnect();
  }).observe(prog);
}
if (DONATE_URL) {
  const d = document.getElementById("donate-btn");
  d.href = DONATE_URL;
  d.target = "_blank";
  d.rel = "noopener";
}
// Dedication tiers prefill the contact form
document.querySelectorAll("[data-msg]").forEach((a) =>
  a.addEventListener("click", () => {
    const ta = document.querySelector('#contact-form textarea[name="message"]');
    if (ta && !ta.value) ta.value = a.dataset.msg;
  })
);

// ---------- Reveal on scroll + count-up ----------
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealObs = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

const countObs = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  countObs.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
  if (reduce) return;
  const t0 = performance.now(), dur = 1600;
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString("en-US") + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));

// ---------- Forms (contact + memories) ----------
document.querySelectorAll("form.form").forEach((form) => {
  const note = form.querySelector(".form-note");
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.textContent;
  const fail = (msg, el) => {
    note.style.color = "#c2413b";
    note.textContent = msg;
    el?.focus();
  };
  form.addEventListener("input", (e) => e.target.classList?.remove("invalid"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let firstBad = null;
    form.querySelectorAll("[required]").forEach((el) => {
      const v = el.value.trim();
      const bad = !v || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(v));
      el.classList.toggle("invalid", bad);
      if (bad) firstBad ??= el;
    });
    if (firstBad) return fail(T.fill, firstBad);

    const data = new FormData(form);
    const memory = form.dataset.kind === "memory";
    const who = memory ? data.get("name") : `${data.get("first_name")} ${data.get("last_name")}`;
    data.set("_subject", memory ? `New memory of Rav Shalom from ${who}` : `Website message from ${who}`);
    data.set("_replyto", data.get("email"));
    data.set("_template", "table");
    data.set("_captcha", "false");
    btn.disabled = true;
    btn.textContent = T.sending;
    note.textContent = "";
    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "Submission failed.");
      form.hidden = true;
      document.getElementById(memory ? "memory-success" : "contact-success").hidden = false;
    } catch {
      fail(T.fail);
      btn.disabled = false;
      btn.textContent = label;
    }
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
