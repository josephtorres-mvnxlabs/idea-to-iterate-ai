
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Calendar, BarChart2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { taskApi, epicApi, userApi } from "@/services/api";
import { User, Epic, Task } from "@/models/database";
import { differenceInDays } from "date-fns";

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

// This is just used as fallback when API fails
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

const TeamMemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getById(id || ''),
    enabled: !!id,
  });

  // Fetch tasks assigned to this user
  const { data: userTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'user', id],
    queryFn: () => taskApi.getAll().then(tasks => 
      tasks.filter(task => task.assignee_id === id)
    ),
    enabled: !!id,
  });

  // Fetch all epics to identify which ones the user is working on
  const { data: allEpics = [], isLoading: isLoadingEpics } = useQuery({
    queryKey: ['epics'],
    queryFn: () => epicApi.getAll(),
  });

  const isLoading = isLoadingUser || isLoadingTasks || isLoadingEpics;

  // Process the data to create our team member profile
  const teamMember = React.useMemo(() => {
    // If loading or no data yet, use sample data as fallback
    if (isLoading || !userData) {
      return SAMPLE_TEAM_MEMBERS.find(member => member.id === id);
    }

    // Get active and completed tasks
    const activeTasks = userTasks.filter(task => 
      task.status !== 'done'
    ).length;
    
    const completedTasks = userTasks.filter(task => 
      task.status === 'done'
    ).length;

    // Get epics this user is working on
    const userEpicIds = new Set(
      userTasks
        .filter(task => task.epic_id)
        .map(task => task.epic_id as string)
    );
    
    const userEpics = allEpics
      .filter(epic => userEpicIds.has(epic.id))
      .map(epic => epic.title);

    // Calculate user initials - Fixed to handle undefined name
    let initials = "??";
    if (userData.name) {
      const nameParts = userData.name.split(' ');
      initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}` 
        : `${nameParts[0][0]}`;
    }

    return {
      id: userData.id,
      name: userData.name || "Unknown User",
      role: userData.role || "No Role Assigned",
      email: userData.email || "no-email@example.com",
      avatar: userData.avatar_url,
      initials: initials,
      activeTasks,
      completedTasks,
      epics: userEpics
    };
  }, [id, userData, userTasks, allEpics, isLoading]);

  // Calculate updated performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (isLoading || !teamMember || userTasks.length === 0) {
      return {
        estimatedDays: 14,
        actualDays: 12,
        timeEfficiency: 114,
        completionRate: 92,
        workload: 65
      };
    }

    // Calculate estimated vs actual days for completed tasks
    let totalEstimatedDays = 0;
    let totalActualDays = 0;
    
    const completedTasks = userTasks.filter(task => task.status === 'done');
    
    completedTasks.forEach(task => {
      // Use task's estimation field as the number of estimated days
      totalEstimatedDays += task.estimation;
      
      // Calculate actual days based on created_at and updated_at dates
      if (task.created_at && task.updated_at) {
        const created = new Date(task.created_at);
        const completed = new Date(task.updated_at);
        const days = Math.max(1, differenceInDays(completed, created));
        totalActualDays += days;
      }
    });
    
    // Calculate time efficiency percentage (estimated vs actual)
    // Higher than 100% means faster than estimated, lower means slower
    const timeEfficiency = totalEstimatedDays > 0 ? 
      Math.round((totalEstimatedDays / Math.max(1, totalActualDays)) * 100) : 100;
    
    // Calculate task completion rate
    const completionRate = userTasks.length > 0
      ? Math.round((teamMember.completedTasks / userTasks.length) * 100)
      : 0;
    
    // Calculate current workload based on active tasks vs capacity
    // Assuming average capacity is 5 tasks at a time
    const workload = Math.min(Math.round((teamMember.activeTasks / 5) * 100), 100);
    
    return {
      estimatedDays: totalEstimatedDays,
      actualDays: totalActualDays,
      timeEfficiency,
      completionRate,
      workload
    };
  }, [isLoading, teamMember, userTasks]);
  
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
  
  if (!teamMember) {
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
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-2 bg-devops-purple w-full absolute top-0 left-0 right-0" />
              <Avatar className="h-24 w-24 my-6">
                {teamMember.avatar ? (
                  <AvatarImage src={teamMember.avatar} alt={teamMember.name} />
                ) : (
                  <AvatarFallback className="bg-devops-purple text-white text-xl">
                    {teamMember.initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <h1 className="text-2xl font-bold mb-1">{teamMember.name}</h1>
              <p className="text-muted-foreground mb-2">{teamMember.role}</p>
              
              <div className="flex items-center mt-2 text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${teamMember.email}`} className="text-devops-purple hover:underline">
                  {teamMember.email}
                </a>
              </div>
              
              <div className="flex gap-4 mt-6 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-medium">{teamMember.activeTasks}</p>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                </div>
                <div className="border-r mx-1" />
                <div className="text-center">
                  <p className="text-2xl font-medium">{teamMember.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="border-r mx-1" />
                <div className="text-center">
                  <p className="text-2xl font-medium">{teamMember.epics.length}</p>
                  <p className="text-xs text-muted-foreground">Epics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Current Epics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamMember.epics.length > 0 ? (
                  <div className="space-y-3">
                    {teamMember.epics.map((epic) => (
                      <div key={epic} className="border rounded-md p-3 bg-muted/20">
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
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Time Efficiency</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceMetrics.estimatedDays} est. days vs {performanceMetrics.actualDays} actual days
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${performanceMetrics.timeEfficiency >= 100 ? 'bg-devops-green' : 'bg-devops-yellow'}`}
                        style={{ width: `${Math.min(Math.max(performanceMetrics.timeEfficiency, 20), 150)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-muted-foreground">
                        {performanceMetrics.timeEfficiency}% {performanceMetrics.timeEfficiency >= 100 ? 'faster than estimated' : 'of estimated time'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Task Completion Rate</span>
                      <span className="text-sm text-muted-foreground">{performanceMetrics.completionRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-devops-green h-2.5 rounded-full" 
                        style={{ width: `${performanceMetrics.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Current Workload</span>
                      <span className="text-sm text-muted-foreground">{performanceMetrics.workload}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-devops-yellow h-2.5 rounded-full" 
                        style={{ width: `${performanceMetrics.workload}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamMemberProfile;
