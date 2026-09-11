import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--card-bg)]/50 border-dashed border-2 shadow-none">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)]">
            <Icon className="h-8 w-8 text-[var(--muted-fg)]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-[var(--muted-fg)] max-w-xs mx-auto">
              {description}
            </p>
          </div>
          {actionLabel && actionHref && (
            <Button asChild className="mt-4">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
