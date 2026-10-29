import { describe, it, expect } from "vitest";
import {
  hashVisitor,
  hashSession,
  parseUserAgent,
  parseReferrer,
  sanitizePath,
  sanitizeEventData,
} from "../src/lib/privacy";

describe("Privacy Engine & Anonymization", () => {
  it("generates consistent visitor hash for same IP and day, but different for different days", () => {
    const ip = "203.0.113.195";
    const websiteId = "web_test_123";

    const hashDay1 = hashVisitor(ip, websiteId, "2026-10-29");
    const hashDay1Repeat = hashVisitor(ip, websiteId, "2026-10-29");
    const hashDay2 = hashVisitor(ip, websiteId, "2026-10-30");

    expect(hashDay1).toBe(hashDay1Repeat);
    expect(hashDay1).not.toBe(hashDay2);
    expect(hashDay1.length).toBe(32);
    // Ensure raw IP is never in the hash output
    expect(hashDay1).not.toContain(ip);
  });

  it("isolates visitor hashes across different websites", () => {
    const ip = "203.0.113.195";
    const hashWebA = hashVisitor(ip, "web_A", "2026-10-29");
    const hashWebB = hashVisitor(ip, "web_B", "2026-10-29");

    expect(hashWebA).not.toBe(hashWebB);
  });

  it("correctly identifies devices, browsers, and operating systems without fingerprinting", () => {
    const macChrome =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    const parsedMac = parseUserAgent(macChrome);
    expect(parsedMac.browser).toBe("Chrome");
    expect(parsedMac.os).toBe("macOS");
    expect(parsedMac.device).toBe("Desktop");

    const iphoneSafari =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
    const parsedIphone = parseUserAgent(iphoneSafari);
    expect(parsedIphone.browser).toBe("Safari");
    expect(parsedIphone.os).toBe("iOS");
    expect(parsedIphone.device).toBe("Mobile");

    const ipadSafari =
      "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
    const parsedTablet = parseUserAgent(ipadSafari);
    expect(parsedTablet.device).toBe("Tablet");
  });

  it("sanitizes referrer and categorizes traffic sources correctly", () => {
    const googleRef = "https://www.google.com/search?q=privacy+friendly+analytics&oq=test";
    const parsedGoogle = parseReferrer(googleRef, "mywebsite.com");
    expect(parsedGoogle.source).toBe("Search");
    expect(parsedGoogle.domain).toBe("google.com");

    const twitterRef = "https://t.co/xyz123";
    const parsedTwitter = parseReferrer(twitterRef, "mywebsite.com");
    expect(parsedTwitter.source).toBe("Social");

    const directRef = "";
    const parsedDirect = parseReferrer(directRef, "mywebsite.com");
    expect(parsedDirect.source).toBe("Direct");
  });

  it("strips sensitive tokens and PII query parameters from path URLs", () => {
    const dirtyUrl = "/checkout/success?token=secret123&email=user%40example.com&utm_source=twitter&session_id=sess_99";
    const clean = sanitizePath(dirtyUrl);

    expect(clean).toContain("/checkout/success");
    expect(clean).toContain("utm_source=twitter");
    expect(clean).not.toContain("token=secret123");
    expect(clean).not.toContain("email");
    expect(clean).not.toContain("session_id");
  });

  it("strips PII fields from custom event payloads", () => {
    const dirtyPayload = {
      plan: "developer",
      email: "victim@example.com",
      password: "plain_password",
      token: "secret_jwt",
      amount: 49,
      is_trial: false,
    };

    const sanitized = sanitizeEventData(dirtyPayload);
    expect(sanitized.plan).toBe("developer");
    expect(sanitized.amount).toBe(49);
    expect(sanitized.is_trial).toBe(false);
    expect(sanitized).not.toHaveProperty("email");
    expect(sanitized).not.toHaveProperty("password");
    expect(sanitized).not.toHaveProperty("token");
  });
});
