import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

import SellerDashboard from './pages/seller/SellerDashboard';
import ManageProduct from './pages/seller/ManageProduct';
import SellerOrders from './pages/seller/SellerOrders';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
          <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:id" element={<ProductDetail />} />

                <Route path="/cart" element={
                  <ProtectedRoute roles={['buyer']}><Cart /></ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute roles={['buyer']}><Checkout /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute roles={['buyer']}><Orders /></ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute roles={['buyer']}><Wishlist /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                <Route path="/seller/dashboard" element={
                  <ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>
                } />
                <Route path="/seller/products/new" element={
                  <ProtectedRoute roles={['seller']}><ManageProduct /></ProtectedRoute>
                } />
                <Route path="/seller/products/:id/edit" element={
                  <ProtectedRoute roles={['seller']}><ManageProduct /></ProtectedRoute>
                } />
                <Route path="/seller/orders" element={
                  <ProtectedRoute roles={['seller']}><SellerOrders /></ProtectedRoute>
                } />

                <Route path="/admin/dashboard" element={
                  <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>
                } />

                <Route path="*" element={
                  <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                    Page not found
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
