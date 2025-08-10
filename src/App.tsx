import './App.css'
import AuthSmoke from "./dev/AuthSmoke.tsx";
import {Navigate, Route, Routes} from "react-router-dom";

export function App() {

  return (
      <Routes>
          <Route path="/dev-auth" element={<AuthSmoke />} />
          {/* временно все остальное редиректим на dev */}
          <Route path="*" element={<Navigate to="/dev-auth" replace />} />
      </Routes>
  )
}
