
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { User } from "@/models/database";

interface TeamMemberHeaderProps {
  name: string;
  role: string;
  email: string;
  avatar?: string; // We'll keep the prop name as avatar for component API consistency
  initials: string;
  activeTasks: number;
  completedTasks: number;
  epicCount: number;
}

export function TeamMemberHeader({
  name,
  role,
  email,
  avatar, // This is now coming from avatar_url from the User model
  initials,
  activeTasks,
  completedTasks,
  epicCount
}: TeamMemberHeaderProps) {
  return (
    <div className="p-6 flex flex-col items-center text-center">
      <div className="h-2 bg-devops-purple w-full absolute top-0 left-0 right-0" />
      <Avatar className="h-24 w-24 my-6">
        {avatar ? (
          <AvatarImage src={avatar} alt={name} />
        ) : (
          <AvatarFallback className="bg-devops-purple text-white text-xl">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <h1 className="text-2xl font-bold mb-1">{name}</h1>
      <p className="text-muted-foreground mb-2">{role}</p>
      
      <div className="flex items-center mt-2 text-sm">
        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
        <a href={`mailto:${email}`} className="text-devops-purple hover:underline">
          {email}
        </a>
      </div>
      
      <div className="flex gap-4 mt-6 mb-3">
        <div className="text-center">
          <p className="text-2xl font-medium">{activeTasks}</p>
          <p className="text-xs text-muted-foreground">Active Tasks</p>
        </div>
        <div className="border-r mx-1" />
        <div className="text-center">
          <p className="text-2xl font-medium">{completedTasks}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="border-r mx-1" />
        <div className="text-center">
          <p className="text-2xl font-medium">{epicCount}</p>
          <p className="text-xs text-muted-foreground">Epics</p>
        </div>
      </div>
    </div>
  );
}
