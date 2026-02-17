import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import CartPage from "./pages/CartPage.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </>
  );
}
