# HornExchange AI

HornExchange is a UT-exclusive, services-only marketplace prototype that helps students find trusted student providers quickly through natural-language search and guided matching.

One-sentence pitch:

**HornExchange is a UT-only AI concierge for finding trusted student services through prompt-based search, recommendation matching, and low-friction messaging.**

## What the Product Does

HornExchange is designed around a campus services flow instead of a generic classifieds feed.

Core journey:

1. User enters a natural-language service need (for example, "cheap haircut near West Campus tonight").
2. AI interprets intent and returns ranked provider recommendations.
3. User browses recommendations and saves strong matches.
4. User opens saved providers and sends a message with AI-assisted opener support.
5. Seller can generate a polished listing draft from rough text.

## Key Features

- UT-only access gate (student-only marketplace intent)
- Services-only scope (no product resale flow in v1)
- Prompt-first search experience
- AI interpretation + ranking explanations
- Recommendation browsing and shortlist saves
- Messaging flow with AI assist
- Seller listing copilot

## Run Locally (Quickstart)

### 1) Clone and enter the project

```bash
git clone https://github.com/ShreyasRiddle/HornExchange.git
cd HornExchange
```

If already cloned:

```bash
git pull origin main
```

### 2) Install dependencies

```bash
npm install
```

### 3) Start development server

```bash
npm run dev
```

Open: `http://localhost:3000`

## Common Commands

```bash
npm run lint
npm run build
```

## Full Local Setup + Troubleshooting

For detailed setup help and fixes for common errors (`npm` not found, `node` not found, `'next' is not recognized`, wrong directory, port conflicts), see:

- [docs/run-local.md](docs/run-local.md)

## API Endpoints

- `POST /api/ai/search`
- `POST /api/ai/refine`
- `POST /api/ai/generate-listing`
- `POST /api/ai/message-assist`

## Project Structure (Short)

- `app/` - Next.js app routes and API routes
- `components/` - UI components
- `lib/` - ranking/search/assist logic and shared types
- `supabase/` - schema and seed artifacts
- `docs/` - run guide, QA, and judging docs