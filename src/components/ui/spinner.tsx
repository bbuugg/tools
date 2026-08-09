import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Spinner = ({ className, ...props }: React.ComponentProps<"svg">) => {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }