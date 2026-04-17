import logo from "@/assets/v4c-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "compact" | "white";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={logo}
        alt="Voice4Compliance logo"
        className={cn("h-9 w-9 object-contain", variant === "compact" && "h-7 w-7")}
        loading="eager"
      />
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            variant === "compact" ? "text-base" : "text-lg",
            variant === "white" ? "text-white" : "text-foreground"
          )}
        >
          Voice<span className="text-brand-purple">4</span>
          <span className="text-brand-teal">Compliance</span>
        </span>
      )}
    </div>
  );
}
