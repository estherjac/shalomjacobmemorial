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

// ---------- Covers ----------
const SEFARIM = window.SEFARIM || [];
const coversEl = document.getElementById("covers");
if (coversEl) coversEl.innerHTML = SEFARIM.filter((s) => s.cover)
  .map((s) => `<a href="sefarim/${s.id}.html"><img src="images/${s.cover}" alt="${esc(s.title)} — ${esc(s.en)}" loading="lazy"><span>${esc(s.title)}</span></a>`)
  .join("");

// ---------- Sefer of the Week (changes every Sunday, cycles through the list) ----------
const weekBox = document.getElementById("weekly-sefer");
if (weekBox && SEFARIM.length) {
  const week = Math.floor((Date.now() - Date.UTC(2026, 0, 4)) / 6048e5); // weeks since a Sunday
  const s = SEFARIM[((week % SEFARIM.length) + SEFARIM.length) % SEFARIM.length];
  weekBox.innerHTML = `
    <a class="weekly-cover" href="sefarim/${s.id}.html">${s.cover
      ? `<img src="images/${s.cover}" alt="${esc(s.title)}">`
      : `<div class="sefer-cover-blank"><span class="he">ספר</span><b class="he">${esc(s.title)}</b></div>`}</a>
    <div>
      <h3 class="he weekly-title" lang="he">${esc(s.title)}</h3>
      ${HE ? "" : `<p class="weekly-en">${esc(s.en)}</p>`}
      <p class="he weekly-meta" lang="he">${esc(s.author)}<br>${esc(s.subject)}</p>
      <a class="weekly-link" href="sefarim/${s.id}.html">${HE ? "לפרטים על הספר ←" : "Learn about this Sefer →"}</a>
    </div>`;
}

// ---------- Published Sefarim table ----------
const body = document.getElementById("sefarim-body");
const count = document.getElementById("sefer-count");
const strip = (s) => s.replace(/[״׳"'\/—\-]/g, "").toLowerCase();
function renderSefarim(q = "") {
  if (!body) return;
  const needle = strip(q.trim());
  const rows = SEFARIM.filter((s) => !needle || strip([s.title, s.en, s.author, s.subject].join(" ")).includes(needle));
  body.innerHTML = rows.length
    ? rows.map((s) => `<tr><td>${s.id}</td><td class="title"><a href="sefarim/${s.id}.html">${esc(s.title)}</a></td><td>${esc(s.author)}</td><td>${esc(s.subject)}</td><td class="year">${esc(s.first) || "—"}</td><td class="year">${esc(s.republished)}</td></tr>`).join("")
    : `<tr><td colspan="6" class="empty">${esc(T.none(q))}</td></tr>`;
  count.innerHTML = T.count(rows.length, SEFARIM.length);
}
renderSefarim();
document.getElementById("sefer-search")?.addEventListener("input", (e) => renderSefarim(e.target.value));

// ---------- Gallery ----------
const galleryEl = document.getElementById("gallery-grid");
if (galleryEl) galleryEl.innerHTML = Array.from({ length: 16 }, (_, i) =>
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
if (memList) fetch("data/memories.json")
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => [])
  .then((items) => {
    memList.innerHTML = items.length
      ? items.map((m) => `<article class="memory reveal in"><p>${esc(m.text)}</p><footer><b>${esc(m.name)}</b>${m.relationship ? ` · ${esc(m.relationship)}` : ""}</footer></article>`).join("")
      : `<p class="memories-empty">${T.noMemories}</p>`;
  });

// ---------- Fundraising + donate ----------
if (FUNDRAISING.raised && document.getElementById("progress")) {
  const prog = document.getElementById("progress");
  prog.hidden = false;
  document.getElementById("raised").textContent = "$" + FUNDRAISING.raised.toLocaleString("en-US");
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    prog.querySelector("i").style.width = Math.min(100, (FUNDRAISING.raised / FUNDRAISING.goal) * 100) + "%";
    obs.disconnect();
  }).observe(prog);
}
const donateBtn = document.getElementById("donate-btn");
if (DONATE_URL && donateBtn) {
  const d = donateBtn;
  d.href = DONATE_URL;
  d.target = "_blank";
  d.rel = "noopener";
}
// Dedication tiers open the contact page with the message filled in
document.querySelectorAll("a[data-msg]").forEach((a) => {
  a.href = a.getAttribute("href").split("#")[0].split("?")[0] + "?msg=" + encodeURIComponent(a.dataset.msg);
});
const prefill = new URLSearchParams(location.search).get("msg");
const contactMsg = document.querySelector('#contact-form textarea[name="message"]');
if (prefill && contactMsg && !contactMsg.value) contactMsg.value = prefill;

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
    const kind = form.dataset.kind || "contact";
    const who = data.get("name") || `${data.get("first_name")} ${data.get("last_name")}`;
    data.set("_subject", {
      memory: `New memory of Rav Shalom from ${who}`,
      newsletter: `Newsletter signup (Sefer of the Week): ${who}`,
      contact: `Website message from ${who}`,
    }[kind]);
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
      document.getElementById(`${kind}-success`).hidden = false;
    } catch {
      fail(T.fail);
      btn.disabled = false;
      btn.textContent = label;
    }
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Accessibility menu ----------
(() => {
  const root = document.getElementById("a11y");
  if (!root) return;
  const btn = root.querySelector(".a11y-btn"), panel = root.querySelector(".a11y-panel");
  const html = document.documentElement, KEY = "sjmi-a11y";
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {} };
  const apply = () => {
    const size = prefs.size || 0;
    html.style.fontSize = size ? `${100 + size * 10}%` : "";
    document.getElementById("a11y-size-val").textContent = `${100 + size * 10}%`;
    ["contrast", "links", "motion"].forEach((o) => {
      html.classList.toggle(`a11y-${o}`, !!prefs[o]);
      root.querySelector(`[data-opt="${o}"]`).checked = !!prefs[o];
    });
  };
  const open = (show) => {
    panel.hidden = !show;
    btn.setAttribute("aria-expanded", show);
    if (show) panel.querySelector("a, button, input").focus();
  };
  btn.addEventListener("click", () => open(panel.hidden));
  root.querySelector(".a11y-close").addEventListener("click", () => { open(false); btn.focus(); });
  document.addEventListener("click", (e) => { if (!panel.hidden && !root.contains(e.target)) open(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { open(false); btn.focus(); } });
  root.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => {
    prefs.size = Math.max(-1, Math.min(4, (prefs.size || 0) + +b.dataset.size));
    apply(); save();
  }));
  root.querySelectorAll("[data-opt]").forEach((c) => c.addEventListener("change", () => {
    prefs[c.dataset.opt] = c.checked;
    apply(); save();
  }));
  root.querySelector(".a11y-reset").addEventListener("click", () => { prefs = {}; apply(); save(); });
  apply();
})();
