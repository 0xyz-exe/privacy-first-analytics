# Changelog

All notable changes to **Privacy-First Analytics** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-30

### Added
- **Core Privacy Engine:** Cryptographic daily-rotating salt hashing for irreversible visitor identification without raw IP persistence.
- **Ultra-lightweight Tracker:** 1.49 KB gzipped standalone vanilla JavaScript tracking engine with zero external dependencies.
- **SPA Navigation Interception:** Native history `pushState`, `replaceState`, and `popstate` support for modern frontend frameworks.
- **Custom Event Tracking:** Safe non-PII event tracking API (`window.privacyAnalytics.track`) with automated credential stripping.
- **Conversion Goals:** Target conversion tracking based on custom event names or specific funnel URLs.
- **Outbound Link & Download Tracking:** Automated detection of external link outbound clicks and common file downloads.
- **Interactive Modern Dashboard:** High-density analytics console with Recharts timeseries, top pages, traffic channels, device breakdown, and geographic reach.
- **Multi-Website Management:** Support for multiple websites per account with custom retention policies and public tracking IDs.
- **Containerization:** Production multi-stage Dockerfile and Docker Compose configuration.
