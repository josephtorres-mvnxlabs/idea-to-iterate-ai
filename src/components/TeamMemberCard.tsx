
import * as React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "@/models/database";
import { getInitialsFromName } from "@/services/formMapper";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar_url?: string;
  initials: string;
  activeTasks: number;
  completedTasks: number;
  epics: string[];
  ownedItems?: {
    products: number;
    epics: number;
    tasks: number;
  };
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  console.log("TeamMemberCard - member:", member);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="h-2 bg-devops-purple" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            {member.avatar_url ? (
              <AvatarImage src={member.avatar_url} alt={member.name} />
            ) : (
              <AvatarFallback className="bg-devops-purple text-white text-lg">
                {member.initials}
              </AvatarFallback>
            )}
          </Avatar>
          <h3 className="font-medium text-xl">{member.name}</h3>
          <p className="text-muted-foreground text-sm">{member.role}</p>
          <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
          
          <div className="flex gap-2 mt-4 mb-3">
            <div className="text-center">
              <p className="text-sm font-medium">{member.activeTasks}</p>
              <p className="text-xs text-muted-foreground">Active Tasks</p>
            </div>
            <div className="border-r mx-1" />
            <div className="text-center">
              <p className="text-sm font-medium">{member.completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="border-r mx-1" />
            <div className="text-center">
              <p className="text-sm font-medium">{member.epics.length}</p>
              <p className="text-xs text-muted-foreground">Epics</p>
            </div>
          </div>
          
          {member.ownedItems && (
            <div className="mt-3 bg-muted/30 p-2 rounded-md w-full">
              <p className="text-xs font-medium mb-1">Ownership</p>
              <div className="flex justify-around text-xs">
                <div>
                  <p className="font-medium">{member.ownedItems.products}</p>
                  <p className="text-muted-foreground">Products</p>
                </div>
                <div>
                  <p className="font-medium">{member.ownedItems.epics}</p>
                  <p className="text-muted-foreground">Epics</p>
                </div>
                <div>
                  <p className="font-medium">{member.ownedItems.tasks}</p>
                  <p className="text-muted-foreground">Tasks</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {member.epics.map((epic, index) => (
              <Badge key={`${member.id}-${index}`} variant="outline" className="text-xs">
                {epic.split(' ')[0]}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 p-4 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          asChild
        >
          <Link to={`/team/profile/${member.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
