import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("skeleton-enhanced", className)} {...props} />);
}

export { Skeleton }
