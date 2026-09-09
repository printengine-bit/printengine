# PrintEngine administration: production plan

## Current position

The admin has authenticated routes and working database mutations for products, stock, orders, discounts, artwork, content and settings. It is an operations prototype, not yet a complete commerce back office. The main gaps are depth, exception handling, bulk workflows, permissions and reporting.

## Delivery sequence

### 1. Catalogue and inventory foundation — in progress

- Full product editor for identity, copy, merchandising, audience, decoration methods and publishing state.
- Variant editor for SKU, colour, size, optional override price, stock threshold and availability.
- Reserved and sellable stock visibility, searchable inventory and movement history.
- Product media management, image ordering and validation against storefront rendering.
- Bulk CSV import/export, stock counts and safe product archiving.

### 2. Order operations and fulfilment

- Searchable, paginated queues for unpaid, production-ready, shipment-failed, shipped and return orders.
- Order detail actions with state-machine enforcement and complete order-event history.
- Customer notes, internal notes, tags, packing slips, invoices and print-ready artwork downloads.
- Razorpay capture/refund reconciliation and cancellation/restock workflows.
- Shiprocket booking, labels, pickup, tracking sync, NDR and return handling with retry queues.

### 3. Customers, promotions and merchandising

- Customer detail with addresses, order history, lifetime value and support notes.
- Discount editing, scheduling, limits, product/category scope and redemption history.
- Homepage/navigation/content management with draft, preview and publishing controls.
- Artwork review notes, versioning, assignment and production-ready approval locks.

### 4. Access, reporting and reliability

- Staff roles and granular permissions with session revocation and optional MFA.
- Sales, product, inventory, tax, discount and fulfilment reports with CSV exports.
- Audit filters, before/after values and retention policy.
- Database backups, alerting, job retries, integration health, error monitoring and restore drills.
- End-to-end tests for catalogue-to-checkout-to-refund and fulfilment exceptions.

## Release gate

Production readiness requires passing payment and refund reconciliation, stock concurrency, shipping failure recovery, role access, backup restore, mobile admin and end-to-end checkout tests. No module is considered complete merely because its page renders.
