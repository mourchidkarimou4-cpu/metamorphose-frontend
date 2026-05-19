import Navbar from '../components/Navbar';
import ModalRendezVous from '../components/ModalRendezVous';
import { useNavigate } from 'react-router-dom';

export default function RendezVousPage() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0A0A0A 0%,#1f1408 50%,#2e1e14 100%)", padding:"100px 24px 60px" }}>
        <ModalRendezVous onClose={() => navigate('/')} inline={true} />
      </div>
    </>
  );
}
