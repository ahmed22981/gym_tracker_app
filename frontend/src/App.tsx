import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Exercises from "./pages/Exercises";
import Sessions from "./pages/Sessions";
import SessionDetail from "./pages/SessionDetail";
import NewSession from "./pages/NewSession";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewTemplate from "./pages/NewTemplate";
import Analytics from "./pages/Analytics";
import { TimerProvider } from "./context/TimerContext";

export default function App() {
  return (
    <AuthProvider>
      <TimerProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Anyone can visit these */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Only logged in users can pass this point */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Exercises />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="sessions/new" element={<NewSession />} />
              <Route path="templates/new" element={<NewTemplate />} /> 
              <Route path="sessions/:id" element={<SessionDetail />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </TimerProvider>
    </AuthProvider>
  );
}