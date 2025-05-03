
import * as React from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface PerformanceMetricsProps {
  estimatedDays: number;
  actualDays: number;
  timeEfficiency: number;
  completionRate: number;
  workload: number;
}

export function PerformanceMetricsCard({
  estimatedDays,
  actualDays,
  timeEfficiency,
  completionRate,
  workload
}: PerformanceMetricsProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Time Efficiency</span>
              <span className="text-sm text-muted-foreground">
                {estimatedDays} est. days vs {actualDays} actual days
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${timeEfficiency >= 100 ? 'bg-devops-green' : 'bg-devops-yellow'}`}
                style={{ width: `${Math.min(Math.max(timeEfficiency, 20), 150)}%` }}
              ></div>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">
                {timeEfficiency}% {timeEfficiency >= 100 ? 'faster than estimated' : 'of estimated time'}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Task Completion Rate</span>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-devops-green h-2.5 rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Current Workload</span>
              <span className="text-sm text-muted-foreground">{workload}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-devops-yellow h-2.5 rounded-full" 
                style={{ width: `${workload}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}
