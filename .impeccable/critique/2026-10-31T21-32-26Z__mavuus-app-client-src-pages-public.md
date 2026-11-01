---
target: Mavuus public website
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 4
target_identity: "file:/Users/michaelobelchak/Downloads/Designs/Mavuus/mavuus-app/client/src/pages/public"
timestamp: 2026-10-31T21-32-26Z
slug: mavuus-app-client-src-pages-public
---
# Critique: Mavuus public website (mavuus-app/client/src/pages/public)
Method: dual-agent (A: design review, B: detector + technical audit)

Design score 20/32 (Acceptable; H7 and H10 n/a). Technical audit 10/20 (Acceptable).
Heuristics: 1=3 2=3 3=2 4=1 5=3 6=3 7=n/a 8=2 9=3 10=n/a.

## Verdict
Faithful to live but reads as two sites: Home/Services modern layer vs flat About/Membership/FAQ/Contact/Resources. 11 card treatments, 3 outline buttons, 4 eyebrow copies, 8 image radii, 3 pinks. Most sections lack entrance motion.

## Priority issues
- [P0] Logo row: height-forced logos (33-180px wide), unreadable Salesforce/Constellation/Cardinals/Pizza Pizza under grayscale, inconsistent grays, low-res PNGs, horizontally squashed at 768, orphan at 390. Fix: monochrome wordmarks in fixed boxes with per-logo optical scale, centered 4x2 grid, color on hover, small label heading.
- [P0] Services HowWeHelp cards at opacity .62 (2.1-3.0:1), sibling dimming, dead arrow. Fix: solid white rest state.
- [P1] Brand pink #F26D92 fails as text (2.75:1) and as button fill with white (2.85:1). Fix: deeper pink text/button token (~#C94070).
- [P1] No design system (cards, buttons, eyebrows, headings h1 28px vs h2 43px on Post, nested section padding 160-176px).
- [P1] No entrance motion; floats/autoplay/page transition ignore reduced motion; tabs no pause (WCAG 2.2.2).
- [P1] Tablet: header and hero CTAs wrap at 1024; orphan card, cramped featured post, half-width event, founders photo pushed down at 768.

## Technical
5.6MB home / 6.9MB resources images; 50 slides rendered with 50 backdrop blurs; off-screen slides and collapsed FAQ/sidebar focusable; mobile menu no Escape/outside close; Manrope @import unused on public; skipped heading levels; touch targets 19-37px; focus ring 2.75:1 and forces 6px radius; text 9.6-12px on mobile.
Detector: 1 side-tab finding (PostPage blockquote, false positive); overlay found low-contrast, undersized text, skipped headings, bounce easing.

## Consistency system
Cards: feature / surface / media / panel (16px radius, panel 24). Buttons: primary pink, secondary blue, outline; md + sm. One Eyebrow + Label. Heading scale display 48/40/32, page 40/32/28, section 36/30/28, card 22. Section spacing 96/72/56, no nesting. Image radius 16, hero 24. One check icon. Motion: reveal 600ms ease-out-quint with stagger, hover lift 4px 300ms, media zoom 1.04, count-up stats, marquee pause on hover, floats <=6px, full reduced-motion alternative.

## Questions
Whether to keep strict 1:1 with live or improve; whether to darken the pink; scope.
