import logo from "/images/logo/logo_main.png";
import { StoreButtons } from "./StoreButtons";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  // Hide Features and How it works links on these pages
  const hideNavLinks = ["/confirm", "/reset-password", "/delete-my-account", "/privacy", "/csae"].includes(location.pathname);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="DrawkcaB" className="h-16" />
        </a>
        {!hideNavLinks && (
          <div className="hidden md:flex items-center gap-8 font-body text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-3">
          <StoreButtons size="small" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
