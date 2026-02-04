import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-2xl md:text-4xl bg-gradient-to-r from-[#0073CF] to-[#00A3E0] bg-clip-text text-transparent"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        Welcome to Boomi Assistant
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-lg md:text-xl text-muted-foreground mt-2"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        Manage your integrations, processes, and trading partners with AI-powered assistance
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
      >
        <div className="h-2 w-2 rounded-full bg-[#0073CF] animate-pulse" />
        <span>Connected to Boomi Platform</span>
      </motion.div>
    </div>
  );
};
