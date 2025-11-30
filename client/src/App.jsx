import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReviewsPage from "./pages/ReviewsPage";
import LandingPage from "./pages/LandingPage";
import Layout from "./components/Layout";
import RewardPage from "./pages/RewardPage";
import Admin from "./pages/admin/Admin";
import AppLayout from "./layout/admin-layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import OrderPage from "./features/orders/ui/OrderPage";
import OrderStatusPage from './features/orders/ui/OrderStatusPage';
import PaymentPage from './features/orders/ui/PaymentPage';
// import TestOrderButton from "./features/orders/components/TestOrderButton";
// import BackendTest from "./features/orders/components/BackendTest";
// import RealDataTest from "./features/orders/components/RealDataTest";
// import DataInspector from "./features/orders/components/DataInspector";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        {/* Development Tools - Remove in production */}
        {/* <TestOrderButton />
        <BackendTest />
        <RealDataTest />
        <DataInspector /> */}
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/rewards" element={<RewardPage />} />
          
          {/* Order Management Routes */}
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/orders/:orderId" element={<OrderStatusPage />} />

          {/* Admin Routes */}
          <Route element={<AppLayout />}>
            <Route path="/admin/:section?" element={<Admin />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;