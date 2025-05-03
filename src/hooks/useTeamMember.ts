
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { taskApi, epicApi, userApi } from "@/services/api";
import { User, Epic, Task } from "@/models/database";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar_url?: string; // Using avatar_url to match User model
  initials: string;
  activeTasks: number;
  completedTasks: number;
  epics: string[];
}

interface PerformanceMetrics {
  estimatedDays: number;
  actualDays: number;
  timeEfficiency: number;
  completionRate: number;
  workload: number;
}

export function useTeamMember(userId: string | undefined) {
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId || ''),
    enabled: !!userId,
  });

  // Fetch tasks assigned to this user
  const { data: userTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'user', userId],
    queryFn: () => taskApi.getAll().then(tasks => 
      tasks.filter(task => task.assignee_id === userId)
    ),
    enabled: !!userId,
  });

  // Fetch all epics to identify which ones the user is working on
  const { data: allEpics = [], isLoading: isLoadingEpics } = useQuery({
    queryKey: ['epics'],
    queryFn: () => epicApi.getAll(),
  });

  const isLoading = isLoadingUser || isLoadingTasks || isLoadingEpics;

  // Process the data to create our team member profile with defensive coding
  const teamMember: TeamMember | undefined = userData ? {
    id: userData.id,
    name: userData.name || "Unknown User",
    role: userData.role || "No Role Assigned",
    email: userData.email || "no-email@example.com",
    avatar_url: userData.avatar_url,
    initials: getUserInitials(userData),
    activeTasks: userTasks.filter(task => task.status !== 'done').length,
    completedTasks: userTasks.filter(task => task.status === 'done').length,
    epics: getEpicTitles(userTasks, allEpics)
  } : undefined;

  // Calculate metrics
  const performanceMetrics: PerformanceMetrics = calculatePerformanceMetrics(userTasks);

  return { 
    teamMember, 
    performanceMetrics, 
    isLoading,
    userTasks,
    allEpics
  };
}

// Helper function to get user initials
function getUserInitials(user: User): string {
  if (!user.name) return "??";
  
  const nameParts = user.name.split(' ');
  if (nameParts.length === 0) return "??";
  
  return nameParts.length > 1 && nameParts[1] && nameParts[1][0]
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : nameParts[0][0] ? `${nameParts[0][0]}` : "??";
}

// Helper function to get epic titles
function getEpicTitles(tasks: Task[], epics: Epic[]): string[] {
  const userEpicIds = new Set(
    tasks
      .filter(task => task.epic_id)
      .map(task => task.epic_id as string)
  );
  
  return epics
    .filter(epic => userEpicIds.has(epic.id))
    .map(epic => epic.title);
}

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(tasks: Task[]): PerformanceMetrics {
  if (tasks.length === 0) {
    return {
      estimatedDays: 0,
      actualDays: 0,
      timeEfficiency: 100,
      completionRate: 0,
      workload: 0
    };
  }

  // Calculate estimated vs actual days for completed tasks
  let totalEstimatedDays = 0;
  let totalActualDays = 0;
  
  const completedTasks = tasks.filter(task => task.status === 'done');
  
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
  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;
  
  // Calculate current workload based on active tasks vs capacity
  // Assuming average capacity is 5 tasks at a time
  const activeTasks = tasks.filter(task => task.status !== 'done').length;
  const workload = Math.min(Math.round((activeTasks / 5) * 100), 100);
  
  return {
    estimatedDays: totalEstimatedDays,
    actualDays: totalActualDays,
    timeEfficiency,
    completionRate,
    workload
  };
}
