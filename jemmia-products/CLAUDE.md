# jemmia-products — notes for Claude

An internal catalogue for staff: jewelry, wedding rings, combos and diamonds. It's a React 19 +
Vite + React Query app. All data comes from the Salesaya backend (`salesaya/backend-v2`,
`/site/products/*`, base URL in `src/config.ts`).

## Render, never derive

The Salesaya Chrome extension reads the same backend. Staff compare the two side by side, so
both must say the same thing about the same piece.

- This app displays server fields as-is. **Never compute stock in the browser:** no sums of
  `quantity`, no warehouse-name matching, no fallbacks that guess.
  - Product badge: `stockStatus`.
  - Per-SKU "Khả dụng" and the serial counts: `skuStock` (after #94).
  - Each serial: `serialState`, `lastCountedAt` and `locationMismatch`.
- Statuses and their Vietnamese labels are defined once:
  - `src/types.ts` (`STOCK_STATUS`, `STOCK_LABELS`): products and diamonds.
  - `src/components/jewelry/JewelryTable/utils/serialState.ts`: serials.

  Reuse these. Don't add new strings inline.
- **The server scopes serials** to the selected warehouses and ignores the warehouse filter
  during search. Don't filter serials again on the client.
- If a number looks wrong, the fix is almost never here. Trace it first through
  `salesaya/backend-v2/src/product/stock/` (read its `CLAUDE.md`), then `data-platform`
  (dbt marts, Haravan ingestion), then `fn` (cron jobs).

## Domain facts that look like bugs but aren't

- **"Kho khác" (OFF_RETAIL)** is real stock held outside retail: borrowed, reserved,
  warranty, appraisal, workshop or transit. It isn't "in transit" and it isn't sold.
- **Badges are retail-only and pessimistic.** Stock that is only in non-retail locations
  shows "Chưa có sẵn".
- **A combo's jewelry badge** describes the specific serial in the combo, not the product.
- **Diamonds with no price** in Haravan never appear in listings or search.

## Verifying

- `npx tsc --noEmit -p .` must stay at 0 errors, and `npx vite build` must pass.
- For stock behaviour, verify against live data through the backend (see the stock module's
  `CLAUDE.md`), not by eyeballing the UI.

## Repo gotchas

- The git root is the `sites` monorepo (`jemmia-diamond/sites`). This app is one folder in it.
- Some tokens can pull from but not open PRs on `sites`. If `gh pr create` fails, give the
  user a compare link.
