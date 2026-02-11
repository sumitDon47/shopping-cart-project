import React from "react";

export default function ProductCard({ product, onAdd }) {
  return (
    <div style={styles.card}>
      <img src={product.image} alt={product.name} style={styles.img} />
      <div style={{ fontWeight: 700 }}>{product.name}</div>
      <div>${product.price.toFixed(2)}</div>
      <button onClick={() => onAdd(product)} style={styles.btn}>
        Add to cart
      </button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gap: 8,
  },
  img: { width: "100%", height: 160, objectFit: "cover", borderRadius: 10 },
  btn: { padding: "10px 12px", borderRadius: 10, cursor: "pointer" },
};
