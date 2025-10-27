import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import routes from "./routes/AllRoute";
import { AuthProvider } from "./context/AuthContext";
import ProtectRoute from "./routes/ProtectRoute";
import { GlobalProvider } from "./context/SocketContext";

// const queryClient = new QueryClient();

const App = () => (
  // <QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <AuthProvider>
      <GlobalProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={routes}></RouterProvider>
      </GlobalProvider>
    </AuthProvider>
  </TooltipProvider>
  // </QueryClientProvider>
);

export default App;
