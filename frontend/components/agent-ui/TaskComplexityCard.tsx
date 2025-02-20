import { Card, CardContent } from "@/components/ui/card"
import { InfoIcon } from "lucide-react"

export const TaskComplexityCard = () => {
  return (
    <Card className="bg-blue-50 border-blue-200 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-700">
            The task completion time varies based on its complexity. More complex tasks may require additional processing time to ensure accurate results. Note: closing of
            tabs or windows will end task execution.

          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskComplexityCard 