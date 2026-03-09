import { motion } from "framer-motion";
import { StoreButtonsInverted } from "./StoreButtons";

const CTASection = () => {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center gradient-cta rounded-3xl p-12 sm:p-16 shadow-hero"
        >
          <h2 className="text-5xl sm:text-6xl font-bold text-primary-foreground mb-4">
            Ready to draw?
          </h2>
          <p className="font-body text-lg text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Join the community of artists who chat through drawings. It's free to start.
          </p>
          <div className="flex justify-center">
            <StoreButtonsInverted />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
