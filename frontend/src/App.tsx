import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Exercises from "./pages/Exercises";
import Sessions from "./pages/Sessions";
import SessionDetail from "./pages/SessionDetail";
import NewSession from "./pages/NewSession";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Exercises />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/new" element={<NewSession />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}