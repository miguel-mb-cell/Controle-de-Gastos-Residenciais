import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Base from "./components/Base";
import Index from "./paginas/Index";
import Pessoas from "./paginas/Pessoas";
import Transacoes from "./paginas/Transacoes";
import Autenticacao from "./paginas/Autenticacao";

export default function App() {
  return (
    <Router>
        <Base>
          <Routes>
            <Route path="/autenticacao" element={<Autenticacao />} />
            <Route path="/" element={<Index />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/transacoes" element={<Transacoes />} />
          </Routes>
        </Base>
    </Router>
  );
}
