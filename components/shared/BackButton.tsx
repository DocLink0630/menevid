"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

export function BackButton({
  href,
  label = "Back",
  className,
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1.5",
        className,
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}
