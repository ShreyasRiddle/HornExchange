# AI API Contracts (Frozen)

Last updated: 2026-03-10

These contracts back the following route handlers and are typed in `lib/api-contracts.ts`.

- `POST /api/ai/search`
- `POST /api/ai/refine`
- `POST /api/ai/generate-listing`
- `POST /api/ai/message-assist`

## Stability policy

- Additive response fields are allowed.
- Request/response field renames or removals require coordinated update windows.
- Validation failures return 400 with `{ "error": string }`.

## POST /api/ai/search

Request body:

```json
{ "query": "Need a trusted haircut under $25 in West Campus tonight" }
```

Success response (`200`):
- `SearchResult` from `lib/types.ts`
- Fields: `intent`, `recommendations`

Errors:
- `400` when `query` is missing or empty

## POST /api/ai/refine

Request body:

```json
{ "query": "Need a trusted haircut under $25 in West Campus tonight", "preference": "Cheaper" }
```

Allowed `preference` values:
- `Cheaper`
- `Closer`
- `More Trusted`
- `Available Sooner`
- `Not This Vibe`

Success response (`200`):
- `SearchResult` shape
- `recommendations` reflects refinement reranking

Errors:
- `400` when `query` is missing/empty or `preference` is outside the allowed enum

## POST /api/ai/generate-listing

Request body:

```json
{ "input": "I do resume edits for UT students in West Campus and can take meetings tonight" }
```

Success response (`200`):
- `ListingAssistResponse` from `lib/types.ts`
- Fields: `title`, `description`, `category`, `tags`, `availabilityHint`, `improvementNotes`

Errors:
- `400` when `input` is missing or empty

## POST /api/ai/message-assist

Request body:

```json
{ "listingId": "alex-fades" }
```

Success response (`200`):
- `MessageAssistResponse` from `lib/types.ts`
- Fields: `buyerOpeners`, `sellerReplies`

Errors:
- `400` when `listingId` is missing or empty
- `404` when `listingId` is not found in current listing seed set
