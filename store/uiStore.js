'use client'

import { create } from 'zustand'

/**
 * Transient UI state shared by the header, drawer and cart layer. These booleans
 * flip frequently and are intentionally not persisted: closing the tab resets
 * every panel, which is what the previous per-component `useState` did too.
 */
export const useUIStore = create((set) => ({
  cartDrawerOpen: false,
  mobileNavOpen: false,
  megaMenuOpen: false,

  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ cartDrawerOpen: !state.cartDrawerOpen })),

  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

  openMegaMenu: () => set({ megaMenuOpen: true }),
  closeMegaMenu: () => set({ megaMenuOpen: false }),
  toggleMegaMenu: () => set((state) => ({ megaMenuOpen: !state.megaMenuOpen })),
}))