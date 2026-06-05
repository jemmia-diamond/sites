/**
 * Strict classification of tracked web crawlers.
 * Only monitors targeted AI Bots and Social Media previews.
 * All other search engines, SEO tools, and generic scrapers are ignored.
 */
const BOT_CLASSIFICATION = [
  { name: "ChatGPT (OpenAI)", keys: ["chatgpt-user", "gptbot", "oai-searchbot"] },
  { name: "Claude (Anthropic)", keys: ["claude-searchbot", "claudebot"] },
  { name: "Perplexity AI", keys: ["perplexitybot", "perplexity-user"] },
  { name: "Meta AI", keys: ["meta-externalagent"] },
  { name: "Bing Bot", keys: ["bingbot"] },
  { name: "Google Extended", keys: ["google-extended"] },
  { name: "ByteSpider (ByteDance)", keys: ["bytespider"] }
];

/**
 * Detects the bot name (matched key) and categorizes its type from the user agent string.
 * Strictly matches against targeted AI Bots and Social Media crawlers.
 *
 * @param {string|null} userAgent - The user agent header value.
 * @returns {{ name: string }|null} The bot info or null if not tracked.
 */
function getBotInfo(userAgent) {
  if (!userAgent) return null;
  const uaLower = userAgent.toLowerCase();

  for (const bot of BOT_CLASSIFICATION) {
    const matchedKey = bot.keys.find(key => uaLower.includes(key));
    if (matchedKey) {
      return { key: matchedKey, name: bot.name };
    }
  }

  return null;
}

/**
 * Generates a stable client ID by hashing the IP address and User-Agent string.
 * This groups activities by the same bot instance.
 *
 * @param {string} ip - The client IP address.
 * @param {string} userAgent - The client User-Agent string.
 * @returns {Promise<string>} The SHA-256 hash or a random fallback ID.
 */
async function generateClientId(ip, userAgent) {
  try {
    const data = new TextEncoder().encode(ip + userAgent);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    return Math.random().toString(36).substring(2);
  }
}

/**
 * Builds the payload object for GA4 Measurement Protocol.
 *
 * @param {string} clientId - The stable client ID.
 * @param {string} botKey - The matched key for the bot.
 * @param {string} botName - The detected bot name.
 * @param {Request} request - The client request object.
 * @returns {object} The GA4 event payload.
 */
function buildPayload(clientId, botKey, botName, request) {
  const urlObj = new URL(request.url);

  return {
    client_id: clientId,
    events: [
      {
        name: "bot_traffic",
        params: {
          bot_key: botKey,
          bot_name: botName,
          page_path: urlObj.pathname,
          method: request.method,
        }
      }
    ]
  };
}

/**
 * Sends a custom event to Google Analytics 4 (GA4) via Measurement Protocol.
 * Runs asynchronously via `ctx.waitUntil`.
 *
 * @param {string} botName - The detected bot name.
 * @param {Request} request - The client request object.
 * @param {Record<string, string>} env - Cloudflare environment bindings/secrets.
 */
async function sendToGA4(botKey, botName, request, env) {
  const measurementId = env.GA4_BOT_MEASUREMENT_ID;
  const apiSecret = env.GA4_BOT_API_SECRET;

  if (!measurementId || !apiSecret) {
    return;
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const clientId = await generateClientId(ip, userAgent);
  const payload = buildPayload(clientId, botKey, botName, request);

  const ga4Url = `${env.GA4_API_URL}/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  try {
    const res = await fetch(ga4Url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GA4 Measurement Protocol responded with ${res.status}: ${errorText}`);
    }
  } catch (err) {
    console.error("Failed to send GA4 event:", err.message ?? err);
  }
}

/**
 * Checks if the visitor is a bot/crawler and ships event to GA4.
 *
 * @param {Request} request - The client request object.
 * @param {Record<string, string>} env - Cloudflare environment bindings/secrets.
 * @param {{ waitUntil: (promise: Promise<any>) => void }} ctx - The Worker execution context.
 */
export function logVisitor(request, env, ctx) {
  const userAgent = request.headers.get("user-agent") || "";
  const botInfo = getBotInfo(userAgent);

  if (botInfo) {
    ctx.waitUntil(sendToGA4(botInfo.key, botInfo.name, request, env));
  }
}
