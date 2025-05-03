
# DevFlow Database Schema

This document outlines the database schema for the DevFlow application.

## Tables

### Users

| Column Name | Type | Description |
|-------------|------|-------------|
| id | string | Primary key |
| name | string | User's full name |
| email | string | User's email address (unique) |
| avatar_url | string | URL to user's avatar image (optional) |
| role | enum | User role: 'admin', 'member', or 'viewer' |
| created_at | timestamp | When the user was created |

### Epics

| Column Name | Type | Description |
|-------------|------|-------------|
| id | string | Primary key |
| title | string | Epic title |
| description | string | Detailed description of the epic |
| estimation | number | Estimated duration in days |
| capability_category | enum | Category: 'frontend', 'backend', 'infrastructure', 'data', 'security', 'other' |
| status | enum | Current status: 'planning', 'in_progress', 'completed' |
| created_by | string | Foreign key to users.id |
| created_at | timestamp | When the epic was created |
| updated_at | timestamp | When the epic was last updated |

### Tasks

| Column Name | Type | Description |
|-------------|------|-------------|
| id | string | Primary key |
| title | string | Task title |
| description | string | Detailed description of the task |
| epic_id | string | Foreign key to epics.id (optional) |
| assignee_id | string | Foreign key to users.id (optional) |
| estimation | number | Estimated duration in days |
| priority | enum | Priority level: 'low', 'medium', 'high' |
| status | enum | Current status: 'backlog', 'ready', 'in_progress', 'review', 'done' |
| is_product_idea | boolean | Indicates if this is a product idea |
| created_by | string | Foreign key to users.id |
| created_at | timestamp | When the task was created |
| updated_at | timestamp | When the task was last updated |

### Product Ideas

| Column Name | Type | Description |
|-------------|------|-------------|
| id | string | Primary key |
| title | string | Product idea title |
| description | string | Detailed description of the product idea |
| estimation | number | Estimated size in days |
| priority | enum | Priority level: 'low', 'medium', 'high' |
| status | enum | Current status: 'proposed', 'under_review', 'approved', 'rejected', 'implemented' |
| created_by | string | Foreign key to users.id |
| created_at | timestamp | When the product idea was created |
| updated_at | timestamp | When the product idea was last updated |

### Product Idea Epic Links

| Column Name | Type | Description |
|-------------|------|-------------|
| id | string | Primary key |
| product_idea_id | string | Foreign key to product_ideas.id |
| epic_id | string | Foreign key to epics.id |
| created_at | timestamp | When the link was created |

## Relationships

- One user can create many epics, tasks, and product ideas (one-to-many)
- One user can be assigned to many tasks (one-to-many)
- One epic can contain many tasks (one-to-many)
- Product ideas can be linked to multiple epics (many-to-many)
- Epics can be linked to multiple product ideas (many-to-many)

## Views

### EpicWithTasks

Combines epic data with associated tasks and calculates progress metrics.

### UserWithTasks

Combines user data with their assigned tasks and calculates workload metrics.

### ProductIdeaWithEpics

Combines product idea data with associated epics and calculates implementation status.

## API Endpoints

### Epics

- `GET /api/epics` - Get all epics
- `GET /api/epics/:id` - Get a specific epic
- `POST /api/epics` - Create a new epic
- `PUT /api/epics/:id` - Update an epic
- `DELETE /api/epics/:id` - Delete an epic
- `GET /api/epics/:id/tasks` - Get all tasks for an epic

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/:id/status` - Update task status

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `GET /api/users/:id/tasks` - Get all tasks assigned to a user
- `PUT /api/users/:id` - Update user information

### Product Ideas

- `GET /api/product-ideas` - Get all product ideas
- `GET /api/product-ideas/:id` - Get a specific product idea
- `POST /api/product-ideas` - Create a new product idea
- `PUT /api/product-ideas/:id` - Update a product idea
- `DELETE /api/product-ideas/:id` - Delete a product idea
- `GET /api/product-ideas/:id/epics` - Get all epics linked to a product idea
- `POST /api/product-ideas/:id/epics/:epicId` - Link a product idea to an epic
- `DELETE /api/product-ideas/:id/epics/:epicId` - Unlink a product idea from an epic
