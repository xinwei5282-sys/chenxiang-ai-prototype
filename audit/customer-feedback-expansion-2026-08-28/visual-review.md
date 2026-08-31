# Customer feedback expansion visual review

## Round 1 findings

- P1-A: home collection/bottom states allowed content to pass beneath the status bar and capsule.
- P1-B: hero retained an old identity caption and brand overlay; the image was cropped instead of preserving the supplied 941×456 composition.
- P1-C: stale high-specificity three-column service styling produced a 3+1 layout.
- P1-D: industrial park video control could overlap the iPhone home indicator.

## Round 2 fixes applied

- The home hero now paints behind the status bar and capsule at rest; after scrolling, the safe-area and navigation layers switch to fully opaque paper so content cannot bleed through.
- The supplied boy scene renders at 100% width with zero horizontal offset. A restrained vertical focal position keeps the face and bracelet visible without enlarging the image.
- The supplied Guangken logo, product title, and subtitle are live overlays on the hero.
- The reading entry overlaps the hero edge and uses the supplied ink-landscape/tower background; the duplicate cloud decoration was removed.
- Service cards are explicitly 2×2, with 72px minimum rows and contained overflow.
- Industrial park content reserves bottom safe area plus 64px.
- Capture script resets each state, waits 650ms after route actions, moves the pointer outside the phone, and captures paused/playing park states independently.

## Round 2 verification

- Captured 18 final-state screenshots across iPhone and Pixel 10 in `round-2/`.
- Verified the final top, collection, bottom, archive, park paused/playing, knowledge article, authorization, and profile states.
- No cursor artifact, status-bar content bleed, service-grid overflow, or home-indicator overlap remains in the captured states.

## Round 3 audit fixes

- Homepage visible copy now has a 12px minimum; standard body and primary control labels use 14px.
- The mall root tab exposes an “即将上线” badge before interaction and still returns the existing toast without navigation.
- Selection-card title icons were removed; the supplied four background images remain unchanged.
- The collection carousel keeps arrows, swipe and dot state while removing the numeric `1/2` label per the latest review.
- The four service entries share one row, one deep-green line-icon style, 14px titles and 12px notes.
- Knowledge rows have full-row hit areas and a visible pressed state without trailing arrows.
- The authorization sheet has a distinct secondary cancel action.
- The industrial-park detail carousel uses the official park image plus nursery, workshop and quality-control scenes with a dynamic page count.
- Footer spacing was reduced while keeping the copyright above both iPhone and Pixel fixed navigation areas.

## Round 3 verification

- Captured updated iPhone and Pixel section evidence in `round-3/` and 18 complete flow states in `round-2/`.
- Browser console errors during the focused capture: 0.
- Runtime integrity: 28 protected files passed.
- TypeScript: passed.
- Production build and Sites package preparation: passed.
- Playwright H5 suite: 51 passed.
- Sites worker suite: 4 passed.
