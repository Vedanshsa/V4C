import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface AnimatedContentProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  distance?: number;
}

export function AnimatedContent({ children, className, delay = 0, direction = "up", distance = 40 }: AnimatedContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const getHiddenState = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: distance };
      case "down": return { opacity: 0, y: -distance };
      case "left": return { opacity: 0, x: distance };
      case "right": return { opacity: 0, x: -distance };
      case "scale": return { opacity: 0, scale: 0.9 };
      default: return { opacity: 0, y: distance };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: getHiddenState(),
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { type: "spring", damping: 20, stiffness: 100, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
