import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamMemberHeader } from "@/components/profile/TeamMemberHeader";
import { UserEpicsList } from "@/components/profile/UserEpicsList";
import { PerformanceMetricsCard } from "@/components/profile/PerformanceMetricsCard";
import { useTeamMember } from "@/hooks/useTeamMember";

// This is just used as fallback when API fails
const SAMPLE_TEAM_MEMBERS = [
  {
    id: "user-1",
    name: "Alex Johnson",
    role: "Frontend Developer",
    email: "alex.j@company.com",
    avatar_url: "https://i.pravatar.cc/150?img=1",
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
    avatar_url: "https://i.pravatar.cc/150?img=2",
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
    avatar_url: "https://i.pravatar.cc/150?img=3",
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
    avatar_url: "https://i.pravatar.cc/150?img=4",
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
    avatar_url: "https://i.pravatar.cc/150?img=5",
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
    avatar_url: "https://i.pravatar.cc/150?img=6",
    initials: "RC",
    activeTasks: 0,
    completedTasks: 9,
    epics: ["User Authentication System Overhaul", "ML-Driven Recommendations"]
  }
];

const TeamMemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use our custom hook to fetch and process team member data
  const { teamMember, performanceMetrics, isLoading } = useTeamMember(id);
  
  console.log("Team Member Profile - teamMember:", teamMember);
  console.log("Team Member Profile - id param:", id);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-3xl space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded"></div>
            <div className="h-64 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If API fails or teamMember is undefined, use sample data as fallback
  const memberData = teamMember || SAMPLE_TEAM_MEMBERS.find(member => member.id === id);
  
  console.log("Team Member Profile - memberData:", memberData);
  
  if (!memberData) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold mb-4">Team member not found</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/team')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/team')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Team
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <TeamMemberHeader 
                name={memberData.name}
                role={memberData.role}
                email={memberData.email}
                avatar_url={memberData.avatar_url}
                initials={memberData.initials}
                activeTasks={memberData.activeTasks}
                completedTasks={memberData.completedTasks}
                epicCount={memberData.epics.length}
              />
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <UserEpicsList epics={memberData.epics} />
            </Card>
            
            <Card>
              <PerformanceMetricsCard 
                estimatedDays={performanceMetrics.estimatedDays}
                actualDays={performanceMetrics.actualDays}
                timeEfficiency={performanceMetrics.timeEfficiency}
                completionRate={performanceMetrics.completionRate}
                workload={performanceMetrics.workload}
              />
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamMemberProfile;
