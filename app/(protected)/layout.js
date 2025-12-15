import AuthGate from "../_components/auth/AuthGate";

export default function ProtectedLayout({ children }) {
  return <AuthGate>{children}</AuthGate>;
}
