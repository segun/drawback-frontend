import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Sign Up", description: "Create your account in seconds. No credit card, no friction." },
  { number: "02", title: "Find a Friend", description: "Discover other users on the platform or invite someone with their username." },
  { number: "03", title: "Start Drawing", description: "Both of you get a canvas. Draw in real-time, see each other's art live." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-md mx-auto">
            Three steps to your first collaborative drawing.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex items-start gap-6 bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-card"
            >
              <span className="font-display text-5xl font-bold text-primary/30 shrink-0">{step.number}</span>
              <div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-1">{step.title}</h3>
                <p className="font-body text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
