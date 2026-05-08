import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminApp from "./admin/AdminApp";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

