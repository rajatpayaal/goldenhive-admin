import api from './apiService'
import { API_ENDPOINTS } from './api.endpoints'

export const fetchDashboard = (params?: { days?: number; recentLimit?: number; topLimit?: number }) =>
  api.get(API_ENDPOINTS.dashboard.root, { params })

export const fetchPackages = (params?: Record<string, unknown>) => api.get(API_ENDPOINTS.packages.root, { params })
export const fetchPackageById = (id: string) => api.get(API_ENDPOINTS.packages.byId(id))
export const createPackage = (data: FormData) =>
  api.post(API_ENDPOINTS.packages.root, data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updatePackage = (id: string, data: FormData) =>
  api.put(API_ENDPOINTS.packages.byId(id), data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deletePackage = (id: string) => api.delete(API_ENDPOINTS.packages.byId(id))
export const patchPackageStatus = (id: string) => api.patch(API_ENDPOINTS.packages.status(id))

export const fetchPackagePricing = (params?: Record<string, unknown>) => api.get(API_ENDPOINTS.packagePricing.root, { params })
export const createPackagePricing = (data: object) => api.post(API_ENDPOINTS.packagePricing.root, data)
export const updatePackagePricing = (id: string, data: object) => api.put(API_ENDPOINTS.packagePricing.byId(id), data)
export const deletePackagePricing = (id: string) => api.delete(API_ENDPOINTS.packagePricing.byId(id))

export const fetchCategories = () => api.get(API_ENDPOINTS.categories.root)
export const fetchCategoryById = (id: string) => api.get(API_ENDPOINTS.categories.byId(id))
export const createCategory = (data: object) => api.post(API_ENDPOINTS.categories.root, data)
export const updateCategory = (id: string, data: object) => api.put(API_ENDPOINTS.categories.byId(id), data)
export const deleteCategory = (id: string) => api.delete(API_ENDPOINTS.categories.byId(id))

export const fetchBookings = (params?: Record<string, unknown>) => api.get(API_ENDPOINTS.bookings.root, { params })
export const fetchBookingById = (id: string) => api.get(API_ENDPOINTS.bookings.byId(id))
export const updateBookingStatus = (id: string, data: object) => api.patch(API_ENDPOINTS.bookings.status(id), data)

// Backend currently exposes PATCH /users/me only.
export const fetchUsers = async (params?: Record<string, unknown>) => {
  try {
    return await api.get(API_ENDPOINTS.search.root, { params: { ...(params || {}), q: '' } })
  } catch {
    return { data: { data: { items: [], totalPages: 1 } } }
  }
}
export const fetchUserById = (id: string) => api.get(API_ENDPOINTS.users.me, { params: { id } })
export const updateUser = async (_id: string, data: object) => api.patch(API_ENDPOINTS.users.me, data)

export const fetchReviews = async (params?: { packageId?: string; page?: number; limit?: number }) => {
  if (params?.packageId) {
    return api.get(API_ENDPOINTS.reviews.byPackage(params.packageId), {
      params: { page: params.page, limit: params.limit },
    })
  }
  return { data: { data: { items: [], totalPages: 1 } } }
}
export const deleteReview = (id: string) => api.delete(API_ENDPOINTS.reviews.byId(id))

export const fetchFaqs = () => api.get(API_ENDPOINTS.faqs.root)
export const createFaq = (data: object) => api.post(API_ENDPOINTS.faqs.root, data)
export const updateFaq = (id: string, data: object) => api.put(API_ENDPOINTS.faqs.byId(id), data)
export const deleteFaq = (id: string) => api.delete(API_ENDPOINTS.faqs.byId(id))

export const fetchNotifications = (params?: Record<string, unknown>) => api.get(API_ENDPOINTS.notifications.my, { params })
export const markNotiRead = (id: string) => api.patch(API_ENDPOINTS.notifications.markRead(id))
export const markAllNotiRead = () => api.patch(API_ENDPOINTS.notifications.markAllRead)

export const loginAdmin = (email: string, password: string) =>
  api.post(API_ENDPOINTS.auth.adminLogin, { email, password })

export const fetchCountries = () => api.get(API_ENDPOINTS.countries.root)
export const createCountry = (data: object) => api.post(API_ENDPOINTS.countries.root, data)
export const updateCountry = (id: string, data: object) => api.put(API_ENDPOINTS.countries.byId(id), data)
export const deleteCountry = (id: string) => api.delete(API_ENDPOINTS.countries.byId(id))

export const fetchStates = (countryId?: string) => api.get(API_ENDPOINTS.states.root, { params: { countryId } })
export const createState = (data: object) => api.post(API_ENDPOINTS.states.root, data)
export const updateState = (id: string, data: object) => api.put(API_ENDPOINTS.states.byId(id), data)
export const deleteState = (id: string) => api.delete(API_ENDPOINTS.states.byId(id))

export const fetchCities = (stateId?: string) => api.get(API_ENDPOINTS.cities.root, { params: { stateId } })
export const createCity = (data: object) => api.post(API_ENDPOINTS.cities.root, data)
export const updateCity = (id: string, data: object) => api.put(API_ENDPOINTS.cities.byId(id), data)
export const deleteCity = (id: string) => api.delete(API_ENDPOINTS.cities.byId(id))

export const fetchDiscounts = () => api.get(API_ENDPOINTS.discounts.root)
export const createDiscount = (data: object) => api.post(API_ENDPOINTS.discounts.root, data)
export const updateDiscount = (id: string, data: object) => api.put(API_ENDPOINTS.discounts.byId(id), data)
export const fetchVehicles = () => api.get(API_ENDPOINTS.vehicles.root)
export const createVehicle = (data: FormData) =>
  api.post(API_ENDPOINTS.vehicles.root, data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateVehicle = (id: string, data: FormData) =>
  api.put(API_ENDPOINTS.vehicles.byId(id), data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteVehicle = (id: string) => api.delete(API_ENDPOINTS.vehicles.byId(id))
