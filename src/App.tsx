import { ConfirmPage } from "./pages/ConfirmPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DeleteAccountPage } from "./pages/DeleteAccountPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { CsaePage } from "./pages/CsaePage";
import { EulaPage } from "./pages/EulaPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminAppConfigPage } from "./pages/AdminAppConfigPage";
import { AdminCampaignsPage } from "./pages/AdminCampaignsPage";
import { AdminGeoProvidersPage } from "./pages/AdminGeoProvidersPage";
import { AdminCampaignDeliveriesPage } from "./pages/AdminCampaignDeliveriesPage";
import { AdminSessionStatsPage } from "./pages/AdminSessionStatsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/confirm" element={<ConfirmPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/admin" element={<AdminLoginPage />} />
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/app-config" element={<AdminAppConfigPage />} />
                        <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
                        <Route path="/admin/geo-providers" element={<AdminGeoProvidersPage />} />
                        <Route path="/admin/campaign-deliveries" element={<AdminCampaignDeliveriesPage />} />
                        <Route path="/admin/session-stats" element={<AdminSessionStatsPage />} />
                        <Route path="/delete-my-account" element={<DeleteAccountPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/csae" element={<CsaePage />} />
                        <Route path="/eula" element={<EulaPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
