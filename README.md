# Modern React E-Commerce integrated with ERPNext Retail

This repository holds a high-performance, enterprise-ready B2C e-commerce platform built with React 19, TypeScript, Zustand, and Tailwind CSS. The application integrates with ERPNext to fetch Item lists, check live inventory warehouse balances, fetch promotional pricing rules, and create Sales Orders.

## Features

- **Marketplace Home Page**: Banners, category carousels, and live Flash Deals.
- **Product Catalog**: Sort items, sidebar filtering (availability, brand, price, rating), and instant search.
- **Dynamic Product Details**: Subresource image gallery, complete technical specs, and live warehouse inventory checks.
- **Zustand State Stores**: Independent client stores for Shopping Cart, Wishlists, Authentications, and Settings configs.
- **ERPNext API Service Layer**: Standard REST API hooks for syncing with Frappe/ERPNext schemas.
- **Admin Configuration Panel**: Toggle sandbox mode or plug in active ERPNext Server URLs, API Keys, and secrets.
- **Responsive Layout**: Mobile-first design featuring bottom navigation and slide-out drawers.

---

## Folder Layout

```
/src
  /components
    /common     # Reusable buttons, inputs, loader indicators
    /layout     # Navbars, footers, mobile navigation drawer
    /product    # Card, specifications table, image gallery carousel, filters
    /checkout   # Multi-step checkout wizards, forms
    /order      # Live shipment progress timeline trackers
  /pages        # Home, Catalog, Details, Cart, Checkout, Account, Admin settings
  /services     # Axios API wrapper clients, products, inventory, order endpoints
  /store        # Zustand auth, cart, wishlist, and configurator persistence
  /types        # TypeScript types matching ERPNext and storefront schemas
```

---

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev server**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## Deployment & Running Docker

Build and run the application locally in an optimized container on port `8080`:
```bash
docker-compose up --build
```
