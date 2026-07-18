/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
  register as registerApi,
  googleLogin as googleLoginApi,
} from "../api/auth";
import {useAuth} from "../context/AuthContext";

export function useRegister() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const {login, token} = useAuth();

  // منع المستخدمين اللي عاملين تسجيل دخول إنهم يدخلوا صفحة التسجيل
  useEffect(() => {
    if (token) {
      navigate("/", {replace: true});
    }
  }, [token, navigate]);

  // دالة فحص صحة البيانات (Validation)
  const validateForm = () => {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email))
      errors.push("Please enter a valid email address.");
    if (password.length < 8)
      errors.push("Password must be at least 8 characters.");
    if (!/[0-9]/.test(password))
      errors.push("Password must contain at least one number.");
    if (!/[a-zA-Z]/.test(password))
      errors.push("Password must contain at least one letter.");
    if (!firstName.trim() || !lastName.trim())
      errors.push("First and Last name are required.");

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
        password,
      });
      navigate("/login", {replace: true});
    } catch (err: any) {
      if (err.response?.data) {
        const backendErrors = Object.values(
          err.response.data,
        ).flat() as string[];
        setError(
          backendErrors[0] || "Registration failed. Email might be taken.",
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);
    try {
      const data = await googleLoginApi(credentialResponse.credential);
      login((data as any).access, (data as any).refresh);
      navigate("/", {replace: true});
    } catch {
      setError("Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed.");
    setLoading(false);
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    validationErrors,
    setValidationErrors,
    loading,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleError,
  };
}
