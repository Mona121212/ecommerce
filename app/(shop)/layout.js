import AuthGate from "../_components/auth/AuthGate";

export default function ShopLayout({ children }) {
  return <AuthGate>{children}</AuthGate>;
}
