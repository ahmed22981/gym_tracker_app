import {Link} from "react-router-dom";
import {GoogleLogin} from "@react-oauth/google";
import Preloader from "../components/Preloader";
import {useRegister} from "../hooks/useRegister";

export default function Register() {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    validationErrors,
    setValidationErrors,
    loading,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleError,
  } = useRegister();

  return (
    <>
      {loading && <Preloader fullScreen text="Setting up your account" />}
      <div
        style={{
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          className="card"
          style={{width: "100%", maxWidth: 450, padding: 32}}
        >
          <div style={{textAlign: "center", marginBottom: 32}}>
            <div
              className="font-display"
              style={{fontSize: 42, color: "var(--text)", lineHeight: 1}}
            >
              JOIN
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Create an account
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "var(--danger)",
                fontSize: 13,
                marginBottom: 16,
                textAlign: "center",
                background: "rgba(255,68,68,0.1)",
                padding: 10,
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div
              style={{color: "var(--danger)", fontSize: 12, marginBottom: 16}}
            >
              <ul style={{paddingLeft: 16, margin: 0}}>
                {validationErrors.map((err, i) => (
                  <li key={i} style={{marginBottom: 4}}>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{display: "flex", flexDirection: "column", gap: 16}}
          >
            <div
              style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  FIRST NAME
                </label>
                <input
                  className="input"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setValidationErrors([]);
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  LAST NAME
                </label>
                <input
                  className="input"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setValidationErrors([]);
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationErrors([]);
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                PASSWORD
              </label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationErrors([]);
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{marginTop: 8}}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div style={{flex: 1, height: 1, background: "var(--border)"}} />
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              or
            </span>
            <div style={{flex: 1, height: 1, background: "var(--border)"}} />
          </div>

          <div style={{display: "flex", justifyContent: "center"}}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="circle"
            />
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--text)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
