import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {login as loginApi, googleLogin as googleLoginApi} from "../api/auth";
import {useAuth} from "../context/AuthContext";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const {login, token} = useAuth();

  useEffect(() => {
    if (token) {
      navigate("/", {replace: true});
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi({username: email, password});
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
    setLoading(true);
    try {
      const data = await googleLoginApi(credentialResponse.credential);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      login((data as any).access, (data as any).refresh);
      navigate("/", {replace: true});
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed.");
    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleError,
  };
}
