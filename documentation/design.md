# Design system

Short guide to keep the app visually consistent during the hackathon. Based on the identity already locked in (green, Outfit and Plus Jakarta Sans) plus a few restraint and typographic-hierarchy principles borrowed from Vercel's design guide.

Related: [context.md](./context.md) for what the product is, [rules.md](./rules.md) for how the shop agent is allowed to behave. Read this file before writing any UI code, component, or copy.

## Principles

Borrowed from Vercel: the ideas that are useful here, not the cold aesthetic.

1. **Typography creates hierarchy, not boxes.** Before adding a border or a background to something, try a size or weight change first.
2. **One surface per screen.** The background is flat (paper). A card never sits inside another card. A border or a different background is only earned when it communicates selection, state, or a real grouping.
3. **Sentence case, no ceremony.** Normal capitalization: the first letter of a sentence or label is uppercase, the rest follows Spanish rules. No ALL CAPS labels or eyebrows above titles. Titles state what happened, not the component's genre ("Tu producto ya está publicado", not "Estado de publicación").
4. **Never use an em dash (—).** Separate ideas with a period or a comma instead.
5. **One primary action per screen.** If two buttons both look important, one of them is not.
6. **The price is always the largest element on screen.** It is what people came to find out.
7. **Nothing decorative.** No gradients, no glow, no stock illustration, no icons sitting in a colored tile. If something does not carry information, cut it.

## Palette

One accent (green), one warm neutral base. No extra colors without a functional reason (success, warning, and the verified blue are the only exceptions).

```css
:root {
  --color-accent: #22c55e;
  --color-accent-deep: #15803d;

  --color-ink: #14231a;
  --color-paper: #f6f4ec;
  --color-paper-2: #efebdd;
  --color-muted: #616b5c;
  --color-line: rgba(20, 35, 26, 0.12);

  --color-warning: #c6674b;
  --color-warning-deep: #ad5236;
}
```

| token                  | role                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `--color-accent`       | grass green: actions, price, positive states                      |
| `--color-accent-deep`  | secondary green: text on accent, solid buttons                    |
| `--color-ink`          | primary text                                                      |
| `--color-paper`        | background                                                        |
| `--color-paper-2`      | secondary surface, the only "card" allowed                        |
| `--color-muted`        | secondary text, metadata (5:1 on paper)                           |
| `--color-line`         | borders, always subtle                                            |
| `--color-warning`      | scam alerts, floor price, invalid borders                         |
| `--color-warning-deep` | warning text at small sizes (4.7:1 on paper)                      |
| `--verified` (`#1d9bf0`) | the verified badge of paid shops, and nothing else              |

Usage rule: `--color-accent` for anything the user can act on or that is happening right now (published, price). `--color-accent-deep` for text on light surfaces and solid buttons. Everything else lives in `ink`, `muted`, and `paper`.

## Typography

**Outfit** for headings, price, and any important number. **Plus Jakarta Sans** for everything else: paragraphs, labels, inputs, the agent's chat.

```html
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

```css
--font-display: "Outfit", sans-serif;
--font-body: "Plus Jakarta Sans", sans-serif;
```

Size scale, no invented in-between values:

| role             | font         | size    | weight |
| ---------------- | ------------ | ------- | ------ |
| featured price   | outfit       | 40–56px | 600    |
| page title       | outfit       | 28–34px | 600    |
| section title    | outfit       | 18–20px | 600    |
| body             | plus jakarta | 15–16px | 400    |
| label / metadata | plus jakarta | 13px    | 500    |

Equivalent peers (two prices, two product titles) always share size and weight, even if one string is shorter than the other.

## Spacing

8px scale. Do not use one-off values outside this list.

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

Usage: `space-2` to `space-4` inside a group (label to value). `space-6` to `space-8` between groups. `space-12` to `space-16` only between large page sections, never as the default stacking gap.

## Components

- **Primary button:** `--color-accent-deep` background, white text, `border-radius: 10px`, no shadow.
- **Status tag** (for example "Publicado"): same `--color-accent-deep` background, white text, `border-radius: 999px`, `padding: 5px 12px`.
- **Two CTAs, one primary.** A product page always shows "Hablar con el dueño" (WhatsApp) and "Hablar con [agent name]" (chat) side by side. The agent is the product's front door, so it gets the primary treatment: `--color-accent-deep` solid. WhatsApp is secondary: `1px solid var(--color-line)`, transparent background, `--color-ink` text. Never render both as solid buttons.
- **Agent chat bubble:** the agent's messages sit on `--color-paper-2` (the one allowed secondary surface), the buyer's messages sit on plain `--color-paper` with just a border. No avatars, no colored chat tiles. The mascot only appears once, at the top of the chat.
- **Borders:** `1px solid var(--color-line)`. Never use a shadow to fake depth.
- **Radius:** 10px for buttons and inputs, 16–20px for large surfaces (product cards, modals). Do not mix more than two radius values on one screen.

## Motion

Motion is built on `motion` (`motion/react`), decided on 2026-09-16. It explains state, relationship and feedback; it never decorates. shadcn/ui keeps its own `tw-animate-css` open and close transitions for dialogs, sheets and drawers, nothing else uses `animate-in` utilities.

- **One vocabulary.** Easing is always `EASE_OUT_EXPO` (`cubic-bezier(0.16, 1, 0.3, 1)`) and durations come from `lib/motion/timing.ts`: 150ms feedback, 250ms state change, 400ms layout, 550ms entrance, 800ms photo reveal. No bounce, no elastic, no invented durations.
- **Three moves, nothing else.** `Rise` (fade plus 12px upward) for text and controls, `Develop` (blur plus slight scale settling into focus, like a photo developing) for images and the QR, `Swap` (scale crossfade) for an icon that changes state. The develop move is the product's signature: it only appears where the AI produced something to look at.
- **Choreography lives in `components/motion`.** `Stagger` orchestrates its `Rise` children at 60ms steps, `Reveal` is a standalone rise for a whole view, keyed by state so a status change animates in. Server Components compose these wrappers; feature components use `motion.*` directly when they own the state (chat bubbles, pipeline stages, catalog cards).
- **Lists appear as lists.** Catalog cards cascade at 60ms per card, capped at eight steps, and reflow with `layout="position"` when a filter changes. Chat bubbles rise from their own corner, the thinking indicator pops out of flow so the reply takes its place.
- **Operate screens stay fast.** Owner pages get one 550ms reveal, never a cascade. Persuade screens (landing, the published celebration) get the full stagger.
- **Reduced motion is honored once.** `MotionProvider` wraps the app with `reducedMotion="user"`: transforms and layout moves are dropped, opacity and color changes stay, so feedback survives. CSS keyframes keep their `motion-safe:` prefix.

## Logo

- Icon: four rounded squares in a checkerboard, `--color-accent` and `--color-accent-deep`.
- Wordmark: always lowercase (the brand name is "tulocal"), Outfit 600. The trailing dot from the previous brand direction is optional, not part of the name anymore.
- Minimum legible size: 18px. Below that, use the icon alone without the inner detail.

## Voice and tone

**Product copy stays in Rioplatense Spanish, with voseo.** These rules are about tone, not translation, and apply whenever an agent generates UI copy, error states, or the sales agent's replies.

| do                                   | don't                                |
| ------------------------------------ | ------------------------------------ |
| "Listo, ya está publicado"           | "¡Bienvenido a tu nueva plataforma!" |
| "Te llegó un comprador en serio"     | "Optimizá tus ventas con IA"         |
| "¿Cuánto pedís por esto?"            | "Asistente virtual inteligente"      |
| "Eso no lo sé, le pregunto al dueño" | "Solución integral de e-commerce"    |

Short sentences, active verbs, zero corporate language. A button that says "Publicar" is followed by a message that says "Publicado", never "¡Tu producto fue enviado exitosamente!".

## When something is not covered

Default to the principles section (typography over boxes, one surface, one primary action) rather than inventing a new pattern.
