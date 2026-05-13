/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi, googleLogin as googleLoginApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, token } = useAuth();

  // Prevent logged-in users from accessing the register page
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  // Real-time validation checker
  const validateForm = () => {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) errors.push("Please enter a valid email address.");
    if (password.length < 8) errors.push("Password must be at least 8 characters.");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number.");
    if (!/[a-zA-Z]/.test(password)) errors.push("Password must contain at least one letter.");
    if (!firstName.trim() || !lastName.trim()) errors.push("First and Last name are required.");
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerApi({ 
        username: email, 
        email: email, 
        first_name: firstName, 
        last_name: lastName, 
        password 
      });
      // Redirect to login after successful standard registration
      navigate("/login", { replace: true }); 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.data) {
        const backendErrors = Object.values(err.response.data).flat() as string[];
        setError(backendErrors[0] || "Registration failed. Email might be taken.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    try {
      const data = await googleLoginApi(credentialResponse.credential);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      login((data as any).access); 
      // Redirect directly to dashboard on successful Google registration/login
      navigate("/", { replace: true }); 
    } catch (err) {
      setError("Google authentication failed. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 450, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="font-display" style={{ fontSize: 42, color: "var(--text)", lineHeight: 1 }}>JOIN</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>Create an account</div>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16, textAlign: "center", background: "rgba(255,68,68,0.1)", padding: 10, borderRadius: 8 }}>{error}</div>}
        
        {validationErrors.length > 0 && (
          <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 16 }}>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {validationErrors.map((err, i) => <li key={i} style={{ marginBottom: 4 }}>{err}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>FIRST NAME</label>
              <input className="input" type="text" required value={firstName} onChange={(e) => { setFirstName(e.target.value); setValidationErrors([]); }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>LAST NAME</label>
              <input className="input" type="text" required value={lastName} onChange={(e) => { setLastName(e.target.value); setValidationErrors([]); }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>EMAIL ADDRESS</label>
            <input className="input" type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setValidationErrors([]); }} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input className="input" type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setValidationErrors([]); }} />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Creating..." : "Sign Up"}
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
            shape="rectangular"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--text)", textDecoration: "none", fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}