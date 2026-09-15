---
version: 1
slug: "apps-web-src-app-onboarding"
primary_target: "apps/web/src/app/onboarding"
related_targets: ["apps/web/src/app/login"]
---

# Onboarding (login + crear tienda)

Scope: `/login` and `/onboarding`, the seller's first two screens. Mode: Operate. Audience: emprendedores and casual sellers on a phone at night, no patience for setup. Job: get from "I have a photo" to "my shop exists" in under a minute. Action: one Google sign-in, then one form (name, handle, WhatsApp). Constraints: Rioplatense Spanish, lowercase copy, `.claude/DESIGN.md` is the pinned world (paper, green, Outfit + Plus Jakarta), one primary action per screen, nothing decorative.

## Direction contract

THESIS: the shop URL is the product. Both screens exist to produce `tutienda/<handle>` and nothing else; it refuses the auth-card-in-the-middle template with a logo above a boxed form.

OWN-WORLD: flat paper ground, ink text, one deep-green solid button, hairline borders only on inputs. Outfit for the one heading and the URL, Plus Jakarta for everything else. No card, no illustration, no dark mode.

STORY: the visitor understands this is their own shop, not a marketplace, believes it takes a minute, and does the one thing on screen.

FIRST VIEWPORT: logo top-left. Login: heading left-aligned at 32px, one sentence of body, the green Google button full-width on mobile and 360px on desktop, one muted reassurance line under it. Onboarding: heading, name input, then the live URL line `tutienda/` + editable handle with an availability word beside it, WhatsApp input, green button at the bottom. Success replaces the form: the URL becomes the largest element at 48px.

FORM: code-led, single column, max width 440px, left-aligned on desktop, first on the list. Seed key: none (no comp).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
