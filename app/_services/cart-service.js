import { getFirebaseDb } from "../_utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from "firebase/firestore";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore not initialized");
  return db;
}

export async function getCartItems(userId) {
  const db = requireDb();

  const items = [];
  const ref = collection(db, "users", userId, "cartItems");
  const snap = await getDocs(ref);

  snap.forEach((d) => {
    items.push({ id: d.id, ...d.data() });
  });

  return items;
}

export async function addToCart(userId, product, qty = 1) {
  const db = requireDb();

  const cartRef = collection(db, "users", userId, "cartItems");

  const productId = Number(product?.id);
  if (!productId) throw new Error("Invalid product");

  const cleanQty = Math.max(1, Number(qty || 1));

  const q = query(cartRef, where("productId", "==", productId), limit(1));
  const existingSnap = await getDocs(q);

  if (!existingSnap.empty) {
    const existingDoc = existingSnap.docs[0];
    const data = existingDoc.data();
    const currentQty = Number(data.quantity || 0);

    await updateDoc(doc(db, "users", userId, "cartItems", existingDoc.id), {
      quantity: currentQty + cleanQty,
      updatedAt: Date.now(),
    });

    return existingDoc.id;
  }

  const payload = {
    productId,
    title: String(product?.title ?? ""),
    price: Number(product?.price ?? 0),
    image: String(product?.image ?? ""),
    category: String(product?.category ?? ""),
    quantity: cleanQty,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(cartRef, payload);
  return docRef.id;
}

export async function updateCartItemQty(userId, cartItemId, quantity) {
  const db = requireDb();

  const qty = Number(quantity);
  if (!cartItemId) throw new Error("Missing cart item id");
  if (!Number.isFinite(qty) || qty < 1) throw new Error("Invalid quantity");

  const ref = doc(db, "users", userId, "cartItems", cartItemId);
  await updateDoc(ref, { quantity: qty, updatedAt: Date.now() });
}

export async function removeCartItem(userId, cartItemId) {
  const db = requireDb();

  if (!cartItemId) throw new Error("Missing cart item id");
  const ref = doc(db, "users", userId, "cartItems", cartItemId);
  await deleteDoc(ref);
}
