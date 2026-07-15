import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProblemPage from "./pages/ProblemPage";
import SolutionPage from "./pages/SolutionPage";
import ImpactPage from "./pages/ImpactPage";
import CampaignPage from "./pages/CampaignPage";
import DonatePage from "./pages/DonatePage";
import FounderPage from "./pages/FounderPage";
import DocumentsPage from "./pages/DocumentsPage";
import ThankYouPage from "./pages/ThankYouPage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/problem", element: <ProblemPage /> },
  { path: "/solution", element: <SolutionPage /> },
  { path: "/impact", element: <ImpactPage /> },
  { path: "/campaign", element: <CampaignPage /> },
  { path: "/donate", element: <DonatePage /> },
  { path: "/founders", element: <FounderPage /> },
  { path: "/documents", element: <DocumentsPage /> },
  { path: "/thank-you", element: <ThankYouPage /> },
  { path: "/verify/:verificationId", element: <VerifyCertificatePage /> },
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin", element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute> },
]);

export default router;
