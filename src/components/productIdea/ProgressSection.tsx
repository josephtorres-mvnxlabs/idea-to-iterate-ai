
import * as React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressSectionProps {
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

export function ProgressSection({ progress, completedTasks, totalTasks }: ProgressSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Implementation Progress</h3>
      <div className="flex justify-between text-sm mb-2">
        <span>Overall completion</span>
        <span className="font-medium">
          {progress}% ({completedTasks} of {totalTasks} tasks)
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
