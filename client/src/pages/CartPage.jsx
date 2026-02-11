import React from "react";
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { items, updateQty, removeItem, totals, clear } = useCart();

  return (
    <div style={{ padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>Your Cart</h2>

      {items.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((i) => (
              <div key={i.productId} style={row}>
                <img src={i.image} alt={i.name} style={img} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{i.name}</div>
                  <div>${i.price.toFixed(2)}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => updateQty(i.productId, i.qty - 1)}>-</button>
                  <div style={{ minWidth: 18, textAlign: "center" }}>{i.qty}</div>
                  <button onClick={() => updateQty(i.productId, i.qty + 1)}>+</button>
                </div>

                <button onClick={() => removeItem(i.productId)} style={{ marginLeft: 10 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <hr style={{ margin: "16px 0" }} />
          <div style={{ fontWeight: 700 }}>
            Subtotal: ${totals.subtotal.toFixed(2)}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button onClick={clear}>Clear cart</button>
          </div>
        </>
      )}
    </div>
  );
}

const row = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 12,
};

const img = { width: 64, height: 64, objectFit: "cover", borderRadius: 10 };
