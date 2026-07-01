import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/shared/ButtonLink";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-6 text-center">
      {icon ? <div className="mb-4 text-muted-foreground">{icon}</div> : null}
      <h3 className="text-lg font-medium">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <ButtonLink href={actionHref} className="mt-4">
          {actionLabel}
        </ButtonLink>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
