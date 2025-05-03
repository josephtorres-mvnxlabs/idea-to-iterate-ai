
import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { taskApi, epicApi, userApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Task, Epic, User } from "@/models/database";
import { differenceInDays } from "date-fns";

// Define types for our chart data
interface DeveloperPerformance {
  name: string;
  estimatedDays: number;
  actualDays: number;
  tasks: number;
}

interface EpicProgress {
  name: string;
  completed: number;
  remaining: number;
  total: number;
}

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

interface TimelineDataPoint {
  day: string;
  epic1?: number;
  epic2?: number;
  epic3?: number;
  epic1Name?: string;
  epic2Name?: string;
  epic3Name?: string;
  [key: string]: string | number | undefined; // Index signature to allow dynamic properties
}

const Reports = () => {
  const [timeframe, setTimeframe] = React.useState("lastMonth");

  // Fetch all necessary data
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => taskApi.getAll(),
  });

  const { data: epics = [], isLoading: isLoadingEpics } = useQuery({
    queryKey: ['epics'],
    queryFn: () => epicApi.getAll(),
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll(),
  });

  const isLoading = isLoadingTasks || isLoadingEpics || isLoadingUsers;

  // Process data for charts once loaded
  const developerPerformance = React.useMemo(() => {
    if (isLoading) return [];
    
    // Group tasks by assignee
    const assignedTasks = tasks.filter(task => task.assignee_id && task.completion_date);
    const tasksByDeveloper = new Map();
    
    assignedTasks.forEach(task => {
      if (!tasksByDeveloper.has(task.assignee_id)) {
        tasksByDeveloper.set(task.assignee_id, []);
      }
      tasksByDeveloper.get(task.assignee_id).push(task);
    });
    
    // Calculate metrics per developer
    return Array.from(tasksByDeveloper.entries()).map(([developerId, devTasks]) => {
      const developer = users.find(user => user.id === developerId);
      const name = developer?.name ? developer.name.split(' ')[0] + ' ' + developer.name.split(' ')[1]?.charAt(0) + '.' : 'Unknown';
      
      let totalEstimated = 0;
      let totalActual = 0;
      
      devTasks.forEach(task => {
        if (task.estimation) totalEstimated += task.estimation;
        
        if (task.assigned_date && task.completion_date) {
          const startDate = new Date(task.assigned_date);
          const endDate = new Date(task.completion_date);
          const actualDays = differenceInDays(endDate, startDate) || 1; // Ensure minimum 1 day
          totalActual += actualDays;
        }
      });
      
      return {
        name,
        estimatedDays: totalEstimated,
        actualDays: totalActual,
        tasks: devTasks.length
      };
    }).sort((a, b) => b.tasks - a.tasks).slice(0, 5); // Take top 5 by task count
  }, [tasks, users, isLoading]);

  const epicProgress = React.useMemo(() => {
    if (isLoading) return [];
    
    // For each epic, calculate completed and remaining tasks
    const epicData = epics.map(epic => {
      const epicTasks = tasks.filter(task => task.epic_id === epic.id);
      const completedTasks = epicTasks.filter(task => task.status === 'done');
      
      return {
        name: epic.title,
        completed: completedTasks.length,
        remaining: epicTasks.length - completedTasks.length,
        total: epicTasks.length
      };
    }).filter(epic => epic.total > 0) // Only include epics with tasks
      .sort((a, b) => b.total - a.total) // Sort by total tasks
      .slice(0, 3); // Take top 3 epics
      
    return epicData;
  }, [tasks, epics, isLoading]);

  const taskStatusData = React.useMemo(() => {
    if (isLoading) return [];
    
    // Count tasks by status
    const todoCount = tasks.filter(task => 
      task.status === 'backlog' || task.status === 'ready').length;
    
    const inProgressCount = tasks.filter(task => 
      task.status === 'in_progress' || task.status === 'review').length;
    
    const doneCount = tasks.filter(task => 
      task.status === 'done').length;
    
    return [
      { name: 'To Do', value: todoCount, color: '#8E9196' },
      { name: 'In Progress', value: inProgressCount, color: '#F59E0B' },
      { name: 'Done', value: doneCount, color: '#10B981' },
    ];
  }, [tasks, isLoading]);

  const timelineData = React.useMemo(() => {
    if (isLoading) return [];
    
    // We need to calculate tasks completed per day for last 5 days
    // Group tasks by epic and day of completion
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const result: TimelineDataPoint[] = daysOfWeek.map(day => ({ day }));
    
    // Get top 3 epics by task count
    const topEpics = epicProgress.slice(0, 3);
    
    // For each epic, distribute completed tasks across days (simulated distribution)
    // In a real app, we would use actual completion dates
    topEpics.forEach((epic, index) => {
      const epicNumber = index + 1;
      const epicKey = `epic${epicNumber}` as keyof TimelineDataPoint;
      const nameKey = `epic${epicNumber}Name` as keyof TimelineDataPoint;
      const totalCompleted = epic.completed;
      
      // Add epic name to result for legend
      if (index === 0 && result.length > 0) {
        result[0][nameKey] = epic.name;
      }
      
      // Distribute completed tasks across days (mock distribution)
      let remaining = totalCompleted;
      for (let i = 0; i < daysOfWeek.length; i++) {
        const day = result[i];
        const dayCompletions = Math.round(totalCompleted / 5) + (i % 2); // Some variation
        const value = Math.min(dayCompletions, remaining);
        day[epicKey] = value;
        remaining -= value;
      }
    });
    
    return result;
  }, [epicProgress, isLoading]);

  // Define colors for the charts
  const COLORS = ['#8E9196', '#F59E0B', '#10B981'];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Reports</h1>
            <p className="text-muted-foreground">
              Visualize project progress, performance, and resource allocation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              defaultValue={timeframe} 
              onValueChange={setTimeframe}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastWeek">Last Week</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Developer Performance</TabsTrigger>
            <TabsTrigger value="epics">Epic Progress</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Epic Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={epicProgress}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                        <Bar dataKey="remaining" stackId="a" fill="#8E9196" name="Remaining" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Developer Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={developerPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="estimatedDays" fill="#9b87f5" name="Estimated Days" />
                      <Bar dataKey="actualDays" fill="#1EAEDB" name="Actual Days" />
                      <Bar dataKey="tasks" fill="#D6BCFA" name="Tasks Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="epics">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Epic Progress Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={epicProgress}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10B981" name="Completed Tasks" />
                      <Bar dataKey="remaining" fill="#8E9196" name="Remaining Tasks" />
                      <Bar dataKey="total" fill="#9b87f5" name="Total Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Task Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {timelineData[0]?.epic1Name && (
                        <Line type="monotone" dataKey="epic1" stroke="#9b87f5" name={timelineData[0].epic1Name} />
                      )}
                      {timelineData[0]?.epic2Name && (
                        <Line type="monotone" dataKey="epic2" stroke="#1EAEDB" name={timelineData[0].epic2Name} />
                      )}
                      {timelineData[0]?.epic3Name && (
                        <Line type="monotone" dataKey="epic3" stroke="#D6BCFA" name={timelineData[0].epic3Name} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Reports;
