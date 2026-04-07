import { motion } from "framer-motion";
import { Zap, Users, Paintbrush, Globe, Shield, Smile } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "See strokes appear instantly as your friend draws. Zero lag, pure magic.",
  },
  {
    icon: Users,
    title: "Discover People",
    description: "Find and connect with other people on the platform. Start a drawing chat in seconds.",
  },
  {
    icon: Paintbrush,
    title: "Dual Canvas",
    description: "Two canvases, two people. Draw simultaneously and watch each other's creations unfold.",
  },
  {
    icon: Globe,
    title: "Draw Anywhere",
    description: "Available on iOS and Android. Draw together from your phone or tablet, wherever you are.",
  },
  {
    icon: Shield,
    title: "Private Sessions",
    description: "Your drawings stay between you and your partner. Secure, private, and ephemeral.",
  },
  {
    icon: Smile,
    title: "Express Yourself",
    description: "Sometimes a doodle says more than a thousand words. Communicate through art.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
            Why DrawkcaB?
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-md mx-auto">
            Drawing is the most human form of communication. We just made it collaborative.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group rounded-2xl bg-card border border-border p-7 hover:shadow-card transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
