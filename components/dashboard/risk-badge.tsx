import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types/transaction"

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  showScore?: boolean
}

export function RiskBadge({ level, score, showScore = false }: RiskBadgeProps) {
  const colors = {
    LOW: "bg-success/20 text-success border-success/30",
    MEDIUM: "bg-warning/20 text-warning border-warning/30",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    CRITICAL: "bg-destructive/20 text-destructive border-destructive/30",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors[level],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "LOW" && "bg-success",
          level === "MEDIUM" && "bg-warning",
          level === "HIGH" && "bg-orange-400",
          level === "CRITICAL" && "bg-destructive",
        )}
      />
      {level}
      {showScore && score !== undefined && (
        <span className="text-[10px] opacity-70">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  )
}
