import React, { useEffect, useState } from "react";
import { fetchProducts } from "../api/productsApi.js";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await fetchProducts();
        setProducts(data);
      } catch (e) {
        setErr(e.message || "Failed to load products");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>Products</h2>
      {err ? <div style={{ color: "crimson" }}>{err}</div> : null}

      <div style={grid}>
        {products.map((p) => (
          <ProductCard key={p._id} product={p} onAdd={addItem} />
        ))}
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};
