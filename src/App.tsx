import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import PublicRoute from './utilty/PublicRoute'
import PrivateRoute from './utilty/PrivateRoute'
import Loader from './utilty/Loader'
import NotFoundPage from './utilty/NotFoundPage'
import TokenHandler from './utilty/TokenHandler'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard/index'))
const Packages = lazy(() => import('./pages/Packages'))
const AddPackage = lazy(() => import('./pages/Packages/Add'))
const EditPackage = lazy(() => import('./pages/Packages/Edit'))
const PackagePricing = lazy(() => import('./pages/PackagePricing/index'))
const AddPackagePricing = lazy(() => import('./pages/PackagePricing/Add'))
const EditPackagePricing = lazy(() => import('./pages/PackagePricing/Edit'))
const Vehicles = lazy(() => import('./pages/Vehicles/index'))
const AddVehicle = lazy(() => import('./pages/Vehicles/Add'))
const EditVehicle = lazy(() => import('./pages/Vehicles/Edit'))
const Categories = lazy(() => import('./pages/Categories'))
const AddCategory = lazy(() => import('./pages/Categories/Add'))
const EditCategory = lazy(() => import('./pages/Categories/Edit'))
const Countries = lazy(() => import('./pages/Countries/index'))
const AddCountry = lazy(() => import('./pages/Countries/Add'))
const EditCountry = lazy(() => import('./pages/Countries/Edit'))
const States = lazy(() => import('./pages/States/index'))
const AddState = lazy(() => import('./pages/States/Add'))
const EditState = lazy(() => import('./pages/States/Edit'))
const Cities = lazy(() => import('./pages/Cities/index'))
const AddCity = lazy(() => import('./pages/Cities/Add'))
const EditCity = lazy(() => import('./pages/Cities/Edit'))
const Bookings = lazy(() => import('./pages/Bookings/index'))
const AddBooking = lazy(() => import('./pages/Bookings/Add'))
const EditBooking = lazy(() => import('./pages/Bookings/Edit'))
const Users = lazy(() => import('./pages/Users/index'))
const AddUser = lazy(() => import('./pages/Users/Add'))
const EditUser = lazy(() => import('./pages/Users/Edit'))
const Analytics = lazy(() => import('./pages/Analytics/index'))
const Settings = lazy(() => import('./pages/Settings/index'))
const Blogs = lazy(() => import('./pages/Blogs/index'))
const AddBlog = lazy(() => import('./pages/Blogs/Add'))
const EditBlog = lazy(() => import('./pages/Blogs/Edit'))
const Banners = lazy(() => import('./pages/Banners/index'))
const AddBanner = lazy(() => import('./pages/Banners/Add'))
const EditBanner = lazy(() => import('./pages/Banners/Edit'))
const Discounts = lazy(() => import('./pages/Discounts/index'))
const AddDiscount = lazy(() => import('./pages/Discounts/Add'))
const EditDiscount = lazy(() => import('./pages/Discounts/Edit'))
const AboutUs = lazy(() => import('./pages/AboutUs/index'))
const AddAboutUs = lazy(() => import('./pages/AboutUs/Add'))
const EditAboutUs = lazy(() => import('./pages/AboutUs/Edit'))
const Support = lazy(() => import('./pages/Support/index'))
const EditSupport = lazy(() => import('./pages/Support/Edit'))
const Policies = lazy(() => import('./pages/Policies/index'))
const AddPolicy = lazy(() => import('./pages/Policies/Add'))
const EditPolicy = lazy(() => import('./pages/Policies/Edit'))
const FooterCMS = lazy(() => import('./pages/FooterCMS/index'))
const AddFooterCMS = lazy(() => import('./pages/FooterCMS/Add'))
const EditFooterCMS = lazy(() => import('./pages/FooterCMS/Edit'))
const CustomRequests = lazy(() => import('./pages/CustomRequests/index'))
const EditCustomRequest = lazy(() => import('./pages/CustomRequests/Edit'))
const Feedback = lazy(() => import('./pages/Feedback/index'))
const ErrorLogs = lazy(() => import('./pages/ErrorLogs/index'))
const ViewErrorLog = lazy(() => import('./pages/ErrorLogs/View'))
const Reviews = lazy(() => import('./pages/Reviews/index'))
const AddReview = lazy(() => import('./pages/Reviews/Add'))
const EditReview = lazy(() => import('./pages/Reviews/Edit'))
const FAQs = lazy(() => import('./pages/FAQs/index'))
const AddFAQ = lazy(() => import('./pages/FAQs/Add'))
const EditFAQ = lazy(() => import('./pages/FAQs/Edit'))
const ChatbotFAQs = lazy(() => import('./pages/ChatbotFAQs/index'))
const AddChatbotFAQ = lazy(() => import('./pages/ChatbotFAQs/Add'))
const EditChatbotFAQ = lazy(() => import('./pages/ChatbotFAQs/Edit'))
const Notifications = lazy(() => import('./pages/Notifications/index'))

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <TokenHandler />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgb(var(--surface-card))',
                color: 'rgb(var(--fg))',
                border: '1px solid rgb(var(--surface-border))',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'rgb(var(--surface-card))' } },
              error: { iconTheme: { primary: '#ef4444', secondary: 'rgb(var(--surface-card))' } },
            }}
          />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/packages/new" element={<AddPackage />} />
                  <Route path="/packages/:id/edit" element={<EditPackage />} />
                  <Route path="/package-pricing" element={<PackagePricing />} />
                  <Route path="/package-pricing/new" element={<AddPackagePricing />} />
                  <Route path="/package-pricing/:id/edit" element={<EditPackagePricing />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/new" element={<AddVehicle />} />
                  <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/new" element={<AddCategory />} />
                  <Route path="/categories/:id/edit" element={<EditCategory />} />
                  <Route path="/countries" element={<Countries />} />
                  <Route path="/countries/new" element={<AddCountry />} />
                  <Route path="/countries/:id/edit" element={<EditCountry />} />
                  <Route path="/states" element={<States />} />
                  <Route path="/states/new" element={<AddState />} />
                  <Route path="/states/:id/edit" element={<EditState />} />
                  <Route path="/cities" element={<Cities />} />
                  <Route path="/cities/new" element={<AddCity />} />
                  <Route path="/cities/:id/edit" element={<EditCity />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/new" element={<AddBlog />} />
                  <Route path="/blogs/:id/edit" element={<EditBlog />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/about-us/new" element={<AddAboutUs />} />
                  <Route path="/about-us/:id/edit" element={<EditAboutUs />} />
                  <Route path="/banners" element={<Banners />} />
                  <Route path="/banners/new" element={<AddBanner />} />
                  <Route path="/banners/:id/edit" element={<EditBanner />} />
                  <Route path="/discounts" element={<Discounts />} />
                  <Route path="/discounts/new" element={<AddDiscount />} />
                  <Route path="/discounts/:id/edit" element={<EditDiscount />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/bookings/new" element={<AddBooking />} />
                  <Route path="/bookings/:id/edit" element={<EditBooking />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/users/new" element={<AddUser />} />
                  <Route path="/users/:id/edit" element={<EditUser />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/support/:id/edit" element={<EditSupport />} />
                  <Route path="/custom-requests" element={<CustomRequests />} />
                  <Route path="/custom-requests/:id/edit" element={<EditCustomRequest />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/policies/new" element={<AddPolicy />} />
                  <Route path="/policies/:id/edit" element={<EditPolicy />} />
                  <Route path="/footer" element={<FooterCMS />} />
                  <Route path="/footer/new" element={<AddFooterCMS />} />
                  <Route path="/footer/:id/edit" element={<EditFooterCMS />} />
                  <Route path="/error-logs" element={<ErrorLogs />} />
                  <Route path="/error-logs/:id" element={<ViewErrorLog />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/reviews/new" element={<AddReview />} />
                  <Route path="/reviews/:id/edit" element={<EditReview />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/faqs/new" element={<AddFAQ />} />
                  <Route path="/faqs/:id/edit" element={<EditFAQ />} />
                  <Route path="/chatbot" element={<ChatbotFAQs />} />
                  <Route path="/chatbot/new" element={<AddChatbotFAQ />} />
                  <Route path="/chatbot/:id/edit" element={<EditChatbotFAQ />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
