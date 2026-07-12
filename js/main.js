/* ==========================================================================
   共用邏輯：導覽列、搜尋、分類卡片、文章清單、單篇文章渲染
   ========================================================================== */

/* ---------- 資料載入：從 data/*.json 讀取（後台系統會直接編輯這兩個檔案） ---------- */
let CATEGORIES = [];
let ARTICLES = [];
let FAQS = [];
let RESOURCES = [];

async function loadSiteData() {
  const [catRes, artRes, faqRes, resRes] = await Promise.all([
    fetch("data/categories.json"),
    fetch("data/articles.json"),
    fetch("data/faq.json"),
    fetch("data/resources.json"),
  ]);
  const catData = await catRes.json();
  const artData = await artRes.json();
  const faqData = await faqRes.json();
  const resData = await resRes.json();
  CATEGORIES = catData.categories;
  ARTICLES = artData.articles;
  FAQS = faqData.faqs || [];
  RESOURCES = resData.resources || [];
}

/* ---------- 實用資源手風琴渲染 ---------- */
function renderResources(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = RESOURCES.map(
    (r) => `
    <details class="resource-item">
      <summary>
        <span class="resource-tag">${r.tag}</span>
        <span class="resource-title">${r.title}</span>
      </summary>
      <div class="resource-body">${r.content}</div>
    </details>`
  ).join("");
}

/* ---------- FAQ 手風琴渲染 ---------- */
function renderFAQ(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = FAQS.map(
    (f) => `
    <details class="faq-item">
      <summary>${f.question}</summary>
      <p>${f.answer}</p>
    </details>`
  ).join("");
}

/* ---------- 導覽列：手機選單 / 搜尋列展開 ---------- */
function initHeaderInteractions() {
  const menuBtn = document.getElementById("menuToggle");
  const mobilePanel = document.getElementById("mobileNav");
  if (menuBtn && mobilePanel) {
    menuBtn.addEventListener("click", () => {
      mobilePanel.classList.toggle("open");
    });
  }

  const searchBtn = document.getElementById("searchToggle");
  const searchBar = document.getElementById("searchBar");
  if (searchBtn && searchBar) {
    searchBtn.addEventListener("click", () => {
      searchBar.classList.toggle("open");
      if (searchBar.classList.contains("open")) {
        const input = searchBar.querySelector("input");
        if (input) setTimeout(() => input.focus(), 150);
      }
    });
  }

  // 導覽列搜尋列 → Enter 後跳轉到文章列表頁並帶入關鍵字
  const headerSearchInput = document.getElementById("headerSearchInput");
  if (headerSearchInput) {
    headerSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && headerSearchInput.value.trim()) {
        window.location.href = "articles.html?q=" + encodeURIComponent(headerSearchInput.value.trim());
      }
    });
  }
}

/* ---------- 分類線條圖標（手繪感，取代 emoji，統一視覺質感） ---------- */
const CATEGORY_ICONS = {
  money: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 4 L16 28"/>
    <path d="M16 8 C13 7 11 9 11 11 C13 11 15 10 16 8"/>
    <path d="M16 8 C19 7 21 9 21 11 C19 11 17 10 16 8"/>
    <path d="M16 13.5 C13 12.5 11 14.5 11 16.5 C13 16.5 15 15.5 16 13.5"/>
    <path d="M16 13.5 C19 12.5 21 14.5 21 16.5 C19 16.5 17 15.5 16 13.5"/>
    <path d="M16 19 C13 18 11 20 11 22 C13 22 15 21 16 19"/>
    <path d="M16 19 C19 18 21 20 21 22 C19 22 17 21 16 19"/>
  </svg>`,
  love: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 17 C8 11 15 9 19 12 C22 14 25 13 27 9 C26 15 22 18 18 18 C20 21 20 24 17 27 C16 23 13 20 9 19 C7 18.5 5.5 18 5 17Z"/>
  </svg>`,
  grace: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 25 C7 15 15 6 26 6 C27 17 18 25 8 25Z"/>
    <path d="M9 24 C14 19 18 15 25 7"/>
  </svg>`,
  aging: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="14" r="6"/>
    <path d="M4 25 H28"/>
    <path d="M16 3.5 V6"/>
    <path d="M6.5 8.5 L8.3 10.3"/>
    <path d="M25.5 8.5 L23.7 10.3"/>
  </svg>`,
  care: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 28 V15"/>
    <path d="M16 16 C16 10 10 8 6 8 C6 14 10 17.5 16 16Z"/>
    <path d="M16 12.5 C16 8.5 20 6.5 24 6.5 C24 11 20 13.5 16 12.5Z"/>
  </svg>`,
};

/* ---------- 小工具 ---------- */
function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/* ---------- 首頁：五個分類卡片 ---------- */
function renderCategoryGrid(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = CATEGORIES.map(
    (c) => `
    <a class="category-card cat-${c.slug}" href="articles.html?cat=${c.slug}">
      <span class="cat-scrim">
        <h4>${c.name}</h4>
        <p class="cat-desc">${c.subtitle}</p>
      </span>
    </a>`
  ).join("");
}

/* ---------- 文章卡片 HTML ---------- */
function articleCardHtml(article) {
  const cat = getCategoryBySlug(article.category);
  const cover = article.cover || (cat ? cat.banner : "");
  return `
    <a class="article-card" href="article.html?id=${article.id}">
      <span class="card-cover" style="background-image:url('${cover}')"></span>
      <span class="card-body">
        <span class="cat-tag">${cat ? (CATEGORY_ICONS[cat.slug] || "") + cat.name : ""}</span>
        <h3>${article.title}</h3>
        <p class="excerpt">${article.excerpt}</p>
        <div class="meta">
          <span>${formatDate(article.date)}</span>
          <span>${article.readTime || ""}</span>
        </div>
      </span>
    </a>`;
}

/* ---------- 首頁：精選文章（取最新兩篇非草稿） ---------- */
function renderFeaturedArticles(containerId, count = 2) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const list = ARTICLES.filter((a) => !a.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
  el.innerHTML = list.map(articleCardHtml).join("");
}

/* ---------- 文章列表頁：分類篩選 + 搜尋 ---------- */
function initArticlesPage() {
  const listEl = document.getElementById("articleList");
  const filterBar = document.getElementById("filterBar");
  const searchInput = document.getElementById("pageSearchInput");
  const emptyState = document.getElementById("emptyState");
  if (!listEl || !filterBar) return;

  const params = new URLSearchParams(window.location.search);
  let activeCat = params.get("cat") || "all";
  let query = (params.get("q") || "").trim();

  if (searchInput && query) searchInput.value = query;

  // 篩選按鈕
  const buttons = ["all", ...CATEGORIES.map((c) => c.slug)];
  filterBar.innerHTML = buttons
    .map((slug) => {
      const label = slug === "all" ? "全部文章" : getCategoryBySlug(slug).name;
      const isActive = slug === activeCat ? "active" : "";
      return `<button class="filter-btn ${isActive}" data-slug="${slug}">${label}</button>`;
    })
    .join("");

  filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCat = btn.dataset.slug;
      filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = searchInput.value.trim();
      render();
    });
  }

  function render() {
    const q = query.toLowerCase();
    const filtered = ARTICLES.filter((a) => {
      const matchCat = activeCat === "all" || a.category === activeCat;
      if (!matchCat) return false;
      if (!q) return true;
      const haystack = (a.title + " " + a.excerpt + " " + stripHtml(a.content)).toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      listEl.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
    } else {
      if (emptyState) emptyState.style.display = "none";
      listEl.innerHTML = filtered.map(articleCardHtml).join("");
    }
  }

  render();
}

/* ---------- 單篇文章頁 ---------- */
function initArticlePage() {
  const container = document.getElementById("articleContainer");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const article = ARTICLES.find((a) => a.id === id);

  if (!article) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="icon">🍂</span>
        <p>找不到這篇文章，可能已經被移動或下架了。</p>
        <p style="margin-top:1rem;"><a class="back-link" href="articles.html">← 回文章列表</a></p>
      </div>`;
    document.title = "找不到文章｜余玟萱 拉拉";
    return;
  }

  const cat = getCategoryBySlug(article.category);
  const cover = article.cover || (cat ? cat.banner : "");
  document.title = article.title + "｜余玟萱 拉拉";

  if (article.format === "short") {
    container.innerHTML = `
      <div class="short-banner" style="background-image:url('${cover}')">
        <span class="short-banner-label">${cat ? cat.name : ""}</span>
      </div>
      <div class="wrap short-story-wrap">
        <a class="back-link" href="articles.html">← 回文章列表</a>
        <div class="short-story-header">
          <h1>${article.title}</h1>
          <div class="meta">${formatDate(article.date)}　・　真實故事</div>
        </div>
        <div class="article-body short-story-body">
          ${typeof marked !== "undefined" ? marked.parse(article.content) : article.content}
        </div>
        <div class="short-story-cta">
          <a class="btn btn-primary" href="https://line.me/ti/p/OS92ei6lpr" target="_blank" rel="noopener">LINE 預約諮詢</a>
        </div>
      </div>`;
    if (article.content.includes("instagram-media")) loadInstagramEmbed();
    return;
  }

  container.innerHTML = `
    ${cover ? `<div class="article-cover" style="background-image:url('${cover}')"></div>` : ""}
    <div class="wrap">
      <a class="back-link" href="articles.html">← 回文章列表</a>
      <div class="article-header">
        <span class="cat-tag">${cat ? (CATEGORY_ICONS[cat.slug] || "") + cat.name : ""}</span>
        <h1>${article.title}</h1>
        <div class="meta">${formatDate(article.date)}　·　${article.readTime || ""}</div>
      </div>
      <div class="article-body">
        ${typeof marked !== "undefined" ? marked.parse(article.content) : article.content}
      </div>
      ${relatedArticlesHtml(article)}
      <div class="article-footer-cta">
        <p>如果這篇文章讓你想到自己的狀況，歡迎找拉拉聊聊。</p>
        <div class="cta-social-links">
          <a class="btn btn-primary" href="https://line.me/ti/p/OS92ei6lpr" target="_blank" rel="noopener">LINE 預約諮詢</a>
          <a class="btn btn-outline-dark" href="https://www.instagram.com/yuwen06/" target="_blank" rel="noopener">追蹤 Instagram</a>
        </div>
        <div class="brand-signature">
          <p><strong>Hi，我是拉拉 🤍</strong></p>
          <p>陪你走過人生每個重要時刻。每一次對話，都是一個人生難題被認真解開的時刻。</p>
          <p><strong>我能幫你的事：</strong>個人保障｜創富陪跑｜家族傳承｜房產活化</p>
          <p><strong>專業榮譽：</strong><br>MDRT 百萬圓桌｜IDA 國際龍獎｜IFPA 亞太精英獎<br>富邦之星｜長照銷售第一名</p>
        </div>
      </div>
    </div>`;

  // 如果文章內含 Instagram 嵌入，載入 IG 的嵌入腳本並渲染
  if (article.content.includes("instagram-media")) {
    loadInstagramEmbed();
  }
}

/* ---------- 同系列文章推薦 ---------- */
function relatedArticlesHtml(article) {
  const related = ARTICLES.filter((a) => a.category === article.category && a.id !== article.id && !a.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  if (related.length === 0) return "";
  const cat = getCategoryBySlug(article.category);
  return `
    <div class="related-articles">
      <h3>更多「${cat ? cat.name : ""}」的文章</h3>
      <div class="related-list">
        ${related
          .map(
            (a) => `
          <a class="related-item" href="article.html?id=${a.id}">
            <span class="related-thumb" style="background-image:url('${a.cover || (cat ? cat.banner : "")}')"></span>
            <span class="related-title">${a.title}</span>
          </a>`
          )
          .join("")}
      </div>
    </div>`;
}

function loadInstagramEmbed() {
  if (window.instgrm && window.instgrm.Embeds) {
    window.instgrm.Embeds.process();
    return;
  }
  if (document.getElementById("ig-embed-script")) return;
  const script = document.createElement("script");
  script.id = "ig-embed-script";
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.onload = () => {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  };
  document.body.appendChild(script);
}

/* ---------- 首頁：客戶故事輪播（短篇故事） ---------- */
function renderStoryCarousel(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const stories = ARTICLES.filter((a) => a.format === "short" && !a.draft);
  if (stories.length === 0) return;
  el.innerHTML = stories
    .map((s) => {
      const cat = getCategoryBySlug(s.category);
      const thumb = s.cover || (cat ? cat.banner : "");
      return `
      <a class="story-card" href="article.html?id=${s.id}">
        <span class="story-thumb" style="background-image:url('${thumb}')"><span>${s.title}</span></span>
        <span class="story-body">
          <span class="story-cat">${cat ? cat.name : ""}</span>
          <span class="story-excerpt">${s.excerpt}</span>
        </span>
      </a>`;
    })
    .join("");

  const track = document.getElementById(containerId).parentElement;
  const prevBtn = document.getElementById("storyPrev");
  const nextBtn = document.getElementById("storyNext");
  if (prevBtn) prevBtn.addEventListener("click", () => track.scrollBy({ left: -280, behavior: "smooth" }));
  if (nextBtn) nextBtn.addEventListener("click", () => track.scrollBy({ left: 280, behavior: "smooth" }));
}

document.addEventListener("DOMContentLoaded", () => {
  initHeaderInteractions();
});
