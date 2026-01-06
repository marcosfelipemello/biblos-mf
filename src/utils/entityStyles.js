import { User, Sparkles, MapPin, Box, Scroll, HelpCircle } from "lucide-react";

export const getTypeStyles = (type) => {
  switch (type) {
    case "person":
      return {
        icon: User,
        color: "text-blue-500",
        bg: "bg-blue-50",
        gradient: "from-blue-50 to-indigo-50",
        label: "Personagem",
      };
    case "place":
      return {
        icon: MapPin,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        gradient: "from-emerald-50 to-teal-50",
        label: "Lugar",
      };
    case "artifact":
      return {
        icon: Box,
        color: "text-amber-500",
        bg: "bg-amber-50",
        gradient: "from-amber-50 to-orange-50",
        label: "Artefato",
      };
    case "abstract":
    case "symbol":
      return {
        icon: Sparkles,
        color: "text-purple-500",
        bg: "bg-purple-50",
        gradient: "from-purple-50 to-fuchsia-50",
        label: "Símbolo",
      };
    case "parable":
      return {
        icon: Scroll,
        color: "text-rose-500",
        bg: "bg-rose-50",
        gradient: "from-rose-50 to-pink-50",
        label: "Parábola",
      };
    default:
      return {
        icon: HelpCircle,
        color: "text-slate-500",
        bg: "bg-slate-50",
        gradient: "from-slate-50 to-gray-50",
        label: "Outro",
      };
  }
};
