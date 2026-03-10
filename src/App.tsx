import { ConfirmPage } from "./pages/ConfirmPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DeleteAccountPage } from "./pages/DeleteAccountPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

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
                        <Route path="/delete-my-account" element={<DeleteAccountPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
