// 抖音搜索探测：用已登录的浏览器态搜关键词，列出结果里的视频/音乐条目。
// 用法：node douyin_search.mjs "<关键词>" [type]
//   type: general(默认) | music | video
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [kw, type = "general"] = process.argv.slice(2);
if (!kw) { console.error("用法: node douyin_search.mjs <关键词> [general|music|video]"); process.exit(1); }

const SKILL_DIR = path.dirname(new URL(import.meta.url).pathname);
const STATE = path.join(SKILL_DIR, "douyin-storage-state.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

const browser = await chromium.launch({ headless: true, args: ["--disable-blink-features=AutomationControlled"] });
const ctx = await browser.newContext({
  storageState: fs.existsSync(STATE) ? STATE : undefined,
  userAgent: UA,
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

const apiHits = [];
page.on("response", async (r) => {
  const u = r.url();
  if (/\/aweme\/v1\/web\/search\/(item|single|general)/.test(u)) {
    try {
      const t = await r.text();
      apiHits.push({ url: u.slice(0, 160), len: t.length, body: t.slice(0, 4000) });
    } catch {}
  }
});

const url = `https://www.douyin.com/search/${encodeURIComponent(kw)}${type === "music" ? "?type=music" : ""}`;
console.log("打开:", url);
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(12000);
// 滚动触发懒加载
for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 1400); await page.waitForTimeout(2500); }
await page.waitForTimeout(4000);
const diag = await page.evaluate(() => ({
  hasLoginModal: !!document.querySelector('[class*="login"]'),
  challenge: /验证|安全验证|captcha/i.test(document.body.innerText),
  mainLen: (document.querySelector('#douyin-header + *')?.innerText || "").length,
  totalText: document.body.innerText.length,
  cardSel: document.querySelectorAll('[data-e2e], [class*="search-result"], li').length,
}));
console.log("诊断:", JSON.stringify(diag));

const body = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
console.log("页面标题:", await page.title().catch(() => ""));
console.log("body 前 300 字:", body.slice(0, 300).replace(/\n+/g, " | "));
console.log("搜索 API 命中:", apiHits.length);

for (const h of apiHits.slice(0, 2)) {
  console.log("--- API", h.url, "len", h.len);
  try {
    const j = JSON.parse(h.body.length < 4000 ? h.body : "");
  } catch {}
  fs.writeFileSync("/tmp/dy_search_hit.json", h.body);
  console.log("   写入 /tmp/dy_search_hit.json");
}

// 列页面上的视频/音乐链接
const links = await page.evaluate(() =>
  [...document.querySelectorAll("a[href*='/video/'], a[href*='/music/']")]
    .map((a) => a.href).filter((v, i, s) => s.indexOf(v) === i).slice(0, 25)
);
console.log("页面链接:", links.length);
for (const l of links) console.log("  ", l);

await browser.close();
