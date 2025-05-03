
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProductIdea, User } from "@/models/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitialsFromName } from "@/services/formMapper";
import { toast } from "sonner";

interface ProductIdeaBoardProps {
  ideas: (ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
    owner?: User;
    teamMembers?: User[];
  })[];
  onIdeaClick?: (idea: ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
    owner?: User;
    teamMembers?: User[];
  }) => void;
  onStatusChange?: (ideaId: string, newStatus: ProductIdea["status"]) => void;
}

type StatusColumnType = 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';

const statusColumns: { key: StatusColumnType; label: string }[] = [
  { key: 'proposed', label: 'Proposed' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'implemented', label: 'Implemented' }
];

export function ProductIdeaBoard({ ideas, onIdeaClick, onStatusChange }: ProductIdeaBoardProps) {
  // Group ideas by status
  const ideasByStatus = React.useMemo(() => {
    const grouped = {} as Record<StatusColumnType, typeof ideas>;
    
    statusColumns.forEach(({ key }) => {
      grouped[key] = ideas.filter(idea => idea.status === key);
    });
    
    return grouped;
  }, [ideas]);
  
  // Handle drag over for columns
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-muted/50");
  };
  
  // Handle drag leave for columns
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("bg-muted/50");
  };
  
  // Handle drop for columns
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: StatusColumnType) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-muted/50");
    
    const ideaId = e.dataTransfer.getData("text/plain");
    if (ideaId && onStatusChange) {
      console.log(`Moving idea ${ideaId} to ${status}`);
      onStatusChange(ideaId, status);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-auto pb-4">
      {statusColumns.map(column => (
        <div 
          key={column.key} 
          className="col-span-1"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.key)}
        >
          <Card className="h-full transition-colors">
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
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", idea.id);
    e.currentTarget.classList.add("opacity-50");
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
  };
  
  return (
    <Card 
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
          
          {/* Owner and team section */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex -space-x-2 overflow-hidden">
              {idea.owner && (
                <div className="relative" title={`Owner: ${idea.owner.name}`}>
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    {idea.owner.avatar_url ? (
                      <AvatarImage src={idea.owner.avatar_url} alt={idea.owner.name} />
                    ) : (
                      <AvatarFallback className="bg-devops-purple text-white text-xs">
                        {getInitialsFromName(idea.owner.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                </div>
              )}
              
              {idea.teamMembers && idea.teamMembers.slice(0, 2).map((member, i) => (
                <Avatar key={member.id} className="h-6 w-6 ring-2 ring-background">
                  {member.avatar_url ? (
                    <AvatarImage src={member.avatar_url} alt={member.name} />
                  ) : (
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitialsFromName(member.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
              
              {idea.teamMembers && idea.teamMembers.length > 2 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted ring-2 ring-background text-xs">
                  +{idea.teamMembers.length - 2}
                </div>
              )}
            </div>
            
            <span className="text-xs text-muted-foreground">
              {idea.estimation} days
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
