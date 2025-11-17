import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./routes/AuthRoute";
import { SocketProvider } from "./context/SocketContext";
import AppRoutes from "./routes/AppRoute";

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
