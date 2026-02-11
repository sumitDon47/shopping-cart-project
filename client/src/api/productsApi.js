export async function fetchProducts() {
  const base = import.meta.env.VITE_API_URL;
  const res = await fetch(`${base}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
