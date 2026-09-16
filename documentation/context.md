# Product context

One-line pitch: tulocal lets anyone build an online shop from phone photos. AI generates the listing (images, title, description, price), the shop gets its own URL and QR, and a per-shop AI agent handles buyer questions and negotiation.

Read this before touching product code. For visual design see [design.md](./design.md). For exactly how the shop agent behaves (negotiation, floor price, scam detection, buy handoff) see [rules.md](./rules.md).

## What it explicitly is NOT

- Not a marketplace. No central catalog, no global search or discovery, no commission taken on sales.
- Sellers bring their own buyers (Instagram, WhatsApp, word of mouth, ferias). The product does not generate demand.
- Does not auto-publish to Mercado Libre or Facebook Marketplace. It can generate copy or links the seller pastes manually.
- Does not process payments.
- Does not manage shipping or logistics.

If you find yourself building catalog browsing, cross-shop search, or checkout and payments, stop and check. That is out of scope by design.

## Who it is for

Two user types, same product:

- **Emprendedores.** People who make and sell things (baking, candles, macramé, clothing) via Instagram or ferias, with no designer or copywriter, posting at 11pm. Many products, ongoing. The shop becomes a permanent catalog.
- **Casual and used-goods sellers.** Selling the couch that does not fit, an old phone, a bike, inherited stuff. Sells rarely, no process. One or two products at a time. The shop becomes a temporary listing page.

Both use the exact same flow: photo in, listing out, agent handles the buyer conversation. Do not build separate paths for these two personas. The differentiation is in how they use it, not in what is built.

## Naming and market

- The product name is **tulocal**, lowercase, one word. The old names "sale." and "tutienda" are retired. Do not use them in code, copy, examples, or docs.
- Shop URLs follow the pattern `tulocal/<handle>`, for example `tulocal/martina`.
- Initial market: Argentina. Currency is ARS, product copy is Rioplatense Spanish with voseo. Comparable price research is biased toward Mercado Libre Argentina.

## Seller side (private, account required)

1. Create shop: name, handle (`tulocal/martina`), color, configure the shop agent.
2. Add a product by uploading up to 3 photos.
3. Review and edit what the AI proposed. Nothing publishes without the seller looking at it first.
4. Set a sale price and a secret floor price. The buyer never sees the floor.
5. Add product-specific context for the agent (condition notes, pickup details, etc).
6. Share the shop URL or QR.
7. Get notified (email and/or WhatsApp) when a serious buyer shows up.

## Buyer side (public, no account)

1. Arrives via link or QR, either at the shop or directly at a product page.
2. Sees enhanced photos, price, description.
3. Two entry points: "talk to the owner" (opens WhatsApp with a prefilled message) and "talk to [agent name]" (in-page chat with that shop's agent).
4. Can ask questions, request details, and negotiate with the agent.
5. When the agent detects real buying intent, the product page surfaces a clear contact-the-seller action (WhatsApp and/or email, both channels are in scope). The exact trigger logic and message format are defined in [rules.md](./rules.md), not here.

## Product-creation pipeline

1. Seller uploads 1 to 3 photos from their phone.
2. AI identifies the item: category from a fixed taxonomy, condition on four levels (nuevo, como nuevo, buen estado, con detalles), brand and model when visible, and visible details or flaws.
3. AI generates enhanced images: one primary shot on a clean white background, and one or two contextual shots with a background that complements the product's color. Generated images must never depict a different product than the one photographed.
4. AI generates a title and a description.
5. AI searches for comparable listings (Mercado Libre, Facebook Marketplace) and surfaces 3 or 4 comparables with real prices.
6. AI proposes a price range, exposed as a price-versus-sale-speed slider (sell fast and cheap, or wait and ask for more).
7. Seller accepts or edits everything, including category, condition, brand and model. Nothing is final until reviewed.
8. Seller sets the floor price and adds agent context.

How this pipeline is implemented (providers, synchronous mode, image upload) lives in [engineering.md](./engineering.md).

## Shop agent

Each shop has its own agent, with a name and personality chosen by the seller. It is that shop's employee, not "the tulocal assistant".

Seller-configurable: name (free text, with default suggestions), appearance (a mascot and a color from a set), tone (formal, casual with slang, or terse and direct), shop-wide context (delivery, payment methods, area, hours), per-product context, and the floor price (secret).

Behavior at a glance:

- Answers from what it knows. If it does not know something, it asks the seller rather than inventing an answer, and the answer gets saved to the product record permanently.
- Negotiates gradually but under a **hard ceiling rule**: it must never concede below the floor price and must never reveal it. This is a hard constraint, not a soft preference. The exact mechanism is in [rules.md](./rules.md).
- Detects real buying intent and triggers the seller-contact handoff (WhatsApp and/or email).
- Detects known scam patterns.

## Feature priority

**v1 (build first, the core loop)**

1. Suggested price with comparables and the price/speed slider.
2. Secret floor price that the agent respects.
3. Self-completing product record (unanswered questions get saved back to the listing).
4. Printable A5 flyer with QR code.

**v2 (support features)**

- Scam detector.
- "The nudge": the agent suggests a price drop if a product has been unsold for 15 days.
- Copy generation for Marketplace, Mercado Libre, and Instagram stories.

**Later (high impact, optional)**

- Live voice (OpenAI Realtime API).
- Short product video generated from the photos.
- 3D "spin it around" product view.
