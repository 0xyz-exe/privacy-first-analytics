# Contributing to Privacy-First Analytics

We welcome contributions from indie developers, privacy engineers, and open-source contributors!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/0xyz-exe/privacy-first-analytics.git
   cd privacy-first-analytics
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Seed demo data:
   ```bash
   pnpm seed
   ```

4. Run development server:
   ```bash
   pnpm dev
   ```

5. Run unit & integration tests:
   ```bash
   pnpm test
   ```

## Pull Request Guidelines

- Ensure `pnpm test` and `pnpm build` pass with zero errors.
- Adhere to the core privacy guidelines: **no tracking cookies, no fingerprinting, no raw IP retention**.
