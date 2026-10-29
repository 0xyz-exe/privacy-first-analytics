import { getDb } from "../src/lib/db";
import bcrypt from "bcryptjs";
import { hashVisitor, hashSession } from "../src/lib/privacy";

async function main() {
  console.log("Seeding database with realistic privacy-first analytics data...");
  const db = getDb();

  // Reset demo records
  db.exec("BEGIN TRANSACTION;");
  try {
    db.exec(`
      DELETE FROM events;
      DELETE FROM goals;
      DELETE FROM website_settings;
      DELETE FROM websites;
      DELETE FROM organization_members;
      DELETE FROM organizations;
      DELETE FROM users;
      DELETE FROM audit_logs;
    `);

    const now = new Date();
    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Demo User
    const userId = "usr_demo_admin";
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, 'owner', ?)
    `).run(userId, "Alex Rivera", "demo@privacyanalytics.dev", passwordHash, now.toISOString());

    // 2. Create Organization
    const orgId = "org_demo_acme";
    db.prepare(`
      INSERT INTO organizations (id, name, slug, created_at)
      VALUES (?, ?, ?, ?)
    `).run(orgId, "Acme Cloud Technologies", "acme-cloud", now.toISOString());

    db.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, role, created_at)
      VALUES (?, ?, ?, 'owner', ?)
    `).run("mem_demo_admin", orgId, userId, now.toISOString());

    // 3. Create Demo Website
    const websiteId = "web_demo_1";
    const publicId = "pfa_demo_acme";
    db.prepare(`
      INSERT INTO websites (id, organization_id, name, domain, public_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(websiteId, orgId, "Acme Tech Blog", "techblog.acme.dev", publicId, now.toISOString(), now.toISOString());

    db.prepare(`
      INSERT INTO website_settings (website_id, respect_dnt, allow_custom_events, track_outbound, track_downloads, retention_days, allowed_domains)
      VALUES (?, 1, 1, 1, 1, 90, ?)
    `).run(websiteId, "techblog.acme.dev, localhost:3000");

    // 4. Create Goals
    db.prepare(`
      INSERT INTO goals (id, website_id, name, event_type, target_value, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("gol_1", websiteId, "Newsletter Subscriptions", "event", "newsletter_signup", now.toISOString());

    db.prepare(`
      INSERT INTO goals (id, website_id, name, event_type, target_value, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("gol_2", websiteId, "Pricing Page Visited", "path", "/pricing", now.toISOString());

    // 5. Generate Realistic Analytics Events over the last 14 days
    const pages = [
      { path: "/", title: "Acme Tech — Engineering & Cloud Blog" },
      { path: "/blog/zero-trust-architecture", title: "Building Zero-Trust Systems in 2026" },
      { path: "/blog/self-hosted-privacy-stack", title: "Why We Migrated Away From Invasive Analytics" },
      { path: "/pricing", title: "Acme Pricing & Plans" },
      { path: "/docs/getting-started", title: "Documentation — Getting Started" },
      { path: "/docs/api-reference", title: "API Reference" },
      { path: "/about", title: "About Acme Technologies" },
      { path: "/careers", title: "Careers at Acme" },
    ];

    const referrers = [
      { source: "Search", domain: "google.com" },
      { source: "Search", domain: "duckduckgo.com" },
      { source: "Social", domain: "news.ycombinator.com" },
      { source: "Social", domain: "twitter.com" },
      { source: "Social", domain: "github.com" },
      { source: "Social", domain: "linkedin.com" },
      { source: "Direct", domain: "Direct" },
      { source: "Referral", domain: "techcrunch.com" },
    ];

    const devices = [
      { device: "Desktop", browser: "Chrome", os: "macOS" },
      { device: "Desktop", browser: "Firefox", os: "Linux" },
      { device: "Desktop", browser: "Chrome", os: "Windows" },
      { device: "Desktop", browser: "Edge", os: "Windows" },
      { device: "Desktop", browser: "Safari", os: "macOS" },
      { device: "Mobile", browser: "Safari", os: "iOS" },
      { device: "Mobile", browser: "Chrome", os: "Android" },
      { device: "Tablet", browser: "Safari", os: "iOS" },
    ];

    const countries = ["United States", "Germany", "United Kingdom", "Indonesia", "Canada", "Singapore", "France", "Japan"];

    const customEventDefs = [
      { name: "newsletter_signup", data: { tier: "free", source: "blog_footer" } },
      { name: "theme_toggle", data: { theme: "dark" } },
      { name: "outbound_click", data: { target_domain: "github.com" } },
      { name: "file_download", data: { file_name: "whitepaper-2026.pdf", file_extension: "pdf" } },
    ];

    const insertEventStmt = db.prepare(`
      INSERT INTO events (
        id, website_id, session_id, visitor_hash, event_name, path, title,
        referrer_source, referrer_domain, browser, os, device, country,
        event_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let totalCreated = 0;
    // Generate events across 14 days
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const dayDate = new Date();
      dayDate.setDate(now.getDate() - dayOffset);
      const dayStr = dayDate.toISOString().slice(0, 10);

      // 40-70 visitors per day
      const dailyVisitorsCount = Math.floor(45 + Math.random() * 35);

      for (let v = 0; v < dailyVisitorsCount; v++) {
        const dummyIp = `198.51.100.${v % 250}`;
        const visitorHash = hashVisitor(dummyIp, websiteId, dayStr);
        const dev = devices[Math.floor(Math.random() * devices.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const ref = referrers[Math.floor(Math.random() * referrers.length)];

        // Set session time
        const eventTime = new Date(dayDate);
        eventTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        const sessionId = hashSession(visitorHash, `${dev.browser}-${dev.os}`, eventTime);

        // 1 to 4 pageviews per visitor
        const pageviewsCount = Math.floor(1 + Math.random() * 3);
        for (let p = 0; p < pageviewsCount; p++) {
          const pg = pages[Math.floor(Math.random() * pages.length)];
          const pTime = new Date(eventTime.getTime() + p * 45 * 1000);

          insertEventStmt.run(
            `evt_${dayOffset}_${v}_${p}_${Math.random().toString(36).slice(2, 6)}`,
            websiteId,
            sessionId,
            visitorHash,
            "pageview",
            pg.path,
            pg.title,
            ref.source,
            ref.domain,
            dev.browser,
            dev.os,
            dev.device,
            country,
            "{}",
            pTime.toISOString()
          );
          totalCreated++;
        }

        // 25% chance of triggering custom event
        if (Math.random() < 0.25) {
          const cEvent = customEventDefs[Math.floor(Math.random() * customEventDefs.length)];
          insertEventStmt.run(
            `evt_cust_${dayOffset}_${v}_${Math.random().toString(36).slice(2, 6)}`,
            websiteId,
            sessionId,
            visitorHash,
            cEvent.name,
            "/",
            "Custom Event Trigger",
            ref.source,
            ref.domain,
            dev.browser,
            dev.os,
            dev.device,
            country,
            JSON.stringify(cEvent.data),
            eventTime.toISOString()
          );
          totalCreated++;
        }
      }
    }

    db.exec("COMMIT;");
    console.log(`Successfully seeded ${totalCreated} analytics events across 14 days!`);
    console.log("Demo credentials: demo@privacyanalytics.dev / password123");
    console.log("Website ID: web_demo_1 | Public ID: pfa_demo_acme");
  } catch (err) {
    db.exec("ROLLBACK;");
    console.error("Seeding failed:", err);
    throw err;
  }
}

main();
