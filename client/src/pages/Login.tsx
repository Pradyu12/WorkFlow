import { useState } from "react";
import { useAuth } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { ios } from "../utils/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: ios.bg }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.5, color: ios.text, marginBottom: 6 }}>Workflow</div>
          <div style={{ fontSize: 15, color: ios.textSecondary }}>Sign in to continue</div>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "#FFF2F2", borderRadius: ios.radius.md, marginBottom: 16, border: "0.5px solid #FFC7C7" }}>
            <span style={{ fontSize: 14, color: ios.red }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: ios.card, borderRadius: ios.radius.md, overflow: "hidden", border: `0.5px solid ${ios.separator}`, marginBottom: 20 }}>
            <div style={{ padding: "0 16px" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ width: "100%", padding: "16px 0", border: "none", background: "none", fontSize: 17, outline: "none", color: ios.text }}
              />
            </div>
            <div style={{ height: 0.5, background: ios.separator, marginLeft: 16 }} />
            <div style={{ padding: "0 16px" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ width: "100%", padding: "16px 0", border: "none", background: "none", fontSize: 17, outline: "none", color: ios.text }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ width: "100%", padding: 16, background: ios.blue, color: "#fff", border: "none", borderRadius: ios.radius.md, fontSize: 17, fontWeight: 600, cursor: "pointer" }}
          >
            Sign In
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 15, color: ios.textSecondary }}>No account? </span>
          <Link to="/register" style={{ fontSize: 15, fontWeight: 500, color: ios.blue }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
