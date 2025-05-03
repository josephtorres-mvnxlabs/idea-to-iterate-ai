
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface UserEpicsListProps {
  epics: string[];
}

export function UserEpicsList({ epics }: UserEpicsListProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Current Epics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {epics.length > 0 ? (
          <div className="space-y-3">
            {epics.map((epic, index) => (
              <div key={index} className="border rounded-md p-3 bg-muted/20">
                <div className="flex justify-between">
                  <h3 className="font-medium">{epic}</h3>
                  <Badge variant="outline" className="bg-devops-yellow/20 border-devops-yellow text-xs">
                    In Progress
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-6">No epics assigned</p>
        )}
      </CardContent>
    </>
  );
}
