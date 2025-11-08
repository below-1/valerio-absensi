import { FC, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

const PageHeader: FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      {/* Left side — title and description */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Right side — action buttons */}
      {actions && (
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader
