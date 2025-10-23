"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";

type ResponseProps = ComponentProps<"div"> & {
  children: string | React.ReactNode;
};

export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => (
    <div
      className={cn(
        "size-full prose prose-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
