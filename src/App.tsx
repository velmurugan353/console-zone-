import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomizerProvider } from './context/CustomizerContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './components/RequireAuth';
import AuthModal from './components/AuthModal';

// Lazy load Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Rentals = lazy(() => import('./pages/Rentals'));
const Sell = lazy(() => import('./pages/Sell'));
const Repair = lazy(() => import('./pages/Repair'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const RentalBookingPage = lazy(() => import('./pages/RentalBookingPage'));
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'));
const BookPage = lazy(() => import('./pages/BookPage'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const Support = lazy(() => import('./pages/Support'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load User Pages
const Register = lazy(() => import('./pages/user/Register'));
const ForgotPassword = lazy(() => import('./pages/user/ForgotPassword'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const MyOrders = lazy(() => import('./pages/user/MyOrders'));
const MyRentals = lazy(() => import('./pages/user/MyRentals'));
const MyRepairRequests = lazy(() => import('./pages/user/MyRepairRequests'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const AddressManagement = lazy(() => import('./pages/user/AddressManagement'));
const Notifications = lazy(() => import('./pages/user/Notifications'));
const UserKYC = lazy(() => import('./pages/user/KYC'));
const UserLayout = lazy(() => import('./layouts/UserLayout'));

// Lazy load Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminRentals = lazy(() => import('./pages/admin/AdminRentals'));
const AdminRepairs = lazy(() => import('./pages/admin/AdminRepairs'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSellRequests = lazy(() => import('./pages/admin/AdminSellRequests'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const KYCPage = lazy(() => import('./pages/admin/KYC'));
const AdminControls = lazy(() => import('./pages/admin/AdminControls'));
const AdminOperations = lazy(() => import('./pages/admin/AdminOperations'));
const AdminInvoices = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminCustomizer = lazy(() => import('./pages/admin/AdminCustomizer'));
const RentalProductManagement = lazy(() => import('./pages/admin/RentalProductManagement'));
const RentalHistoryPage = lazy(() => import('./pages/admin/RentalHistoryPage'));
const CustomerProfilesPage = lazy(() => import('./pages/admin/CustomerProfilesPage'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-[#080112] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-gaming-accent border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Syncing Matrix...</p>
  </div>
);

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    console.log('[APP] Matrix re-initialized.');
  });

  const handleAuthRequired = useCallback(() => {
    setIsAuthOpen(true);
  }, []);

  const handleCloseAuth = useCallback(() => {
    setIsAuthOpen(false);
  }, []);

  return (
    <AuthProvider>
      <CustomizerProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainLayout onAuthClick={handleAuthRequired}><Home /></MainLayout>} />
                <Route path="/shop" element={<MainLayout onAuthClick={handleAuthRequired}><Shop /></MainLayout>} />
                <Route path="/product/:id" element={<MainLayout onAuthClick={handleAuthRequired}><ProductDetails /></MainLayout>} />
                <Route path="/rentals" element={<MainLayout onAuthClick={handleAuthRequired}><Rentals /></MainLayout>} />
                <Route path="/sell" element={<MainLayout onAuthClick={handleAuthRequired}><Sell /></MainLayout>} />
                <Route path="/repair" element={<MainLayout onAuthClick={handleAuthRequired}><Repair /></MainLayout>} />
                <Route path="/cart" element={<MainLayout onAuthClick={handleAuthRequired}><Cart /></MainLayout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/rentals/:slug/book" element={<MainLayout onAuthClick={handleAuthRequired}><RentalBookingPage /></MainLayout>} />
                <Route path="/rentals/:slug/book/confirm" element={<MainLayout onAuthClick={handleAuthRequired}><BookingConfirmationPage /></MainLayout>} />
                <Route path="/book" element={<MainLayout onAuthClick={handleAuthRequired}><BookPage /></MainLayout>} />
                <Route path="/support" element={<MainLayout onAuthClick={handleAuthRequired}><Support /></MainLayout>} />
                <Route path="/coming-soon" element={<ComingSoon />} />

                {/* Protected User Routes */}
                <Route path="/dashboard" element={<RequireAuth onLoginRequired={handleAuthRequired}><UserLayout /></RequireAuth>}>
                  <Route index element={<UserDashboard />} />
                  <Route path="orders" element={<MyOrders />} />
                  <Route path="rentals" element={<MyRentals />} />
                  <Route path="repairs" element={<MyRepairRequests />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="addresses" element={<AddressManagement />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="kyc" element={<UserKYC />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<RequireAuth onLoginRequired={handleAuthRequired}><AdminLayout /></RequireAuth>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="operations" element={<AdminOperations />} />
                  <Route path="inventory" element={<AdminOperations />} />
                  <Route path="rentals" element={<AdminRentals />} />
                  <Route path="repairs" element={<AdminRepairs />} />
                  <Route path="rental-products" element={<RentalProductManagement />} />
                  <Route path="rental-history" element={<RentalHistoryPage />} />
                  <Route path="customer-profiles" element={<CustomerProfilesPage />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="controls" element={<AdminControls />} />
                  <Route path="customizer" element={<AdminCustomizer />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="invoices" element={<AdminInvoices />} />
                  <Route path="kyc" element={<KYCPage />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AuthModal isOpen={isAuthOpen} onClose={handleCloseAuth} />
          </Router>
        </CartProvider>
      </CustomizerProvider>
    </AuthProvider>
  );
}

export default App;
