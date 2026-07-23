import { createBrowserRouter } from "react-router-dom";
import TrackDonationsPage from "./pages/TrackDonationsPage";
import AchievementsPage from "./pages/AchievementsPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProblemPage from "./pages/ProblemPage";
import SolutionPage from "./pages/SolutionPage";
import ImpactPage from "./pages/ImpactPage";
import CampaignPage from "./pages/CampaignPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import DonatePage from "./pages/DonatePage";
import FounderPage from "./pages/FounderPage";
import DocumentsPage from "./pages/DocumentsPage";
import ThankYouPage from "./pages/ThankYouPage";
import ComponentShowcase from "./pages/ComponentShowcase";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import VerificationQueuePage from "./pages/admin/VerificationQueuePage";
import DonationHistoryPage from "./pages/admin/DonationHistoryPage";
import CampaignsPage from "./pages/admin/CampaignsPage";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import CertificateVerificationPage from "./pages/verifyCertificate";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
     { path: "/track-donations", element: <TrackDonationsPage /> },
      { path: "/components", element: <ComponentShowcase /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/problem", element: <ProblemPage /> },
      { path: "/solution", element: <SolutionPage /> },
      { path: "/impact", element: <ImpactPage /> },
      { path: "/campaign", element: <CampaignPage /> },
      { path: "/campaign/:id", element: <CampaignDetailPage /> },
      { path: "/campaign/:id/donate", element: <CampaignDetailPage /> },
      { path: "/achievements", element: <AchievementsPage /> },
      { path: "/donate", element: <DonatePage /> },
      { path: "/donate/:campaignId", element: <DonatePage /> },
      { path: "/founders", element: <FounderPage /> },
      { path: "/documents", element: <DocumentsPage /> },
      { path: "/thank-you", element: <ThankYouPage /> },
      { path: "/verify/:certificateId", element: <CertificateVerificationPage /> },
    ],
  },
  { path: "/admin/login", element: <AdminLoginPage /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      {
        path: "verification-queue",
        element: <VerificationQueuePage />,
      },
      {
        path: "donation-history",
        element: <DonationHistoryPage />,
      },
      {
        path: "campaigns",
        element: <CampaignsPage />,
      },
      {
        path: "campaigns/:campaignId",
        element: <AdminCampaignDetailPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

export default router;