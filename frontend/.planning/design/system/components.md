# Orbit Store — Component Inventory

## App shell

| Component | Status | File |
|-----------|--------|------|
| Navigation (nav + links) | ✅ Built | `src/components/Nav.jsx` |
| Brand/logo link | ✅ Built | `src/components/Nav.jsx` |
| Layout container | ✅ Built | `src/App.jsx` (`.container`) |
| Loading states | 🟡 Basic | Inline "Loading..." text |
| Empty states | 🟡 Basic | `No products yet.`, `Cart is empty.`, `No orders yet.` |

## Product browsing

| Component | Status | File |
|-----------|--------|------|
| Product grid | ✅ Built | `src/pages/Products.jsx` |
| Product card | ✅ Built | `src/pages/Products.jsx` (`.product-card`) |
| Product image | ✅ Built | `.product-card img` |
| Product detail | ✅ Built | `src/pages/ProductDetail.jsx` |
| Price display | ✅ Built | `.price` |

## Cart & checkout

| Component | Status | File |
|-----------|--------|------|
| Cart list | ✅ Built | `src/pages/Cart.jsx` |
| Cart item row | ✅ Built | `.cart-list li` |
| Quantity input | ✅ Built | `input[type=number]` |
| Cart summary | ✅ Built | `.cart-summary` |
| Checkout form | ✅ Built | `src/pages/Checkout.jsx` |
| Checkout callback | ✅ Built | `src/pages/CheckoutCallback.jsx` |

## Auth

| Component | Status | File |
|-----------|--------|------|
| Login form | ✅ Built | `src/pages/Login.jsx` |
| Register form | ✅ Built | `src/pages/Register.jsx` |
| OAuth callback | ✅ Built | `src/pages/OAuthCallback.jsx` |
| Profile form | ✅ Built | `src/pages/Profile.jsx` |
| Avatar upload | ✅ Built | `src/pages/Profile.jsx` |

## Orders

| Component | Status | File |
|-----------|--------|------|
| Order list | ✅ Built | `src/pages/Orders.jsx` |
| Order card/row | ✅ Built | `.order-list li` |
| Status badge | ✅ Built | `.status` + modifiers |

## Admin

| Component | Status | File |
|-----------|--------|------|
| Product admin form | ✅ Built | `src/pages/admin/AdminProducts.jsx` |
| Product image upload | ✅ Built | `input[type=file]` |
| Admin product list | ✅ Built | `.admin-product-list li` |
| Users table | ✅ Built | `src/pages/admin/AdminUsers.jsx` |
| Dialog/modal | ✅ Built | `dialog` element in Profile |

## Shared primitives

| Component | Status | Notes |
|-----------|--------|-------|
| Buttons (primary) | ✅ Built | `button`, accent bg |
| Buttons (secondary) | ✅ Built | `.dialog-actions button[type=button]` |
| Buttons (link-style) | ✅ Built | `.link-button` |
| Text inputs | ✅ Built | `input`, `textarea`, `select` |
| Forms | ✅ Built | Generic `form` layout |
| Error/success messages | ✅ Built | `.error`, `.success` |
| Dividers | ✅ Built | `.divider` |

## Missing (nice-to-have improvements)

| Component | Priority | Why |
|-----------|----------|-----|
| Skeleton loading placeholders | Medium | Replace "Loading..." text with pulse placeholders |
| Toast notifications | Medium | Visual feedback instead of inline text for add-to-cart |
| Confirmation dialog for delete | Low | Delete is instant with no "are you sure?" |
| Pagination (product list) | Low | No pagination if product list grows |
| Search/filter bar | Low | No search or category filtering on products page