import { create } from "axios";

const BASE_URL = "https://www.pcstudio.in";
const TIMEOUT_MS = 20_000;

const client = create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Upgrade-Insecure-Requests": "1",
  },
  validateStatus: () => true,
});

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_ATTEMPTS = 3;

export async function fetchPcStudioSearchHtml(query) {
  const searchQuery = String(query ?? "").trim();
  if (!searchQuery) throw new Error("A valid search query is required.");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // PCStudio uses a standard WooCommerce search
      const response = await client.get("/", { params: { s: searchQuery, post_type: "product" } });
      if (response.status >= 200 && response.status < 300) {
        return String(response.data ?? "");
      }
      console.error("[PCStudio Client] Unexpected status.", { status: response.status, attempt });
      if (attempt < MAX_ATTEMPTS) await delay(500 * (2 ** (attempt - 1)));
    } catch (error) {
      console.error("[PCStudio Client] Network error.", { attempt, message: error instanceof Error ? error.message : String(error) });
      if (attempt < MAX_ATTEMPTS) await delay(500 * (2 ** (attempt - 1)));
    }
  }
  return null;
}
