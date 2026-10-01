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

// ---------- Sefarim catalogue (grid + list, topic filter, search) ----------
const body = document.getElementById("sefarim-body");
const count = document.getElementById("sefer-count");
const catalog = document.getElementById("catalog");
const listWrap = document.getElementById("catalog-list");
const CATS = HE
  ? { mishnah: "משנה", gemara: "גמרא והלכה", tanach: "תנ״ך ודרוש", moadim: "מועדים והגדה" }
  : { mishnah: "Mishnah", gemara: "Gemara & Halacha", tanach: "Tanach & Drush", moadim: "Moadim & Haggadah" };
const strip = (s) => s.replace(/[״׳"'\/—\-]/g, "").toLowerCase();
const state = { q: "", cat: "", view: "grid" };
function renderSefarim() {
  if (!body && !catalog) return;
  const needle = strip(state.q.trim());
  const rows = SEFARIM.filter((s) => (!state.cat || s.category === state.cat) &&
    (!needle || strip([s.title, s.en, s.author, s.subject].join(" ")).includes(needle)));
  const none = `<p class="empty">${esc(T.none(state.q || CATS[state.cat] || ""))}</p>`;
  if (catalog) catalog.innerHTML = rows.length ? rows.map((s) => `
    <a class="book" href="sefarim/${s.id}.html">
      <div class="book-cover">${s.cover
        ? `<img src="images/${s.cover}" alt="" loading="lazy">`
        : `<div class="sefer-cover-blank"><span class="he">ספר</span><b class="he">${esc(s.title)}</b></div>`}</div>
      <span class="book-cat">${esc(CATS[s.category] || "")}</span>
      <b class="he book-title" lang="he">${esc(s.title)}</b>
      ${HE ? "" : `<span class="book-en">${esc(s.en)}</span>`}
      <span class="he book-author" lang="he">${esc(s.author)}</span>
    </a>`).join("") : none;
  if (body) body.innerHTML = rows.length
    ? rows.map((s) => `<tr><td>${s.id}</td><td class="title"><a href="sefarim/${s.id}.html">${esc(s.title)}</a></td><td>${esc(s.author)}</td><td>${esc(s.subject)}</td><td class="year">${esc(s.first) || "—"}</td><td class="year">${esc(s.republished)}</td></tr>`).join("")
    : `<tr><td colspan="6" class="empty">${esc(T.none(state.q))}</td></tr>`;
  if (count) count.innerHTML = T.count(rows.length, SEFARIM.length);
  if (catalog && listWrap) { catalog.hidden = state.view !== "grid"; listWrap.hidden = state.view !== "list"; }
}
renderSefarim();
document.getElementById("sefer-search")?.addEventListener("input", (e) => { state.q = e.target.value; renderSefarim(); });
document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
  state.cat = c.dataset.cat;
  document.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
  renderSefarim();
}));
document.querySelectorAll(".view-toggle button").forEach((b) => b.addEventListener("click", () => {
  state.view = b.dataset.view;
  document.querySelectorAll(".view-toggle button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  renderSefarim();
}));

// ---------- Gallery ----------
const galleryEl = document.getElementById("gallery-grid");
if (galleryEl) {
  galleryEl.innerHTML = Array.from({ length: 16 }, (_, i) =>
    `<img src="images/library-${String(i + 1).padStart(2, "0")}.jpg" alt="${T.gallery}" loading="lazy" data-lightbox data-group="gallery">`
  ).join("");
  const more = document.createElement("div");
  more.className = "center gallery-more";
  more.innerHTML = `<button class="btn btn-outline">${HE ? "לכל 16 התמונות" : "View all 16 photos"}</button>`;
  galleryEl.after(more);
  more.querySelector("button").addEventListener("click", () => { galleryEl.classList.add("expanded"); more.remove(); });
}

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

// ---------- Site details: yahrzeit, board, EIN (from data/site.json) ----------
fetch("data/site.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then(async (site) => {
  const ein = document.getElementById("ein");
  if (ein && site.ein) { ein.querySelector("span").textContent = site.ein; ein.hidden = false; }

  const teamEl = document.getElementById("team-list");
  if (teamEl && site.team?.length) {
    teamEl.innerHTML = site.team.map((m) => `<div class="member"><b>${esc(m.name)}</b>${m.role ? `<span>${esc(m.role)}</span>` : ""}</div>`).join("");
    document.getElementById("leadership").hidden = false;
  }

  const yz = site.yahrzeit || {}, yzEl = document.getElementById("yahrzeit");
  if (!yzEl || !yz.hebrew) return;
  document.getElementById("yz-date").textContent = yz.hebrew;
  document.getElementById("yz-name").textContent = yz.nishmas || (HE ? "הרב שלום זצ״ל" : "Rav Shalom זצ״ל");
  yzEl.hidden = false;
  // Next civil date of the yahrzeit, via the Hebcal date converter
  const next = document.querySelector(".yz-next");
  if (!yz.hebcal_month || !yz.day) return (next.hidden = true);
  try {
    const t = new Date(), iso = t.toISOString().slice(0, 10);
    const today = await (await fetch(`https://www.hebcal.com/converter?cfg=json&date=${iso}&g2h=1&strict=1`)).json();
    for (const hy of [today.hy, today.hy + 1]) {
      const g = await (await fetch(`https://www.hebcal.com/converter?cfg=json&hy=${hy}&hm=${yz.hebcal_month}&hd=${yz.day}&h2g=1&strict=1`)).json();
      const d = new Date(g.gy, g.gm - 1, g.gd);
      if (d >= new Date(t.getFullYear(), t.getMonth(), t.getDate())) {
        document.getElementById("yz-next").textContent = d.toLocaleDateString(HE ? "he-IL" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        return;
      }
    }
    next.hidden = true;
  } catch { next.hidden = true; }
});

// ---------- Instagram feed (Behold.so JSON feed URL in data/site.json → "instagram_feed") ----------
const igEl = document.getElementById("ig-feed");
if (igEl) fetch("data/site.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then(async ({ instagram_feed }) => {
  const placeholders = () => {
    const icon = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
    igEl.innerHTML = Array.from({ length: 4 }, () => `<a class="ig-post ig-placeholder" href="https://www.instagram.com/shalom_jacob_memorial_library" target="_blank" rel="noopener">
      <div class="ig-img">${icon}</div>
      <p><span></span><span></span><span></span></p>
      <span class="ig-more">${HE ? "בקרוב" : "Coming soon"}</span>
    </a>`).join("");
  };
  if (!instagram_feed) return placeholders();
  try {
    const data = await (await fetch(instagram_feed)).json();
    const posts = (Array.isArray(data) ? data : data.posts || []).slice(0, 8);
    if (!posts.length) throw new Error("empty");
    igEl.innerHTML = posts.map((p) => {
      const img = p.sizes?.medium?.mediaUrl || (p.mediaType === "VIDEO" ? p.thumbnailUrl : p.mediaUrl) || p.thumbnailUrl;
      const text = (p.prunedCaption || p.caption || "").replace(/#\S+/g, "").trim();
      const short = text.length > 150 ? text.slice(0, 150).replace(/\s+\S*$/, "") + "…" : text;
      return `<a class="ig-post reveal in" href="${esc(p.permalink)}" target="_blank" rel="noopener">
        <div class="ig-img"><img src="${esc(img)}" alt="${esc(short.slice(0, 90))}" loading="lazy"></div>
        <p dir="auto">${esc(short)}</p>
        <span class="ig-more">${HE ? "לפוסט המלא ←" : "Read on Instagram →"}</span>
      </a>`;
    }).join("");
  } catch { placeholders(); }
});

// ---------- Shiurim & hespedim (from data/shiurim.json) ----------
const shiurimEl = document.getElementById("shiurim-list");
const ytId = (u) => (String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [, /^[\w-]{11}$/.test(u) ? u : ""])[1];
if (shiurimEl) fetch("data/shiurim.json").then((r) => (r.ok ? r.json() : [])).catch(() => []).then((items) => {
  if (!items.length) {
    shiurimEl.innerHTML = Array.from({ length: 3 }, () => `<article class="shiur shiur-placeholder" aria-hidden="true">
      <div class="yt"><span class="play"></span></div>
      <div><span class="line"></span><span class="line short"></span><span class="soon">${HE ? "בקרוב" : "Coming soon"}</span></div>
    </article>`).join("");
    return;
  }
  shiurimEl.innerHTML = items.map((x) => {
    const id = x.youtube && ytId(x.youtube);
    const media = id
      ? `<button class="yt" data-yt="${id}" aria-label="${HE ? "הפעלה" : "Play"}: ${esc(x.title)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="play"></span></button>`
      : x.audio ? `<audio controls preload="none" src="${esc(x.audio)}"></audio>` : "";
    const meta = [x.speaker, x.date].filter(Boolean).map(esc).join(" · ");
    return `<article class="shiur reveal in">${media}<div><h3>${esc(x.title)}</h3>${meta ? `<p>${meta}</p>` : ""}${x.link ? `<a href="${esc(x.link)}" target="_blank" rel="noopener">${HE ? "להאזנה ←" : "Listen →"}</a>` : ""}</div></article>`;
  }).join("");
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("button.yt");
  if (!b) return;
  b.outerHTML = `<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
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

// ---------- Accessibility menu (language) ----------
(() => {
  const root = document.getElementById("a11y");
  if (!root) return;
  const btn = root.querySelector(".a11y-btn"), panel = root.querySelector(".a11y-panel");
  const open = (show) => {
    panel.hidden = !show;
    btn.setAttribute("aria-expanded", show);
    if (show) panel.querySelector("a").focus();
  };
  btn.addEventListener("click", () => open(panel.hidden));
  root.querySelector(".a11y-close").addEventListener("click", () => { open(false); btn.focus(); });
  document.addEventListener("click", (e) => { if (!panel.hidden && !root.contains(e.target)) open(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { open(false); btn.focus(); } });
})();
