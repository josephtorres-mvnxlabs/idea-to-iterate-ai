
import { Epic, Task, User, ProductIdea } from "@/models/database";

// Sample users data for assignee dropdown
export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alex Smith",
    email: "alex@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=1",
    role: "admin",
    user_type: "developer", // Added user type
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    name: "Jamie Taylor",
    email: "jamie@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=2",
    role: "member",
    user_type: "product", // Added user type
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "user-3",
    name: "Morgan Lee",
    email: "morgan@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=3",
    role: "member",
    user_type: "scrum", // Added user type
    created_at: "2024-01-03T00:00:00Z",
  },
];

// Sample product ideas data
export const MOCK_PRODUCT_IDEAS: ProductIdea[] = [
  {
    id: "idea-1",
    title: "Mobile App Redesign",
    description: "Redesign the mobile app for better user experience and performance",
    estimation: 45,
    priority: "high",
    status: "approved",
    owner_id: "user-1",
    team_members: ["user-2", "user-3"],
    created_by: "user-1",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "idea-2",
    title: "AI-powered Recommendations",
    description: "Implement AI-driven product recommendations across the platform",
    estimation: 30,
    priority: "medium",
    status: "proposed",
    owner_id: "user-2",
    team_members: ["user-1"],
    created_by: "user-2",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "idea-3",
    title: "Marketplace Integration",
    description: "Add third-party marketplace integration for expanded product catalog",
    estimation: 60,
    priority: "low",
    status: "under_review",
    owner_id: "user-3",
    team_members: ["user-1", "user-2"],
    created_by: "user-3",
    created_at: "2024-03-20T00:00:00Z",
    updated_at: "2024-03-25T00:00:00Z",
  },
];

// Sample epics data
export const MOCK_EPICS: Epic[] = [
  {
    id: "epic-1",
    title: "Authentication System",
    description: "Implement biometric authentication and improve security",
    estimation: 14,
    capability_category: "security",
    status: "in_progress",
    created_by: "user-1",
    owner_id: "user-1",
    team_members: ["user-2", "user-3"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "epic-2",
    title: "Performance Optimization",
    description: "Identify and resolve performance bottlenecks across the platform",
    estimation: 21,
    capability_category: "infrastructure",
    status: "planning",
    created_by: "user-1",
    owner_id: "user-2", 
    team_members: ["user-1", "user-3"],
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "epic-3",
    title: "ML Recommendations",
    description: "Implement machine learning algorithms for personalized recommendations",
    estimation: 30,
    capability_category: "data",
    status: "planning",
    created_by: "user-2",
    owner_id: "user-3",
    team_members: ["user-1", "user-2"],
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
];

// Sample tasks data linked to the epics
export const MOCK_TASKS: Task[] = [
  // Epic 1 Tasks
  {
    id: "task-1",
    title: "Implement biometric authentication",
    description: "Add fingerprint and facial recognition to the login process",
    epic_id: "epic-1",
    assignee_id: "user-1",
    estimation: 5,
    priority: "high",
    status: "in_progress",
    is_product_idea: false,
    created_by: "user-1",
    owner_id: "user-1",
    team_members: ["user-2"],
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "task-2",
    title: "Security audit of authentication flow",
    description: "Perform penetration testing and security analysis",
    epic_id: "epic-1",
    assignee_id: "user-2",
    estimation: 3,
    priority: "high",
    status: "ready",
    is_product_idea: false,
    created_by: "user-1",
    owner_id: "user-2",
    team_members: ["user-1", "user-3"],
    created_at: "2024-01-11T00:00:00Z",
    updated_at: "2024-01-11T00:00:00Z",
  },
  {
    id: "task-3",
    title: "Update authentication documentation",
    description: "Document the new authentication system for developers and users",
    epic_id: "epic-1",
    assignee_id: "user-3",
    estimation: 2,
    priority: "medium",
    status: "ready",
    is_product_idea: false,
    created_by: "user-1",
    owner_id: "user-3",
    team_members: [],
    created_at: "2024-01-12T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z",
  },
  
  // Epic 2 Tasks
  {
    id: "task-4",
    title: "Database query optimization",
    description: "Optimize slow database queries and add appropriate indexes",
    epic_id: "epic-2",
    assignee_id: "user-2",
    estimation: 4,
    priority: "high",
    status: "in_progress",
    is_product_idea: false,
    created_by: "user-1",
    owner_id: "user-2",
    team_members: ["user-1"],
    created_at: "2024-02-10T00:00:00Z",
    updated_at: "2024-02-10T00:00:00Z",
  },
  {
    id: "task-5",
    title: "Frontend asset bundling improvements",
    description: "Optimize JS and CSS bundle sizes",
    epic_id: "epic-2",
    assignee_id: "user-3",
    estimation: 3,
    priority: "medium",
    status: "done",
    is_product_idea: false,
    created_by: "user-1",
    owner_id: "user-3",
    team_members: [],
    created_at: "2024-02-11T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
  },
  
  // Epic 3 Tasks
  {
    id: "task-6",
    title: "Implement recommendation algorithm",
    description: "Develop ML algorithm for product recommendations based on user behavior",
    epic_id: "epic-3",
    assignee_id: "user-1",
    estimation: 8,
    priority: "high",
    status: "backlog",
    is_product_idea: false,
    created_by: "user-2",
    owner_id: "user-1",
    team_members: ["user-3"],
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-03-10T00:00:00Z",
  },
  {
    id: "task-7",
    title: "Data pipeline for ML training",
    description: "Set up data collection and processing pipeline for ML model training",
    epic_id: "epic-3",
    assignee_id: "user-2",
    estimation: 5,
    priority: "medium",
    status: "backlog",
    is_product_idea: false,
    created_by: "user-2",
    owner_id: "user-2",
    team_members: ["user-1"],
    created_at: "2024-03-11T00:00:00Z",
    updated_at: "2024-03-11T00:00:00Z",
  },
  
  // Tasks with no epic
  {
    id: "task-8",
    title: "Bug fix: User profile image upload",
    description: "Fix the issue with user profile image upload failing on certain file types",
    epic_id: undefined,
    assignee_id: "user-3",
    estimation: 1,
    priority: "medium",
    status: "in_progress",
    is_product_idea: false,
    created_by: "user-3",
    owner_id: "user-3",
    team_members: [],
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2024-04-01T00:00:00Z",
  },
  {
    id: "task-9",
    title: "Update privacy policy",
    description: "Update privacy policy to comply with new regulations",
    epic_id: undefined,
    assignee_id: "user-1",
    estimation: 2,
    priority: "low",
    status: "review",
    is_product_idea: false,
    created_by: "user-1",
    owner_id: "user-1",
    team_members: ["user-2"],
    created_at: "2024-04-02T00:00:00Z",
    updated_at: "2024-04-02T00:00:00Z",
  },
];
