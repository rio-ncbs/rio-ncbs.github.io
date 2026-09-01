/* RIO site scripts: nav + AI policy register (search-first) */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("nav.menu");
  if (toggle && menu) toggle.addEventListener("click", () => menu.classList.toggle("openm"));

  if (typeof POLICY_REGISTER === "undefined") return;

  const CAT = {
    standards: "Standards body",
    publisher: "Publisher",
    journal: "Journal / society",
    preprint: "Preprint server",
    funder: "Funder"
  };

  /* ---------- comparison matrix ---------- */
  const mx = document.getElementById("matrix");
  if (mx) {
    const AXES = [
      ["Writing", /Writing:/],
      ["Authorship", /Authorship:/],
      ["Images", /Images:|Data images:|Graphical/],
      ["Peer review", /Peer review:/]
    ];
    const rows = POLICY_REGISTER.filter(e => e.cat !== "standards" && e.cat !== "funder");
    mx.innerHTML = `
      <table class="mx">
        <thead><tr><th>Publisher / journal</th>${AXES.map(a=>`<th>${a[0]}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map(e => `
            <tr>
              <th scope="row">${e.org}</th>
              ${AXES.map(a => {
                const c = e.chips.find(c => a[1].test(c.t));
                return c
                  ? `<td><span class="dot ${c.s}"></span>${c.t.replace(/^[^:]+:\s*/,"")}</td>`
                  : `<td class="na">·</td>`;
              }).join("")}
            </tr>`).join("")}
        </tbody>
      </table>`;
  }

  /* ---------- the register ---------- */
  const list = document.getElementById("register-list");
  if (!list) return;

  let activeCat = "all";
  let query = "";
  let selectedOrg = null;
  let selectedJournal = null;

  function render() {
    const q = query.trim().toLowerCase();
    const items = POLICY_REGISTER.filter(e => {
      if (selectedOrg) return e.org === selectedOrg;
      const inCat = activeCat === "all" || e.cat === activeCat;
      const hay = [e.org, e.full, e.verdict, e.writing, e.images, e.review, e.screening, e.covers]
        .join(" ").toLowerCase();
      return inCat && (!q || hay.includes(q));
    });

    const count = document.getElementById("register-count");
    if (count) count.textContent = `${items.length} of ${POLICY_REGISTER.length} entries`;

    if (!items.length) {
      list.innerHTML = `<p class="empty">No entries match “${query}”. Try a journal title, a publisher name, or a term such as <em>images</em>, <em>peer review</em> or <em>prompt</em>.</p>`;
      return;
    }

    let banner = "";
    if (selectedOrg && selectedJournal) {
      if (selectedJournal.v) {
        banner = `<div class="jnote"><strong>${selectedJournal.j}</strong> · verified at journal level, ${selectedJournal.d}. ${selectedJournal.v} <a href="${selectedJournal.u}" target="_blank" rel="noopener">This journal&rsquo;s guidelines</a>.</div>`;
      } else {
        banner = `<div class="jnote plain"><strong>${selectedJournal.j}</strong> is governed by the ${selectedJournal.o} policy below.</div>`;
      }
    }
    list.innerHTML = banner + items.map((e, i) => `
      <article class="entry" data-i="${i}">
        <button class="entry-head" aria-expanded="false">
          <div class="entry-org">
            <span class="name">${e.org}</span>
            <span class="cat">${CAT[e.cat] || e.cat}</span>
          </div>
          <div class="verdict">${e.verdict}</div>
          <p class="entry-full">${e.full}</p>
          <div class="chips">${e.chips.map(c => `<span class="chip ${c.s}">${c.t}</span>`).join("")}</div>
          <span class="more">full policy detail</span>
        </button>
        <div class="entry-body">
          <div class="field"><span class="fk">Writing</span><p>${e.writing}</p></div>
          <div class="field"><span class="fk">Images &amp; figures</span><p>${e.images}</p></div>
          <div class="field"><span class="fk">Peer review</span><p>${e.review}</p></div>
          <div class="field"><span class="fk">What they screen</span><p>${e.screening}</p></div>
          <div class="field takeaway"><span class="fk">For you</span><p>${e.forYou}</p></div>
          <div class="meta-row">
            <span class="verified">covers: ${e.covers} · last verified ${e.verified}</span>
            <a class="out" href="${e.url}" target="_blank" rel="noopener">read the source policy</a>
          </div>
        </div>
      </article>`).join("");

    list.querySelectorAll(".entry").forEach(el => {
      const head = el.querySelector(".entry-head");
      head.addEventListener("click", () => {
        const open = el.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    /* a single result opens itself */
    if (items.length === 1) {
      const el = list.querySelector(".entry");
      el.classList.add("open");
      el.querySelector(".entry-head").setAttribute("aria-expanded", "true");
    }
  }

  /* ---------- search suggestions (local index + Crossref fallback) ---------- */
  const search = document.getElementById("register-search");
  const sugg = document.getElementById("register-suggest");
  const dec = s => s.replace(/&amp;/g, "&").replace(/&ndash;/g, "\u2013");
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const SUGG_INDEX = (typeof JOURNAL_INDEX !== "undefined" ? JOURNAL_INDEX.slice() : []);
  POLICY_REGISTER.forEach(e => SUGG_INDEX.push({ j: e.org, o: e.org }));
  SUGG_INDEX.forEach(x => { x.k = dec(x.j).toLowerCase(); });

  /* Crossref publisher string → register entry. Order matters: first match wins. */
  const PUBLISHER_MAP = [
    [/wiley|hindawi/i, "Wiley"],
    [/american chemical society/i, "ACS Publications"],
    [/springer|nature portfolio|biomed central|palgrave/i, "Springer Nature"],
    [/elsevier|cell press|the lancet/i, "Elsevier"],
    [/informa|taylor\s*(&|and)\s*francis|routledge|dove medical/i, "Taylor &amp; Francis"],
    [/oxford university press/i, "Oxford University Press"],
    [/cambridge university press/i, "Cambridge University Press"],
    [/mdpi/i, "MDPI"],
    [/frontiers media/i, "Frontiers"],
    [/sage publications/i, "SAGE"],
    [/public library of science|plos/i, "PLOS"],
    [/american society for microbiology/i, "ASM Journals"],
    [/rockefeller university press/i, "Rockefeller University Press"],
    [/american association for the advancement of science|aaas/i, "Science · AAAS"],
    [/\bieee\b|institute of electrical/i, "IEEE"],
    [/association for computing machinery|\bacm\b/i, "ACM"],
    [/american psychological association/i, "APA Publishing"],
    [/^bmj|bmj publishing/i, "BMJ"],
    [/american medical association/i, "JAMA Network"],
    [/national academy of sciences/i, "PNAS"],
    [/embo/i, "EMBO Press"],
    [/company of biologists/i, "The Company of Biologists"],
    [/royal society of chemistry/i, "Royal Society of Chemistry"],
    [/elife/i, "eLife"]
  ];
  const mapPublisher = p => {
    for (const [re, org] of PUBLISHER_MAP) if (re.test(p)) return org;
    return null;
  };

  let localHits = [];
  let crossref = { q: "", items: [], loading: false };
  let crossrefTimer = null;

  function hideSuggestions() {
    if (sugg) { sugg.hidden = true; sugg.innerHTML = ""; }
  }

  function pickOrg(org, label, jr) {
    selectedOrg = org;
    selectedJournal = jr || null;
    if (search) { search.value = label; query = label; }
    activeCat = "all";
    document.querySelectorAll(".filter-btn").forEach(btn =>
      btn.classList.toggle("on", btn.dataset.cat === "all"));
    hideSuggestions();
    render();
    if (list.scrollIntoView) list.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderSugg() {
    if (!sugg) return;
    const q = query.trim().toLowerCase();
    const cr = crossref.q === q ? crossref : { items: [], loading: false };
    const seen = new Set(localHits.map(x => x.k));
    const crItems = cr.items.filter(it => !seen.has(it.title.toLowerCase()));
    if (q.length < 2 || (!localHits.length && !crItems.length && !cr.loading)) { hideSuggestions(); return; }

    let html = localHits.map((x, i) =>
      `<button type="button" data-kind="local" data-i="${i}">${x.j}${x.j === x.o ? "" : ` <span class="sugg-org">→ ${x.o}</span>`}</button>`
    ).join("");
    if (cr.loading) {
      html += `<span class="sugg-note">searching the Crossref journal database…</span>`;
    } else {
      crItems.forEach((it, i) => {
        if (it.org) {
          html += `<button type="button" data-kind="cr" data-i="${i}">${esc(it.title)} <span class="sugg-org">· ${esc(it.publisher)} → ${it.org}</span></button>`;
        } else {
          html += `<span class="sugg-note">${esc(it.title)} · published by ${esc(it.publisher)} — not yet in the register. <a href="mailto:rio@ncbs.res.in?subject=${encodeURIComponent("Add " + it.title + " to the AI policy register")}">Ask the office to add it</a>.</span>`;
        }
      });
    }
    sugg.innerHTML = html;
    sugg.hidden = false;
    sugg.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => {
        const i = +b.dataset.i;
        if (b.dataset.kind === "local") {
          const x = localHits[i];
          pickOrg(x.o, dec(x.j), x.j === x.o ? null : { j: dec(x.j), o: x.o, v: x.v, d: x.d, u: x.u });
        }
        else {
          const it = crItems[i];
          pickOrg(it.org, it.title, { j: it.title, o: it.org });
        }
      });
    });
  }

  function crossrefLookup(q) {
    clearTimeout(crossrefTimer);
    if (q.length < 4 || typeof fetch === "undefined") return;
    crossrefTimer = setTimeout(() => {
      crossref = { q: q, items: [], loading: true };
      renderSugg();
      fetch("https://api.crossref.org/journals?rows=4&query=" + encodeURIComponent(q))
        .then(r => r.json())
        .then(data => {
          if (query.trim().toLowerCase() !== q) return;
          const items = ((data.message && data.message.items) || []).map(it => ({
            title: (Array.isArray(it.title) ? it.title[0] : it.title) || "",
            publisher: it.publisher || ""
          })).filter(x => x.title && x.publisher);
          items.forEach(it => { it.org = mapPublisher(it.publisher); });
          crossref = { q: q, items: items, loading: false };
          renderSugg();
        })
        .catch(() => {
          crossref = { q: q, items: [], loading: false };
          renderSugg();
        });
    }, 450);
  }

  function showSuggestions() {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { localHits = []; hideSuggestions(); clearTimeout(crossrefTimer); return; }
    const rank = x => x.k === q ? 0 : x.k.startsWith(q) ? 1 : 2;
    localHits = SUGG_INDEX.filter(x => x.k.includes(q))
      .sort((a, b) => rank(a) - rank(b) || a.k.length - b.k.length)
      .slice(0, 8);
    renderSugg();
    if (localHits.length < 3) crossrefLookup(q); else clearTimeout(crossrefTimer);
  }

  if (search) search.addEventListener("input", () => {
    query = search.value;
    selectedOrg = null;
    selectedJournal = null;
    showSuggestions();
    render();
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".reg-search")) hideSuggestions();
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      activeCat = btn.dataset.cat;
      if (selectedOrg) { query = ""; if (search) search.value = ""; }
      selectedOrg = null;
      selectedJournal = null;
      render();
    });
  });

  const expandAll = document.getElementById("expand-all");
  if (expandAll) {
    expandAll.addEventListener("click", () => {
      const anyClosed = [...list.querySelectorAll(".entry")].some(e => !e.classList.contains("open"));
      list.querySelectorAll(".entry").forEach(e => {
        e.classList.toggle("open", anyClosed);
        e.querySelector(".entry-head").setAttribute("aria-expanded", anyClosed ? "true" : "false");
      });
      expandAll.textContent = anyClosed ? "Collapse all" : "Expand all";
    });
  }

  render();
});
