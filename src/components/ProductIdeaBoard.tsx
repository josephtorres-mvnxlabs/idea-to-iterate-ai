
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProductIdea } from "@/models/database";

interface ProductIdeaBoardProps {
  ideas: (ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
  })[];
  onIdeaClick?: (idea: ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
  }) => void;
}

type StatusColumnType = 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';

const statusColumns: { key: StatusColumnType; label: string }[] = [
  { key: 'proposed', label: 'Proposed' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'implemented', label: 'Implemented' }
];

export function ProductIdeaBoard({ ideas, onIdeaClick }: ProductIdeaBoardProps) {
  // Group ideas by status
  const ideasByStatus = React.useMemo(() => {
    const grouped = {} as Record<StatusColumnType, typeof ideas>;
    
    statusColumns.forEach(({ key }) => {
      grouped[key] = ideas.filter(idea => idea.status === key);
    });
    
    return grouped;
  }, [ideas]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-auto pb-4">
      {statusColumns.map(column => (
        <div key={column.key} className="col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  {column.label}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {ideasByStatus[column.key].length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                {ideasByStatus[column.key].map(idea => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    onClick={() => onIdeaClick?.(idea)}
                  />
                ))}
                {ideasByStatus[column.key].length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No ideas in this status
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

interface IdeaCardProps {
  idea: ProductIdeaBoardProps['ideas'][0];
  onClick?: () => void;
}

function IdeaCard({ idea, onClick }: IdeaCardProps) {
  return (
    <Card 
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm line-clamp-2">{idea.title}</h4>
            <Badge variant="outline" className="text-[10px] ml-1 whitespace-nowrap">
              {idea.priority}
            </Badge>
          </div>
          
          {idea.totalTasks > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>{idea.progress}%</span>
              </div>
              <Progress value={idea.progress} className="h-1" />
            </div>
          )}
          
          {idea.linkedEpics.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {idea.linkedEpics.slice(0, 2).map(epic => (
                  <Badge key={epic} variant="secondary" className="text-[10px]">
                    {epic}
                  </Badge>
                ))}
                {idea.linkedEpics.length > 2 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{idea.linkedEpics.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
