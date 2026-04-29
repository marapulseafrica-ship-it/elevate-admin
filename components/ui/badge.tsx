import { cn } from "@/lib/utils";
const variants: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  active: "bg-green-100 text-green-700",
  trial: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-500",
  starter: "bg-blue-100 text-blue-700",
  basic: "bg-emerald-100 text-emerald-700",
  pro: "bg-orange-100 text-orange-700",
  premium: "bg-purple-100 text-purple-700",
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};
export function Badge({ variant = "default", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize", variants[variant] ?? variants.default, className)} {...props} />;
}
