import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-[var(--muted-fg)]">{title}</p>
          {icon && <div className="text-[var(--primary)] opacity-80">{icon}</div>}
        </div>
        
        <div>
          <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
          
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center text-xs">
              {trend && (
                <span
                  className={cn(
                    "flex items-center mr-2 font-medium",
                    trend === "up" ? "text-emerald-500" : "",
                    trend === "down" ? "text-rose-500" : "",
                    trend === "neutral" ? "text-amber-500" : ""
                  )}
                >
                  {trend === "up" && <ArrowUpIcon className="mr-1 h-3 w-3" />}
                  {trend === "down" && <ArrowDownIcon className="mr-1 h-3 w-3" />}
                  {trend === "neutral" && <MinusIcon className="mr-1 h-3 w-3" />}
                  {trendValue}
                </span>
              )}
              {subtitle && <span className="text-[var(--muted-fg)]">{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
