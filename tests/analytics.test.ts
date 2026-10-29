import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../src/lib/db";
import { hashVisitor, hashSession } from "../src/lib/privacy";

describe("Analytics Database & Metrics Calculation", () => {
  const db = getDb();
  const testWebsiteId = "web_unit_test";

  beforeAll(() => {
    // Insert test organization
    db.prepare(`
      INSERT OR REPLACE INTO organizations (id, name, slug, created_at)
      VALUES ('org_test', 'Test Org', 'test-org', datetime('now'))
    `).run();

    // Insert test website
    db.prepare(`
      INSERT OR REPLACE INTO websites (id, organization_id, name, domain, public_id, created_at, updated_at)
      VALUES (?, 'org_test', 'Test Site', 'example.com', 'pfa_test', datetime('now'), datetime('now'))
    `).run(testWebsiteId);

    // Insert 3 test events: 2 from visitor A, 1 from visitor B
    const now = new Date();
    const vA = hashVisitor("10.0.0.1", testWebsiteId, now.toISOString().slice(0, 10));
    const sA = hashSession(vA, "Chrome-macOS", now);

    const vB = hashVisitor("10.0.0.2", testWebsiteId, now.toISOString().slice(0, 10));
    const sB = hashSession(vB, "Firefox-Linux", now);

    db.prepare(`
      INSERT INTO events (id, website_id, session_id, visitor_hash, event_name, path, title, referrer_source, referrer_domain, browser, os, device, country, event_data, created_at)
      VALUES
        ('evt_1', ?, ?, ?, 'pageview', '/', 'Home', 'Direct', 'Direct', 'Chrome', 'macOS', 'Desktop', 'US', '{}', ?),
        ('evt_2', ?, ?, ?, 'pageview', '/pricing', 'Pricing', 'Direct', 'Direct', 'Chrome', 'macOS', 'Desktop', 'US', '{}', ?),
        ('evt_3', ?, ?, ?, 'pageview', '/', 'Home', 'Search', 'google.com', 'Firefox', 'Linux', 'Desktop', 'DE', '{}', ?)
    `).run(
      testWebsiteId, sA, vA, now.toISOString(),
      testWebsiteId, sA, vA, new Date(now.getTime() + 10000).toISOString(),
      testWebsiteId, sB, vB, now.toISOString()
    );
  });

  it("calculates exact pageviews, unique visitors, and sessions", () => {
    const stats = db
      .prepare(`
        SELECT
          COUNT(*) as total_pageviews,
          COUNT(DISTINCT visitor_hash) as unique_visitors,
          COUNT(DISTINCT session_id) as total_sessions
        FROM events
        WHERE website_id = ? AND event_name = 'pageview'
      `)
      .get(testWebsiteId) as any;

    expect(stats.total_pageviews).toBe(3);
    expect(stats.unique_visitors).toBe(2);
    expect(stats.total_sessions).toBe(2);
  });

  it("calculates bounce rate accurately", () => {
    // Visitor A visited 2 pages (not bounced), Visitor B visited 1 page (bounced)
    // Total sessions = 2, single-page sessions = 1 -> Bounce rate = 50%
    const bounceStats = db
      .prepare(`
        SELECT COUNT(*) as single_page_sessions FROM (
          SELECT session_id
          FROM events
          WHERE website_id = ? AND event_name = 'pageview'
          GROUP BY session_id
          HAVING COUNT(*) = 1
        )
      `)
      .get(testWebsiteId) as any;

    expect(bounceStats.single_page_sessions).toBe(1);
    const bounceRate = Math.round((bounceStats.single_page_sessions / 2) * 100);
    expect(bounceRate).toBe(50);
  });

  it("calculates top pages correctly", () => {
    const pages = db
      .prepare(`
        SELECT path, COUNT(*) as pageviews
        FROM events
        WHERE website_id = ? AND event_name = 'pageview'
        GROUP BY path
        ORDER BY pageviews DESC
      `)
      .all(testWebsiteId) as any[];

    expect(pages[0].path).toBe("/");
    expect(pages[0].pageviews).toBe(2);
    expect(pages[1].path).toBe("/pricing");
    expect(pages[1].pageviews).toBe(1);
  });
});
