import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function AnimatedList({ children, className, delay = 0, staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <motion.ul
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
        hidden: {},
      }}
    >
      {children.map((child, index) => (
        <motion.li
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}
