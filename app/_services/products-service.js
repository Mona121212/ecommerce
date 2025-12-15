const BASE_URL = "https://fakestoreapi.com";

async function safeFetch(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getProducts() {
  return safeFetch(`${BASE_URL}/products`);
}

export async function getProductById(id) {
  if (!id) throw new Error("Missing product id");
  return safeFetch(`${BASE_URL}/products/${id}`);
}

export async function getCategories() {
  return safeFetch(`${BASE_URL}/products/categories`);
}

export async function getProductsByCategory(category) {
  if (!category) return [];
  return safeFetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}`
  );
}
