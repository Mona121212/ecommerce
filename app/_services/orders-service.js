import { db } from "../_utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

export async function createOrder(userId, order) {
  const ordersRef = collection(db, "users", userId, "orders");
  const payload = {
    createdAt: Date.now(),
    status: String(order?.status ?? "placed"),
    total: Number(order?.total ?? 0),
    items: Array.isArray(order?.items) ? order.items : [],
    shipping: order?.shipping ?? null,
    payment: order?.payment ?? null,
  };

  const docRef = await addDoc(ordersRef, payload);
  return docRef.id;
}

export async function getOrders(userId) {
  const orders = [];
  const ordersRef = collection(db, "users", userId, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  snap.forEach((d) => {
    orders.push({ id: d.id, ...d.data() });
  });

  return orders;
}

export async function clearCart(userId) {
  const cartRef = collection(db, "users", userId, "cartItems");
  const snap = await getDocs(cartRef);

  const deletions = snap.docs.map((d) =>
    deleteDoc(doc(db, "users", userId, "cartItems", d.id))
  );

  await Promise.all(deletions);
}
