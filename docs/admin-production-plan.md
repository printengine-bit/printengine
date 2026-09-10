# PrintEngine administration: production plan

## Current position

The admin has authenticated routes and working database mutations for products, stock, orders, discounts, artwork, content and settings. It is an operations prototype, not yet a complete commerce back office. The main gaps are depth, exception handling, bulk workflows, permissions and reporting.

## Delivery sequence

### 1. Catalogue and inventory foundation — substantially complete

- [x] Full product editor for identity, copy, merchandising, audience, decoration methods and publishing state.
- [x] Variant editor for SKU, colour, size, optional override price, stock threshold and availability.
- [x] Reserved and sellable stock visibility, searchable inventory and movement history.
- [x] Storefront cover upload wired through Cloudinary and database catalogue rendering.
- [ ] Multi-angle media ordering and studio-view validation.
- Bulk CSV import/export, stock counts and safe product archiving.

### 2. Order operations and fulfilment — core workflows complete

- [x] Searchable, paginated queues for unpaid, production-ready, shipment-failed, shipped and return orders.
- [x] Order detail actions with state-machine enforcement and complete order-event history.
- [x] Internal notes and production specifications.
- [x] Idempotent Razorpay refund ledger, unpaid cancellation and explicit returned-stock recovery.
- [ ] Tags, packing slips, invoices and consolidated print-ready artwork bundles.
- Shiprocket booking, labels, pickup, tracking sync, NDR and return handling with retry queues.

### 3. Customers, promotions and merchandising — core workflows complete

- [x] Customer detail with addresses, order history, lifetime value and support notes.
- [x] Discount editing, scheduling and usage limits.
- [ ] Product/category discount scope and redemption-level history.
- Homepage/navigation/content management with draft, preview and publishing controls.
- Artwork review notes, versioning, assignment and production-ready approval locks.

### 4. Access, reporting and reliability — in progress

- [x] Staff/admin access management with self-lockout and last-admin protection.
- [x] Sales and product reporting with orders CSV export.
- [x] Searchable audit details.
- [ ] Granular permission policies, session revocation and optional MFA.
- Database backups, alerting, job retries, integration health, error monitoring and restore drills.
- End-to-end tests for catalogue-to-checkout-to-refund and fulfilment exceptions.

## Release gate

Production readiness requires passing payment and refund reconciliation, stock concurrency, shipping failure recovery, role access, backup restore, mobile admin and end-to-end checkout tests. No module is considered complete merely because its page renders.
