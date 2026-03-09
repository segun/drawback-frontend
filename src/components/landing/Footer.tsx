import logo from "/images/logo/logo_main.png";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isPrivacyPage = location.pathname === '/privacy';

  return (
    <footer className="border-t border-border py-4 bg-muted">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DrawkcaB" className="h-12" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            © {new Date().getFullYear()} DrawkcaB. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-body text-sm text-muted-foreground">
            {isPrivacyPage ? (
              <span className="text-muted-foreground/50 cursor-not-allowed">Privacy</span>
            ) : (
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Privacy
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
