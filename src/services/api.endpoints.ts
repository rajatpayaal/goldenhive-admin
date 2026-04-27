export const API_BASE = '/api'

// Centralized backend route index derived from goldenhive-backend/src/routes/*
export const API_ENDPOINTS = {
  health: '/health',
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    adminLogin: '/auth/admin/login',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    sendChangePasswordOtp: '/auth/send-change-password-otp',
    changePassword: '/auth/change-password',
    me: '/auth/me',
  },
  dashboard: {
    root: '/dashboard',
  },
  users: {
    root: '/users',
    byId: (id: string) => `/users/${id}`,
    me: '/users/me',
  },
  packages: {
    root: '/packages',
    byId: (id: string) => `/packages/${id}`,
    bySlug: (slug: string) => `/packages/slug/${slug}`,
    status: (id: string) => `/packages/${id}/status`,
  },
  packageSorting: {
    root: '/package-sorting',
    byId: (id: string) => `/package-sorting/${id}`,
    order: (id: string) => `/package-sorting/${id}/order`,
    category: (categoryId: string) => `/package-sorting/category/${categoryId}`,
    miniSuggestions: '/package-sorting/mini-suggestions',
  },
  packagePricing: {
    root: '/package-pricing',
    byId: (id: string) => `/package-pricing/${id}`,
  },
  categories: {
    root: '/categories',
    byId: (id: string) => `/categories/${id}`,
  },
  bookings: {
    root: '/bookings',
    my: '/bookings/my',
    byId: (id: string) => `/bookings/${id}`,
    status: (id: string) => `/bookings/${id}/status`,
  },
  reviews: {
    root: '/reviews',
    byId: (id: string) => `/reviews/${id}`,
    byPackage: (packageId: string) => `/reviews/package/${packageId}`,
  },
  notifications: {
    my: '/notifications/my',
    unreadCount: '/notifications/unread-count',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  faqs: {
    root: '/faqs',
    byId: (id: string) => `/faqs/${id}`,
  },
  countries: {
    root: '/countries',
    byId: (id: string) => `/countries/${id}`,
  },
  states: {
    root: '/states',
    byId: (id: string) => `/states/${id}`,
  },
  cities: {
    root: '/cities',
    byId: (id: string) => `/cities/${id}`,
  },
  discounts: {
    root: '/discounts',
    byId: (id: string) => `/discounts/${id}`,
  },
  banners: {
    root: '/banners',
    active: '/banners/active',
    byId: (id: string) => `/banners/${id}`,
  },
  blogs: {
    root: '/blogs',
    byId: (id: string) => `/blogs/${id}`,
  },
  aboutUs: {
    root: '/about-us',
    all: '/about-us/all',
    byId: (id: string) => `/about-us/${id}`,
  },
  cart: {
    root: '/cart',
    my: '/cart/my',
    item: '/cart/item',
    byUserId: (userId: string) => `/cart/${userId}`,
  },
  customRequests: {
    root: '/custom-requests',
    my: '/custom-requests/my',
    byId: (id: string) => `/custom-requests/${id}`,
  },
  feedback: {
    root: '/feedback',
    byPackage: (packageId: string) => `/feedback/package/${packageId}`,
    avgByPackage: (packageId: string) => `/feedback/average/${packageId}`,
    byId: (id: string) => `/feedback/${id}`,
  },
  footer: {
    root: '/footer',
    byId: (id: string) => `/footer/${id}`,
  },
  policy: {
    root: '/policies',
    byId: (id: string) => `/policies/${id}`,
  },
  support: {
    root: '/support',
    my: '/support/my',
    all: '/support/all',
    byId: (id: string) => `/support/${id}`,
    byUserId: (userId: string) => `/support/user/${userId}`,
  },
  travelers: {
    root: '/travelers',
    byId: (id: string) => `/travelers/${id}`,
  },
  vehicles: {
    root: '/vehicles',
    byId: (id: string) => `/vehicles/${id}`,
  },
  chatbot: {
    faq: '/chatbot/faq',
    faqById: (id: string) => `/chatbot/faq/${id}`,
  },
  search: {
    root: '/search',
  },
  suggestions: {
    packages: '/suggestions/packages',
    blogs: '/suggestions/blogs',
  },
  errorLogs: {
    root: '/error-logs',
    byId: (id: string) => `/error-logs/${id}`,
  },
} as const

export type ApiEndpoints = typeof API_ENDPOINTS
