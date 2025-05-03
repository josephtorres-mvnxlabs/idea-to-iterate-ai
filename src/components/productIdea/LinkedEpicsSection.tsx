
import * as React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { EpicAccordionItem } from "./EpicAccordionItem";

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

interface LinkedEpicsSectionProps {
  linkedEpicsData: EpicWithTasks[];
}

export function LinkedEpicsSection({ linkedEpicsData }: LinkedEpicsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Linked Epics</h3>
      
      {linkedEpicsData.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {linkedEpicsData.map((epic) => (
            <EpicAccordionItem key={epic.id} epic={epic} />
          ))}
        </Accordion>
      ) : (
        <Card className="bg-muted/40">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">No epics linked to this product idea yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
