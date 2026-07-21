import {
  Lightbulb,
  Radio,
  Eye,
  Shield,
  CarFront,
  Wrench,
  Package,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  radio: Radio,
  eye: Eye,
  shield: Shield,
  "car-front": CarFront,
  wrench: Wrench,
};

export function categoryIcon(name: string | null): LucideIcon {
  return (name && ICONS[name]) || Package;
}
