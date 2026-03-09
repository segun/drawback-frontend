import logo from "/images/logo/logo_main.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-muted">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DrawkcaB" className="h-6" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            © {new Date().getFullYear()} DrawkcaB. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-body text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
