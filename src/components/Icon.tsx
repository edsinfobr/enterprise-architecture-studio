import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  name?: string;
}

/**
 * Renders a Lucide icon by name. Falls back to a neutral square
 * when the name is missing or unknown so the UI never crashes.
 */
export function Icon({ name, ...props }: IconProps) {
  const lib = Lucide as unknown as Record<
    string,
    React.ComponentType<LucideProps>
  >;
  const Cmp = (name && lib[name]) || Lucide.Square;
  return <Cmp {...props} />;
}
