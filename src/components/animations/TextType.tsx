import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface TextTypeProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function TextType({ text, className, delay = 0, speed = 0.03 }: TextTypeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const letters = Array.from(text);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: { staggerChildren: speed, delayChildren: delay },
        },
        hidden: {},
      }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
