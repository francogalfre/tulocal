# tutienda — Product Context

One-line pitch: tutienda lets anyone build an online shop from phone photos — AI generates the listing (images, title, description, price), the shop gets its own URL and QR, and a per-shop AI agent handles buyer questions and negotiation.

Read this before touching product code. For visual design specifics see `.claude/DESIGN.md`. For exactly how the shop agent behaves (negotiation, floor price, scam detection, buy handoff) see `.claude/RULES.md`.

## What it explicitly is NOT

- Not a marketplace. No central catalog, no global search/discovery, no commission taken on sales.
- Sellers bring their own buyers (Instagram, WhatsApp, word of mouth, ferias) — the product doesn't generate demand.
- Does not auto-publish to Mercado Libre or Facebook Marketplace (it can generate copy/links the seller pastes manually).
- Does not process payments.
- Does not manage shipping/logistics.

If you find yourself building catalog browsing, cross-shop search, or checkout/payments, stop and check — that's out of scope by design.

## Who it's for

Two user types, same product:

- **Emprendedores** — people who make and sell things (baking, candles, macramé, clothing) via Instagram or ferias, no designer or copywriter, posting at 11pm. Many products, ongoing. The shop becomes a permanent catalog.
- **Casual/used-goods sellers** — selling the couch that doesn't fit, an old phone, a bike, inherited stuff. Sells rarely, no process. One or two products at a time. The shop becomes a temporary listing page.

Both use the exact same flow: photo in, listing out, agent handles the buyer conversation. Don't build separate paths for these two personas — the differentiation is in how they use it, not in what's built.

## Naming

Product name is **tutienda** (lowercase, one word). The old name "sale." is retired — do not use it in code, copy, examples, or docs. Shop URLs follow the pattern `tutienda/<handle>` (e.g. `tutienda/martina`).

## Seller side (private, account required)

1. Create shop: name, handle (`tutienda/martina`), color, configure the shop agent.
2. Add a product by uploading up to 3 photos.
3. Review/edit what the AI proposed — nothing publishes without the seller looking at it first.
4. Set sale price and a secret floor price (buyer never sees this).
5. Add product-specific context for the agent (condition notes, pickup details, etc).
6. Share the shop URL or QR.
7. Get notified (email and/or WhatsApp) when a serious buyer shows up.

## Buyer side (public, no account)

1. Arrives via link or QR, either at the shop or directly at a product page.
2. Sees enhanced photos, price, description.
3. Two entry points: "Talk to the owner" (opens WhatsApp with a prefilled message) and "Talk to [agent name]" (in-page chat with that shop's agent).
4. Can ask questions, request details, and negotiate with the agent.
5. When the agent detects real buying intent, the product page surfaces a clear contact-the-seller action (WhatsApp and/or email — both channels are in scope). Exact trigger logic and message format are defined in `.claude/RULES.md`, not here.

## Product-creation pipeline → `packages/assets`

**This package is currently empty — it is the build target for the flow below.**

1. Seller uploads 1–3 photos from their phone.
2. AI identifies the item, its condition, visible details/flaws.
3. AI generates enhanced images: one primary shot on a clean white background, one or two contextual shots with a background that complements the product's color.
4. AI generates title and description.
5. AI searches for comparable listings (Mercado Libre, Facebook Marketplace) and surfaces 3–4 comparables with real prices.
6. AI proposes a price range, exposed as a price-vs-sale-speed slider (sell fast and cheap, or wait and ask for more).
7. Seller accepts or edits everything — nothing is final until reviewed.
8. Seller sets the floor price and adds agent context.

## Shop agent → `packages/agents`

**This package is currently empty — it is the build target for the agent described below.** Behavioral specifics (negotiation tactics, floor-price enforcement, scam detection, buy handoff) live in `.claude/RULES.md` — this section is intentionally high-level.

Each shop has its own agent: a name and personality chosen by the seller. It is that shop's employee, not "the tutienda assistant."

Seller-configurable: name (free text, with default suggestions), appearance (a mascot + color from a set), tone (formal / casual-slang / terse-and-direct), shop-wide context (delivery, payment methods, area, hours), per-product context, and the floor price (secret).

Behavior at a glance:
- Answers from what it knows; if it doesn't know something, it asks the seller rather than inventing an answer, and the answer gets saved to the product record permanently.
- Negotiates gradually but is under a **hard ceiling rule**: it must never concede below the floor price and must never reveal it. This is a hard constraint, not a soft preference — see `.claude/RULES.md` for the exact mechanism.
- Detects real buying intent and triggers the seller-contact handoff (WhatsApp and/or email).
- Detects known scam patterns.

## Feature priority

**v1 (build first / core loop)**
1. Suggested price with comparables + price/speed slider.
2. Secret floor price that the agent respects.
3. Self-completing product record (unanswered questions get saved back to the listing).
4. Printable A5 flyer with QR code.

**v2 (support features)**
- Scam detector.
- "The nudge" — agent suggests a price drop if a product has been unsold for 15 days.
- Copy generation for Marketplace / Mercado Libre / Instagram story.

**Later (high-impact, optional)**
- Live voice (OpenAI Realtime API).
- Short product video generated from the photos.
- 3D "spin it around" product view.

## Related docs

- `.claude/DESIGN.md` — visual design system.
- `.claude/RULES.md` — shop agent behavior rules (negotiation, floor price enforcement, scam detection, buy handoff).
