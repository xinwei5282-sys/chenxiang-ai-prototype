# External Adoption Mini Program Design

**Date:** 2026-09-01  
**Status:** User-approved direction A; awaiting written-spec review  
**Scope:** Agarwood adoption entry and removal of the internal adoption archive

## Goal

Make `认种沉香树` an external Mini Program destination instead of an internal archive experience. The Guangken prototype owns only the entry and jump feedback; adoption products, records, certificates, growth timelines, and transactions belong to the external Mini Program.

## Confirmed information architecture

- Keep one `认种沉香树` service entry on the homepage.
- Clicking that entry must not push a `FlowStack` page in this prototype.
- Remove the adopted-tree item from `我的藏品`; the collection displays the bracelet only.
- Remove the internal `认种档案` page, growth timeline, adoption certificate download, `前往认种` action, and their page-specific PRD context.
- Do not replace the removed archive with an explainer, bridge page, product list, fake order flow, or another internal destination.

## Interaction

### Prototype behavior

Clicking `认种沉香树` keeps the user on the homepage and immediately shows the phone-scoped status message:

```text
正在打开认种沉香小程序…
```

The current H5 prototype does not pretend that a real WeChat cross-Mini-Program navigation occurred. The current flow screen remains `home`, so reviewers can verify that no internal archive opens.

### Production behavior

The native Mini Program implementation uses `wx.navigateToMiniProgram` with a configured target AppID, route, environment version, and optional `extraData`. The target identity remains deployment configuration and must not be hardcoded into the H5 requirements prototype.

On native jump failure, keep the user on the homepage and show a retryable failure message. Do not fall back to the removed internal archive.

## Homepage collection simplification

After the tree item is removed, `我的藏品` contains one bracelet record. Preserve the current bracelet card content and its bracelet archive/electronic-certificate actions. Remove tree-only switching, pagination state, tree labels, and tree certificate behavior while retaining the collection section's existing layout quality.

## Page PRD changes

- Homepage PRD: describe `认种沉香树` as an external Mini Program jump and exclude adoption transactions from the current product boundary.
- Collection/archive PRD: describe only the bracelet record and bracelet electronic certificate.
- Remove the `P-14 认种档案` product-document mapping and reduce the browser review footer context count accordingly.
- Remove requirements that promise an internal adoption archive, growth timeline, or adoption certificate.

## State and error handling

- Ready → user taps `认种沉香树` → prototype shows opening status while remaining on `home`.
- Native ready → call `wx.navigateToMiniProgram` → external Mini Program opens.
- Native failure → remain on `home` → show `暂时无法打开认种沉香小程序，请重试`.
- Missing target configuration is a release-blocking integration error, not a reason to restore an internal archive.

## Acceptance criteria

1. Homepage still shows exactly one `认种沉香树` service entry.
2. Clicking it does not create an internal flow screen or show `认种档案`.
3. The prototype shows `正在打开认种沉香小程序…` and remains on `home`.
4. `我的藏品` contains no adopted-tree card, tree pagination, growth timeline, adoption certificate, or `前往认种` action.
5. Browser-level page PRD contains no `P-14 认种档案` context and accurately states the external jump boundary.
6. Existing bracelet archive, certificate detail, care, knowledge, AI question, profile, and mobile-runtime behaviors continue to pass regression tests.

## Out of scope

- Target Mini Program UI or implementation
- Adoption products, checkout, payment, orders, growth records, or tree certificates
- Real `wx.navigateToMiniProgram` execution inside the browser prototype
- Target AppID, target route, and environment configuration values
