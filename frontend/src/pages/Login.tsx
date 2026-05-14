import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, googleLogin as googleLoginApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, token } = useAuth();

  useEffect(()=>{
    if(token) {
      navigate("/", {replace: true});
    }
  },[token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data = await loginApi({ username: email, password });
      // 1. UPDATE: Pass BOTH tokens here
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      login((data as any).access, (data as any).refresh); 
      navigate("/", {replace: true}); 
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    try {
      const data = await googleLoginApi(credentialResponse.credential);
      // 2. UPDATE: Pass BOTH tokens here too
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      login((data as any).access, (data as any).refresh); 
      navigate("/", {replace: true}); 
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="font-display" style={{ fontSize: 42, color: "var(--accent)", lineHeight: 1 }}>GYM</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>Tracker Login</div>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16, textAlign: "center", background: "rgba(255,68,68,0.1)", padding: 10, borderRadius: 8 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>EMAIL ADDRESS</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed.")}
            theme="filled_black"
            shape="circle"            
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--text)", textDecoration: "none", fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}