# Product context

One-line pitch: tulocal lets anyone build an online shop from phone photos. AI generates the listing (images, title, description, price), the shop gets its own URL and QR, and a per-shop AI agent handles buyer questions and negotiation.

Read this before touching product code. For visual design see [design.md](./design.md). For exactly how the shop agent behaves (negotiation, floor price, scam detection, buy handoff) see [rules.md](./rules.md).

## What it explicitly is NOT

- Not a marketplace. No central catalog, no global search or discovery, no commission taken on sales.
- Sellers bring their own buyers (Instagram, WhatsApp, word of mouth, ferias). The product does not generate demand.
- Does not auto-publish to Mercado Libre or Facebook Marketplace. It can generate copy or links the seller pastes manually.
- Does not process payments between buyers and sellers. The only money tulocal handles is the seller's own plan subscription, see "Plans" below.
- Does not manage shipping or logistics.

If you find yourself building catalog browsing, cross-shop search, or checkout and payments for buyers, stop and check. That is out of scope by design.

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

## Plans

Decided on 2026-09-16. Every product runs the AI pipeline and every agent reply costs money, so usage is capped per plan. Prices are in ARS, charged monthly through Mercado Pago, cancellable any time.

| | Gratis | Pro | Negocio |
| --- | --- | --- | --- |
| Price | $0 | $10.000 per month (launch, $15.000 struck through) | $25.000 per month |
| Products | 3 created, ever. Selling or deleting does not free a slot | up to 20 at a time, 40 new per month | up to 100 at a time, 150 new per month |
| Agent replies | 100 per month | unlimited | unlimited |
| AI scenes for Instagram | no, exports use the pipeline photos | 30 per month | 100 per month |
| Verified badge next to the shop name | no | yes | yes |
| Placement in the store directory and search | after paid shops | before free shops | first |

- "At a time" counts every product row of the shop, whatever its status. Deleting one frees the slot.
- New products and AI scenes are capped per calendar month (Buenos Aires time), decided on 2026-09-18 because every product generates three AI images and every scene one more. The caps reset on the 1st and `/plans` shows how much is left. Creating and deleting in a loop cannot burn AI credits.
- Retrying a pipeline is allowed only when it failed, and does not use a slot.
- When a paid plan ends, existing products stay published. The free limit counts every product ever created, so the shop cannot add more until it subscribes again.
- When a free shop runs out of agent replies for the month, buyers see the WhatsApp contact instead of the chat.
- No "Hecho con tulocal" branding on any plan. Decided on 2026-09-18: the Pro card shows $15.000 struck through next to the $10.000 launch price. $15.000 is the regular price Pro moves to after the launch, so the struck price must become a real price: raise it for new subscriptions only, never touching existing preapprovals, and remove the struck price if the launch price becomes permanent. Plan cards keep four short benefits each; monthly caps for new products (Pro 40, Negocio 150) are shown in `/plans` and when reached.

## Feature priority

**v1 (build first, the core loop)**

1. Suggested price with comparables and the price/speed slider.
2. Secret floor price that the agent respects.
3. Self-completing product record (unanswered questions get saved back to the listing).
4. Printable A5 flyer with QR code.
5. Export to Instagram: a story and a three slide carousel composed from the listing, an optional AI scene, and a caption ready to paste.

**v2 (support features)**

- Scam detector.
- "The nudge": the agent suggests a price drop if a product has been unsold for 15 days.
- Copy generation for Marketplace and Mercado Libre.

**Later (high impact, optional)**

- Live voice (OpenAI Realtime API).
- Short product video generated from the photos.
- 3D "spin it around" product view.
