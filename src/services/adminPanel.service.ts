import api from './apiService'
import { API_ENDPOINTS } from './api.endpoints'

export type UserPayload = {
  firstName: string
  lastName: string
  userName: string
  email: string
  password?: string
  mobile?: string
  role?: 'USER' | 'ADMIN' | 'SALES_AGENT'
  isBlocked?: boolean
  isVerified?: boolean
}

export type BookingPayload = {
  startDate: string
  endDate: string
  packageId: string
  travellers: number
  totalAmount: number
  paymentStatus?: string
  status?: string
  note?: string
}

export const listUsers = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.users.root, { params })

export const createUser = (payload: UserPayload) =>
  api.post(API_ENDPOINTS.auth.register, payload)

export const updateUserById = async (id: string, payload: Partial<UserPayload>) => {
  return api.patch(API_ENDPOINTS.users.byId(id), payload)
}

export const deleteUserById = async (_id: string) => {
  return api.delete(API_ENDPOINTS.users.byId(_id))
}

export const listBookings = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.bookings.root, { params })

export const getBookingById = (id: string) =>
  api.get(API_ENDPOINTS.bookings.byId(id))

export const createBooking = (payload: FormData) => api.post(API_ENDPOINTS.bookings.root, payload)

export const updateBookingById = (id: string, payload: FormData) =>
  api.put(API_ENDPOINTS.bookings.byId(id), payload)

export const updateBookingStatusById = (id: string, payload: Record<string, unknown>) =>
  api.patch(API_ENDPOINTS.bookings.status(id), payload)

export const deleteBookingById = async (id: string) => {
  try {
    return await api.delete(API_ENDPOINTS.bookings.byId(id))
  } catch {
    return api.patch(API_ENDPOINTS.bookings.status(id), { status: 'REJECTED' })
  }
}

export const listPackages = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.packages.root, { params })

export const createPackageByForm = (formData: FormData) =>
  api.post(API_ENDPOINTS.packages.root, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updatePackageByForm = (id: string, formData: FormData) =>
  api.put(API_ENDPOINTS.packages.byId(id), formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deletePackageById = (id: string) => api.delete(API_ENDPOINTS.packages.byId(id))

export const fetchAdminAnalytics = (days = 30) =>
  api.get(API_ENDPOINTS.dashboard.root, { params: { days, recentLimit: 12, topLimit: 10 } })

export const listBlogs = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.blogs.root, { params })

export const getBlogById = (id: string) =>
  api.get(API_ENDPOINTS.blogs.byId(id))

export const createBlog = (payload: FormData) =>
  api.post(API_ENDPOINTS.blogs.root, payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateBlog = (id: string, payload: FormData) =>
  api.put(API_ENDPOINTS.blogs.byId(id), payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteBlog = (id: string) =>
  api.delete(API_ENDPOINTS.blogs.byId(id))

export const listBanners = () => api.get(API_ENDPOINTS.banners.root)

export const getBannerById = (id: string) =>
  api.get(API_ENDPOINTS.banners.byId(id))

export const createBanner = (payload: FormData) =>
  api.post(API_ENDPOINTS.banners.root, payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateBanner = (id: string, payload: FormData) =>
  api.put(API_ENDPOINTS.banners.byId(id), payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteBanner = (id: string) =>
  api.delete(API_ENDPOINTS.banners.byId(id))

export const listDiscounts = () => api.get(API_ENDPOINTS.discounts.root)

export const getDiscountRuleById = (id: string) =>
  api.get(API_ENDPOINTS.discounts.byId(id))

export const createDiscountRule = (payload: Record<string, unknown>) =>
  api.post(API_ENDPOINTS.discounts.root, payload)

export const updateDiscountRule = (id: string, payload: Record<string, unknown>) =>
  api.put(API_ENDPOINTS.discounts.byId(id), payload)

export const deleteDiscountRule = (id: string) =>
  api.delete(API_ENDPOINTS.discounts.byId(id))

export const listSupportTickets = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.support.all, { params })

export const getSupportTicketById = (id: string) =>
  api.get(API_ENDPOINTS.support.byId(id))

export const updateSupportTicket = (id: string, payload: Record<string, unknown>) =>
  api.patch(API_ENDPOINTS.support.byId(id), payload)

export const deleteSupportTicket = (id: string) =>
  api.delete(API_ENDPOINTS.support.byId(id))

export const listNotifications = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.notifications.my, { params })

export const markNotificationRead = (id: string) =>
  api.patch(API_ENDPOINTS.notifications.markRead(id))

export const markAllNotificationsRead = () =>
  api.patch(API_ENDPOINTS.notifications.markAllRead)

export const listPackageReviews = (packageId: string, params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.reviews.byPackage(packageId), { params })

export const getReviewById = (id: string) =>
  api.get(API_ENDPOINTS.reviews.byId(id))

export const upsertReview = (payload: Record<string, unknown>) =>
  api.post(API_ENDPOINTS.reviews.root, payload)

export const removeReview = (id: string) =>
  api.delete(API_ENDPOINTS.reviews.byId(id))

export const listChatbotFaqs = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.chatbot.faq, { params })

export const getChatbotFaqById = (id: string) =>
  api.get(API_ENDPOINTS.chatbot.faqById(id))

export const createChatbotFaq = (payload: Record<string, unknown>) =>
  api.post(API_ENDPOINTS.chatbot.faq, payload)

export const updateChatbotFaq = (id: string, payload: Record<string, unknown>) =>
  api.patch(API_ENDPOINTS.chatbot.faqById(id), payload)

export const deleteChatbotFaq = (id: string) =>
  api.delete(API_ENDPOINTS.chatbot.faqById(id))

export const listPolicies = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.policy.root, { params })

export const getPolicyById = (id: string) =>
  api.get(API_ENDPOINTS.policy.byId(id))

export const createPolicy = (payload: FormData) =>
  api.post(API_ENDPOINTS.policy.root, payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updatePolicy = (id: string, payload: FormData) =>
  api.put(API_ENDPOINTS.policy.byId(id), payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deletePolicy = (id: string) =>
  api.delete(API_ENDPOINTS.policy.byId(id))

export const listFooters = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.footer.root, { params })

export const getFooterById = (id: string) =>
  api.get(API_ENDPOINTS.footer.byId(id))

export const createFooter = (payload: FormData) =>
  api.post(API_ENDPOINTS.footer.root, payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateFooter = (id: string, payload: FormData) =>
  api.put(API_ENDPOINTS.footer.byId(id), payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteFooter = (id: string) =>
  api.delete(API_ENDPOINTS.footer.byId(id))

export const listAboutUs = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.aboutUs.all, { params })

export const getAboutUsById = (id: string) =>
  api.get(API_ENDPOINTS.aboutUs.byId(id))

export const createAboutUs = (payload: FormData) =>
  api.post(API_ENDPOINTS.aboutUs.root, payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateAboutUs = (id: string, payload: FormData) =>
  api.put(API_ENDPOINTS.aboutUs.byId(id), payload, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteAboutUs = (id: string) =>
  api.delete(API_ENDPOINTS.aboutUs.byId(id))

export const listCustomRequests = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.customRequests.root, { params })

export const getCustomRequestById = (id: string) =>
  api.get(API_ENDPOINTS.customRequests.byId(id))

export const updateCustomRequest = (id: string, payload: Record<string, unknown>) =>
  api.put(API_ENDPOINTS.customRequests.byId(id), payload)

export const listFeedbackByPackage = (packageId: string, params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.feedback.byPackage(packageId), { params })

export const deleteFeedbackById = (id: string) =>
  api.delete(API_ENDPOINTS.feedback.byId(id))

export const listErrorLogs = (params?: Record<string, unknown>) =>
  api.get(API_ENDPOINTS.errorLogs.root, { params })

export const getErrorLogById = (id: string) =>
  api.get(API_ENDPOINTS.errorLogs.byId(id))

export const deleteErrorLogById = (id: string) =>
  api.delete(API_ENDPOINTS.errorLogs.byId(id))

export const fetchAdminSettings = async () => {
  const [footer, policy] = await Promise.allSettled([
    api.get(API_ENDPOINTS.footer.root),
    api.get(API_ENDPOINTS.policy.root),
  ])

  return {
    footer: footer.status === 'fulfilled' ? footer.value.data?.data || footer.value.data : null,
    policy: policy.status === 'fulfilled' ? policy.value.data?.data || policy.value.data : null,
  }
}
