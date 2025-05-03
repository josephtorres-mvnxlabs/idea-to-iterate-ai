
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EpicTaskTableProps {
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
}

export function EpicTaskTable({ tasks }: EpicTaskTableProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Tasks</h4>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Task
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.priority}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
