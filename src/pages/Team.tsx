
import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TeamMemberCard } from "@/components/TeamMemberCard";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  initials: string;
  activeTasks: number;
  completedTasks: number;
  epics: string[];
}

const SAMPLE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    role: "Frontend Developer",
    email: "alex.j@company.com",
    initials: "AJ",
    activeTasks: 3,
    completedTasks: 12,
    epics: ["User Authentication System Overhaul", "Performance Optimization Initiative"]
  },
  {
    id: "user-2",
    name: "Maria Garcia",
    role: "UI/UX Designer",
    email: "maria.g@company.com",
    initials: "MG",
    activeTasks: 2,
    completedTasks: 8,
    epics: ["ML-Driven Recommendations"]
  },
  {
    id: "user-3",
    name: "Tyler Smith",
    role: "DevOps Engineer",
    email: "tyler.s@company.com",
    initials: "TS",
    activeTasks: 0,
    completedTasks: 15,
    epics: ["Performance Optimization Initiative"]
  },
  {
    id: "user-4",
    name: "Sam Wong",
    role: "Backend Developer",
    email: "sam.w@company.com",
    initials: "SW",
    activeTasks: 4,
    completedTasks: 7,
    epics: ["User Authentication System Overhaul"]
  },
  {
    id: "user-5",
    name: "Jamie Lee",
    role: "Data Scientist",
    email: "jamie.l@company.com",
    initials: "JL",
    activeTasks: 1,
    completedTasks: 6,
    epics: ["ML-Driven Recommendations"]
  },
  {
    id: "user-6",
    name: "Robin Chen",
    role: "Product Manager",
    email: "robin.c@company.com",
    initials: "RC",
    activeTasks: 0,
    completedTasks: 9,
    epics: ["User Authentication System Overhaul", "ML-Driven Recommendations"]
  }
];

const Team = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredTeamMembers = SAMPLE_TEAM_MEMBERS.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Team</h1>
            <p className="text-muted-foreground">
              Manage team members and track their workload and performance
            </p>
          </div>
          <div>
            <Button className="bg-devops-purple hover:bg-devops-purple-dark">
              <Plus className="h-4 w-4 mr-1" />
              Add Team Member
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members by name or role..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Team Workload</CardTitle>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Reassign Tasks
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Active Tasks</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Epics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-devops-purple-light text-white text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.activeTasks > 0 ? "outline" : "secondary"} className="bg-devops-yellow/20 border-devops-yellow text-xs">
                        {member.activeTasks}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.completedTasks}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.epics.map((epic) => (
                          <HoverCard key={`${member.id}-${epic}`}>
                            <HoverCardTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">
                                {epic.substring(0, 15)}{epic.length > 15 ? "..." : ""}
                              </Badge>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">{epic}</h4>
                                <p className="text-xs">
                                  This epic contains multiple tasks and features that {member.name} is working on.
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Team;
