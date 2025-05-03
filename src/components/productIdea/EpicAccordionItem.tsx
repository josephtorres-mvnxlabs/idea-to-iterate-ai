
import * as React from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { EpicTaskTable } from "./EpicTaskTable";
import { Button } from "@/components/ui/button";
import { Unlink } from "lucide-react";

interface EpicWithTasks {
  id: string;
  title: string;
  description: string;
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

interface EpicAccordionItemProps {
  epic: EpicWithTasks;
  onUnlink?: () => void;
}

export function EpicAccordionItem({ epic, onUnlink }: EpicAccordionItemProps) {
  return (
    <AccordionItem key={epic.id} value={epic.id}>
      <div className="flex items-center justify-between">
        <AccordionTrigger className="flex-1 hover:no-underline">
          <div className="flex flex-col items-start text-left">
            <div className="font-medium">{epic.title}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {epic.completedTasks} of {epic.totalTasks} tasks completed ({epic.progress}%)
            </div>
          </div>
        </AccordionTrigger>
        {onUnlink && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUnlink();
            }}
            className="mr-2 text-muted-foreground hover:text-destructive"
            title="Unlink epic from this product idea"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}
      </div>
      <AccordionContent>
        <div className="pt-2 pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            {epic.description}
          </p>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Epic progress</span>
              <span>{epic.progress}%</span>
            </div>
            <Progress value={epic.progress} className="h-1.5" />
          </div>
          
          <EpicTaskTable tasks={epic.tasks} epicId={epic.id} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
