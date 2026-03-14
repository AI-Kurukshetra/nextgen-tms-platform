import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-9 w-9 overflow-hidden rounded-full", className)} {...props} />
));
Avatar.displayName = "Avatar";

function AvatarImage({
  className,
  src,
  alt = "",
}: {
  className?: string;
  src: string;
  alt?: string;
}) {
  return <Image src={src} alt={alt} fill className={cn("h-full w-full object-cover", className)} />;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700", className)}
      {...props}
    />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
