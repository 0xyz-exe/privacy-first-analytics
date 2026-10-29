import crypto from "node:crypto";

const DEFAULT_SALT = process.env.PRIVACY_SALT || "privacy-first-analytics-default-secret-salt-2026";

/**
 * Computes a cryptographically irreversible visitor hash that resets daily.
 * Never stores raw IP. Never links visitors across days or across different websites.
 */
export function hashVisitor(ip: string, websiteId: string, dateStr: string): string {
  return crypto
    .createHash("sha256")
    .update(`${ip}:${websiteId}:${dateStr}:${DEFAULT_SALT}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Computes a 30-minute session hash based on visitor hash and user-agent.
 */
export function hashSession(visitorHash: string, userAgent: string, timestamp: Date): string {
  // 30 minute time window bucket
  const windowIndex = Math.floor(timestamp.getTime() / (30 * 60 * 1000));
  return crypto
    .createHash("sha256")
    .update(`${visitorHash}:${userAgent}:${windowIndex}`)
    .digest("hex")
    .slice(0, 32);
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet";
}

export function parseUserAgent(ua: string = ""): DeviceInfo {
  const lower = ua.toLowerCase();

  // Device
  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))/i.test(lower)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|windows phone/i.test(lower)) {
    device = "Mobile";
  }

  // OS
  let os = "Other";
  if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) os = "iOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";
  else if (lower.includes("cros")) os = "ChromeOS";

  // Browser
  let browser = "Other";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("opr/") || lower.includes("opera/")) browser = "Opera";
  else if (lower.includes("samsungbrowser")) browser = "Samsung Internet";
  else if (lower.includes("chrome") || lower.includes("crios")) browser = "Chrome";
  else if (lower.includes("firefox") || lower.includes("fxios")) browser = "Firefox";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";

  return { browser, os, device };
}

export interface ReferrerInfo {
  source: string; // 'Direct' | 'Search' | 'Social' | 'Referral' | 'Campaign'
  domain: string;
}

export function parseReferrer(rawReferrer: string = "", currentDomain: string = ""): ReferrerInfo {
  if (!rawReferrer || rawReferrer === "" || rawReferrer === "undefined") {
    return { source: "Direct", domain: "Direct" };
  }

  try {
    const url = new URL(rawReferrer);
    const domain = url.hostname.replace(/^www\./, "");

    // Internal referrer check
    if (currentDomain && domain.includes(currentDomain.replace(/^www\./, ""))) {
      return { source: "Direct", domain: "Direct" };
    }

    // Search engines
    if (/google\.|bing\.|duckduckgo\.|yahoo\.|baidu\.|yandex\.|ecosia\./i.test(domain)) {
      return { source: "Search", domain };
    }

    // Social networks
    if (/twitter\.com|x\.com|t\.co|linkedin\.com|facebook\.com|instagram\.com|reddit\.com|youtube\.com|tiktok\.com|threads\.net/i.test(domain)) {
      return { source: "Social", domain };
    }

    return { source: "Referral", domain };
  } catch {
    return { source: "Direct", domain: "Direct" };
  }
}

/**
 * Sanitizes URLs: strips PII, sensitive query parameters, tokens, credentials.
 * Only allows clean path and safe UTM parameters.
 */
export function sanitizePath(rawUrlOrPath: string): string {
  if (!rawUrlOrPath) return "/";

  try {
    let parsed: URL;
    if (rawUrlOrPath.startsWith("http://") || rawUrlOrPath.startsWith("https://")) {
      parsed = new URL(rawUrlOrPath);
    } else {
      parsed = new URL(rawUrlOrPath, "https://analytics.internal");
    }

    let cleanPath = parsed.pathname || "/";
    if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
      cleanPath = cleanPath.slice(0, -1);
    }

    // Retain only safe analytics query params if present
    const safeParams = ["utm_source", "utm_medium", "utm_campaign", "ref"];
    const keptParams = new URLSearchParams();
    parsed.searchParams.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (safeParams.includes(lower)) {
        keptParams.set(lower, encodeURIComponent(val.slice(0, 50)));
      }
    });

    const queryString = keptParams.toString();
    return queryString ? `${cleanPath}?${queryString}` : cleanPath;
  } catch {
    return "/";
  }
}

/**
 * Sanitizes custom event properties to prevent PII leakage.
 */
export function sanitizeEventData(data: unknown): Record<string, string | number | boolean> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  const piiKeywords = ["email", "password", "token", "auth", "secret", "card", "cvv", "phone", "ssn", "nik", "pin", "key"];
  const sanitized: Record<string, string | number | boolean> = {};

  const entries = Object.entries(data as Record<string, unknown>).slice(0, 10);
  for (const [key, val] of entries) {
    const keyLower = key.toLowerCase();
    if (piiKeywords.some((pii) => keyLower.includes(pii))) {
      continue; // Filter out sensitive properties
    }

    if (typeof val === "string") {
      sanitized[key] = val.slice(0, 100);
    } else if (typeof val === "number" && !isNaN(val)) {
      sanitized[key] = val;
    } else if (typeof val === "boolean") {
      sanitized[key] = val;
    }
  }

  return sanitized;
}
