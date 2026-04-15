import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/layout/AppLayout'
import PublicRoute from './utilty/PublicRoute'
import PrivateRoute from './utilty/PrivateRoute'
import Loader from './utilty/Loader'
import NotFoundPage from './utilty/NotFoundPage'
import TokenHandler from './utilty/TokenHandler'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'

// Lazy load pages
const Login         = lazy(() => import('./pages/Login'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Packages      = lazy(() => import('./pages/Packages'))
const PackagePricing = lazy(() => import('./pages/PackagePricing'))
const Vehicles      = lazy(() => import('./pages/Vehicles'))
const Categories    = lazy(() => import('./pages/Categories'))
const Countries     = lazy(() => import('./pages/Countries'))
const States        = lazy(() => import('./pages/States'))
const Cities        = lazy(() => import('./pages/Cities'))
const Bookings      = lazy(() => import('./pages/Bookings'))
const Users         = lazy(() => import('./pages/Users'))
const Analytics     = lazy(() => import('./pages/Analytics'))
const Settings      = lazy(() => import('./pages/Settings'))
const Blogs         = lazy(() => import('./pages/Blogs'))
const Banners       = lazy(() => import('./pages/Banners'))
const Discounts     = lazy(() => import('./pages/Discounts'))
const AboutUs       = lazy(() => import('./pages/AboutUs'))
const Support       = lazy(() => import('./pages/Support'))
const Policies      = lazy(() => import('./pages/Policies'))
const FooterCMS     = lazy(() => import('./pages/FooterCMS'))
const CustomRequests = lazy(() => import('./pages/CustomRequests'))
const Feedback      = lazy(() => import('./pages/Feedback'))
const ErrorLogs     = lazy(() => import('./pages/ErrorLogs'))
const Reviews       = lazy(() => import('./pages/Reviews'))
const FAQs          = lazy(() => import('./pages/FAQs'))
const ChatbotFAQs   = lazy(() => import('./pages/ChatbotFAQs'))
const Notifications = lazy(() => import('./pages/Notifications'))

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
                  <Route path="/package-pricing" element={<PackagePricing />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/countries" element={<Countries />} />
                  <Route path="/states" element={<States />} />
                  <Route path="/cities" element={<Cities />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/banners" element={<Banners />} />
                  <Route path="/discounts" element={<Discounts />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/custom-requests" element={<CustomRequests />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/footer" element={<FooterCMS />} />
                  <Route path="/error-logs" element={<ErrorLogs />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/chatbot" element={<ChatbotFAQs />} />
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
