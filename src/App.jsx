import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CategoryPage from "./pages/CategoryPage";
import VitrinePage from "./pages/VitrinePage";

function App() {
  return (
    <Router>
      {/* <Routes>
        <Route path="/" element={<VitrinePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
      </Routes> */}
    </Router>
  );
}

export default App;
