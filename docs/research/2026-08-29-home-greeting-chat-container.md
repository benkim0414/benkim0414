# Messenger-style container for the home greeting

## Recommendation

Wrap the existing `ChatMessageList` in one Astryx **default `Card`** with
`padding={0}`. Treat it as a bounded, self-contained welcome widget, rather
than as a chat application. Keep the existing `balanced` message density and
message-arrival animation. Add the standard Astryx chat identity treatment:
an assistant avatar and a sender name on the first bubble.

This gives the greeting a recognisable Messenger-like conversation surface
(background, token border, container radius, and clipped content) without
inventing custom chat chrome or implying that the visitor can type a reply.
`padding={0}` matters: `ChatMessageList` already supplies density-aware
spacing, so a default-card padding would make the transcript look doubly
inset. This is a product-design inference from the components' documented
responsibilities.

Use only one card. The site guidance permits cards for genuinely framed,
self-contained widgets but rejects card-on-card layouts.

## Patterns considered

| Pattern | What it is | Advantages | Trade-offs | Verdict |
| --- | --- | --- | --- | --- |
| **Contained greeting widget (recommended)** | `Card` → `ChatMessageList` → grouped `ChatMessageBubble`s; assistant avatar/name on the chat message | Reads as a single small conversation, reuses Astryx border/radius/tokens, remains responsive, and adds no false input affordance | The greeting must stay a discrete widget; do not expand it into a page-section card or nest it in another card | Best fit |
| Unframed transcript | The current `VStack` and `ChatMessageList` directly in page flow | Lightest visual weight; the log and bubble semantics already work | Does not provide the bounded application-like surface requested, so it can read as loose page copy | Valid only if the page feels visually crowded after the card is added |
| Embedded full chat | `ChatLayout` with `ChatMessageList` and `ChatComposer` | The complete conversation experience: scrolling, docked composer, and scroll-to-bottom support | Astryx defines it as a full chat shell and requires a composer; its owned scroll context and frosted dock are disproportionate for three static onboarding messages and imply that visitors can reply | Reject |
| Narrow panel chat | The `ChatLayoutPanelChat` recipe | A convincing compact/inbox treatment for a real embedded chat | Designed for a constrained side panel/drawer and still entails composer and scroll behaviour; it competes with the home page instead of introducing it | Reject |

## Accessibility and motion constraints

- Keep `ChatMessageList` as the sole announcement region. Astryx renders it as
  a focusable `role="log"` with polite live updates; W3C specifically identifies
  that role as appropriate for chat messages appended in sequence. Do not add a
  second live region to the Card. [W3C ARIA23](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23)
- Retain the existing `prefers-reduced-motion` path, which renders the complete
  greeting without arrival movement. W3C recommends respecting that preference
  for non-essential motion. [W3C Technique C39](https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html)
- Do not set `isStreaming` unless text is genuinely being streamed. The
  arrival animation is a short welcome sequence, not token generation.
- Keep the real destination links as semantic Astryx links inside the Markdown
  list; the container must not turn the entire greeting into a click target.

## Proposed implementation boundary

Change only `HomeGreeting` and its focused story/tests:

1. Import Astryx `Card` and `Avatar`.
2. Place the present `ChatMessageList` inside one `Card` (`variant="default"`,
   `padding={0}`); do not introduce custom CSS or a fixed height.
3. Give the existing assistant `ChatMessage` an `Avatar` and first bubble a
   `name`, following Astryx's multi-bubble chat recipe.
4. Preserve browser-session behaviour, links, reduced motion, list semantics,
   and the home-page placement.

Out of scope: a composer, message persistence, a scrollable inbox, typing
indicators, delivery status, a dismiss control, and a second container around
the card.

## Primary sources consulted

- Astryx CLI: `pnpm exec astryx build "A compact messenger-style container for a short home-page greeting built from grouped chat messages" --dense` (recommended the `ai-chat` and `ai-chat-landing` references).
- Astryx CLI: `pnpm exec astryx component Card --dense`, `ChatMessageList --dense`, `ChatMessageBubble --dense`, and `ChatLayout --dense` (run on 2026-08-29).
- [Astryx Card source](../../node_modules/@astryxdesign/core/src/Card/Card.tsx) — tokenised card surface, border/radius, and clipped content.
- [Astryx ChatMessageList source](../../node_modules/@astryxdesign/core/src/Chat/ChatMessageList.tsx) — log semantics, polite announcements, density context, and streaming state.
- [Astryx ChatLayout source](../../node_modules/@astryxdesign/core/src/Chat/ChatLayout.tsx) — full-chat layout with a required composer and owned scroll behaviour.
- [Astryx ChatMessage source](../../node_modules/@astryxdesign/core/src/Chat/ChatMessage.tsx) — sender identity, avatar, and metadata reference.
- [App UI rules](../../apps/github.io/AGENTS.md) — Astryx-first UI and the permitted uses of Card.
- [W3C: ARIA23, sequential log updates](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23).
- [W3C: C39, reduced motion](https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html).
