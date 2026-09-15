# tutienda — design system

Short guide to keep the app visually consistent during the hackathon. Based on the identity already locked in (green, outfit + plus jakarta sans) plus a few restraint and typographic-hierarchy principles borrowed from Vercel's design guide.

Related: `.claude/CONTEXT.md` for what the product is, `.claude/RULES.md` for how the shop agent is allowed to behave.

## Principles

Borrowed from Vercel: the ideas that are useful here, not the cold aesthetic.

1. **Typography creates hierarchy, not boxes.** Before adding a border or a background to something, try a size or weight change first.
2. **One surface per screen.** The background is flat (paper). A card never sits inside another card. A border or a different background is only earned when it communicates selection, state, or a real grouping.
3. **Lowercase, sentence case, no ceremony.** No ALL CAPS labels or eyebrows above titles. Titles state what happened, not the component's genre ("your product is live", not "publication status").
4. **Never use an em dash (—).** Separate ideas with a period or a comma instead.
5. **One primary action per screen.** If two buttons both look important, one of them isn't.
6. **The price is always the largest element on screen.** It's what people came to find out.
7. **Nothing decorative.** No gradients, no glow, no stock illustration, no icons sitting in a colored tile. If something doesn't carry information, cut it.

## Palette

One accent (green), one warm neutral base. No extra colors without a functional reason (success/warning is the only exception).

```css
:root {
  /* brand */
  --color-accent: #22C55E;       /* pasto green — actions, price, positive states */
  --color-accent-deep: #15803D;  /* secondary green — text on accent, solid buttons */

  /* base */
  --color-ink: #14231A;          /* primary text */
  --color-paper: #F6F4EC;        /* background */
  --color-paper-2: #EFEBDD;      /* secondary surface, the only "card" allowed */
  --color-muted: #6B7566;        /* secondary text, metadata */
  --color-line: rgba(20, 35, 26, 0.12); /* borders, always subtle */

  /* state, used sparingly */
  --color-warning: #C6674B;      /* scam alerts, floor price */
}
```

Usage rule: `--color-accent` for anything the user can act on or that's happening right now (published, price). `--color-accent-deep` for text on light surfaces and solid buttons. Everything else lives in `ink`, `muted`, and `paper`.

## Typography

**Outfit** for headings, price, and any important number. **Plus Jakarta Sans** for everything else: paragraphs, labels, inputs, the agent's chat.

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
--font-display: 'Outfit', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;
```

Size scale, no invented in-between values:

| role | font | size | weight |
|---|---|---|---|
| featured price | outfit | 40–56px | 600 |
| page title | outfit | 28–34px | 600 |
| section title | outfit | 18–20px | 600 |
| body | plus jakarta | 15–16px | 400 |
| label / metadata | plus jakarta | 13px | 500 |

Equivalent peers (two prices, two product titles) always share size and weight, even if one string is shorter than the other.

## Spacing

8px scale. Don't use one-off values outside this list.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

Usage: `space-2` to `space-4` inside a group (label → value). `space-6` to `space-8` between groups. `space-12` to `space-16` only between large page sections, never as the default stacking gap.

## Components

- **Primary button:** `--color-accent-deep` background, white text, `border-radius: 10px`, no shadow.
- **Status tag** (e.g. "published"): same `--color-accent-deep` background, white text, `border-radius: 999px`, `padding: 5px 12px`.
- **Two CTAs, one primary.** A product page always shows "hablar con el dueño" (WhatsApp) and "hablar con [agent name]" (chat) side by side. The agent is the product's front door, so it gets the primary treatment: `--color-accent-deep` solid. WhatsApp is secondary: `1px solid var(--color-line)`, transparent background, `--color-ink` text. Never render both as solid buttons.
- **Agent chat bubble:** the agent's messages sit on `--color-paper-2` (the one allowed secondary surface), the buyer's messages sit on plain `--color-paper` with just a border. No avatars, no colored chat "tiles", the mascot only appears once, at the top of the chat.
- **Borders:** `1px solid var(--color-line)`. Never use a shadow to fake depth.
- **Radius:** 10px for buttons and inputs, 16–20px for large surfaces (product cards, modals). Don't mix more than two radius values on one screen.

## Logo

- Icon: four rounded squares in a checkerboard, `--color-accent` and `--color-accent-deep`.
- Wordmark: always lowercase, outfit 600. The trailing dot from the previous brand direction is optional, not part of the name anymore.
- Minimum legible size: 18px. Below that, use the icon alone without the inner detail.

## Voice and tone

**The product's copy stays in Rioplatense Spanish.** These rules are about tone, not translation, when an agent generates UI copy, error states, or the sales agent's replies.

| do | don't |
|---|---|
| "listo, ya está publicado" | "¡bienvenido a tu nueva plataforma!" |
| "te llegó un comprador en serio" | "optimizá tus ventas con IA" |
| "¿cuánto pedís por esto?" | "asistente virtual inteligente" |
| "eso no lo sé, le pregunto al dueño" | "solución integral de e-commerce" |

Short sentences, active verbs, zero corporate language. A button that says "publicar" is followed by a message that says "publicado", never "¡tu producto fue enviado exitosamente!".

## For agents working on this repo

- For what the product is and who it's for, read `.claude/CONTEXT.md` first. For how the shop agent is allowed to negotiate, escalate, and detect scams, read `.claude/RULES.md`.
- Read this file before writing any UI code, component, or copy.
- Keep this file itself in `.agents/` or `.claude/`, not in the project root, per the repo's convention for agent config.
- If a design decision isn't covered here, default to the principles section (typography over boxes, one surface, one primary action) rather than inventing a new pattern.
