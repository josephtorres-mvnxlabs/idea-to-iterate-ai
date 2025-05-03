
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/models/database";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductIdeaHeaderProps {
  title: string;
  description: string;
  status: string;
  priority: string;
  onClose: () => void;
  owner?: User;
  teamMembers?: User[];
}

export function ProductIdeaHeader({
  title,
  description,
  status,
  priority,
  onClose,
  owner,
  teamMembers = []
}: ProductIdeaHeaderProps) {
  const formattedStatus = status.replace('_', ' ');
  
  const getStatusColor = () => {
    switch (status) {
      case 'proposed':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'implemented':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center">
            <Badge className={`${getStatusColor()} mr-2`}>
              {formattedStatus}
            </Badge>
            <Badge variant="outline">{priority}</Badge>
          </div>
          <h2 className="text-2xl font-semibold mt-2">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-muted-foreground mt-3 mb-4">
        {description}
      </div>
      
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center">
          <TooltipProvider>
            <div className="flex items-center">
              {owner && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative mr-2">
                      <Avatar className="h-8 w-8 ring-2 ring-background border-2 border-devops-purple">
                        {owner.avatar_url ? (
                          <AvatarImage src={owner.avatar_url} alt={owner.name} />
                        ) : (
                          <AvatarFallback className="bg-devops-purple text-white">
                            {owner.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-1 ring-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Owner: {owner.name}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {teamMembers && teamMembers.length > 0 && (
                <div className="flex -space-x-2 overflow-hidden">
                  {teamMembers.slice(0, 3).map((member) => (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                          {member.avatar_url ? (
                            <AvatarImage src={member.avatar_url} alt={member.name} />
                          ) : (
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  
                  {teamMembers.length > 3 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-2 ring-background text-xs">
                          +{teamMembers.length - 3}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{teamMembers.length - 3} more team members</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
}
