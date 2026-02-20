import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SecretaireDashboard from "./pages/dashboard/SecretaireDashboard";
import MedecinDashboard from "./pages/dashboard/MedecinDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PatientsPage from "./pages/dashboard/secretaire/PatientsPage";
import RendezVousPage from "./pages/dashboard/secretaire/RendezVousPage";
import FacturationPage from "./pages/dashboard/secretaire/FacturationPage";
import CabinetsPage from "./pages/dashboard/admin/CabinetsPage";
import UtilisateursPage from "./pages/dashboard/admin/UtilisateursPage";
import MedicamentsPage from "./pages/dashboard/admin/MedicamentsPage";
import PatientsListPage from "./pages/dashboard/medecin/PatientsListPage";
import ConsultationsPage from "./pages/dashboard/medecin/ConsultationsPage";
import OrdonnancesPage from "./pages/dashboard/medecin/OrdonnancesPage";
import PatientEnCoursPage from "./pages/dashboard/medecin/PatientEnCoursPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          {/* Secrétaire Routes */}
          <Route path="/dashboard/secretaire" element={<SecretaireDashboard />} />
          <Route path="/dashboard/secretaire/patients" element={<PatientsPage />} />
          <Route path="/dashboard/secretaire/rendez-vous" element={<RendezVousPage />} />
          <Route path="/dashboard/secretaire/facturation" element={<FacturationPage />} />
          {/* Médecin Routes */}
          <Route path="/dashboard/medecin" element={<MedecinDashboard />} />
          <Route path="/dashboard/medecin/patients" element={<PatientsListPage />} />
          <Route path="/dashboard/medecin/consultations" element={<ConsultationsPage />} />
          <Route path="/dashboard/medecin/ordonnances" element={<OrdonnancesPage />} />
          <Route path="/dashboard/medecin/consultation" element={<PatientEnCoursPage />} />
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/cabinets" element={<CabinetsPage />} />
          <Route path="/dashboard/admin/utilisateurs" element={<UtilisateursPage />} />
          <Route path="/dashboard/admin/medicaments" element={<MedicamentsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
