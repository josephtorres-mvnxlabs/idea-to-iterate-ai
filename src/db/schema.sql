
-- Database Schema for DevFlow Application

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    user_type TEXT NOT NULL CHECK (user_type IN ('developer', 'product', 'scrum', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Epics Table
CREATE TABLE IF NOT EXISTS epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimation INTEGER NOT NULL,
    capability_category TEXT NOT NULL CHECK (capability_category IN ('frontend', 'backend', 'infrastructure', 'data', 'security', 'other')),
    status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed')),
    created_by UUID NOT NULL REFERENCES users(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Junction Table (for epic team members)
CREATE TABLE IF NOT EXISTS epic_team_members (
    epic_id UUID NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (epic_id, user_id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_type TEXT CHECK (assignee_type IN ('developer', 'product', 'scrum', 'other')),
    owner_id UUID NOT NULL REFERENCES users(id),
    estimation INTEGER NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('backlog', 'ready', 'in_progress', 'review', 'done')),
    is_product_idea BOOLEAN NOT NULL DEFAULT false,
    assigned_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Junction Table (for task team members)
CREATE TABLE IF NOT EXISTS task_team_members (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- Product Ideas Table
CREATE TABLE IF NOT EXISTS product_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimation INTEGER NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('proposed', 'under_review', 'approved', 'rejected', 'implemented')),
    owner_id UUID NOT NULL REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Idea Team Members Junction Table
CREATE TABLE IF NOT EXISTS product_idea_team_members (
    product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (product_idea_id, user_id)
);

-- Product Idea Epic Links (many-to-many relationship)
CREATE TABLE IF NOT EXISTS product_idea_epic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
    epic_id UUID NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_idea_id, epic_id)
);

-- Change Log Table
CREATE TABLE IF NOT EXISTS change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'epic', 'task', 'product_idea')),
    entity_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'status_change', 'link', 'unlink')),
    user_id UUID NOT NULL REFERENCES users(id),
    changes JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_product_idea_epic_links_product_idea_id ON product_idea_epic_links(product_idea_id);
CREATE INDEX IF NOT EXISTS idx_product_idea_epic_links_epic_id ON product_idea_epic_links(epic_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_entity_id_type ON change_logs(entity_id, entity_type);

-- Views for common queries

-- Epic with tasks
CREATE OR REPLACE VIEW epic_with_tasks AS
SELECT 
    e.*,
    COUNT(t.id) AS total_tasks_count,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS completed_tasks_count,
    CASE 
        WHEN COUNT(t.id) = 0 THEN 0
        ELSE ROUND((COUNT(CASE WHEN t.status = 'done' THEN 1 END)::NUMERIC / COUNT(t.id)::NUMERIC) * 100)
    END AS completion_percentage,
    COALESCE(SUM(t.estimation), 0) AS total_estimation
FROM 
    epics e
LEFT JOIN 
    tasks t ON e.id = t.epic_id
GROUP BY 
    e.id;

-- Product idea implementation status
CREATE OR REPLACE VIEW product_idea_implementation_status AS
WITH epic_tasks AS (
    SELECT 
        piel.product_idea_id,
        COUNT(t.id) AS total_tasks,
        COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS completed_tasks
    FROM 
        product_idea_epic_links piel
    LEFT JOIN 
        tasks t ON piel.epic_id = t.epic_id
    GROUP BY 
        piel.product_idea_id
)
SELECT 
    pi.*,
    COALESCE(et.total_tasks, 0) AS total_tasks_count,
    COALESCE(et.completed_tasks, 0) AS completed_tasks_count,
    CASE 
        WHEN COALESCE(et.total_tasks, 0) = 0 THEN 0
        ELSE ROUND((COALESCE(et.completed_tasks, 0)::NUMERIC / et.total_tasks::NUMERIC) * 100)
    END AS implementation_status
FROM 
    product_ideas pi
LEFT JOIN 
    epic_tasks et ON pi.id = et.product_idea_id;

-- User workload
CREATE OR REPLACE VIEW user_workload AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.avatar_url,
    u.role,
    u.user_type,
    COUNT(t.id) AS assigned_tasks_count,
    SUM(CASE WHEN t.status NOT IN ('done', 'review') THEN t.estimation ELSE 0 END) AS total_workload
FROM 
    users u
LEFT JOIN 
    tasks t ON u.id = t.assignee_id
GROUP BY 
    u.id, u.name, u.email, u.avatar_url, u.role, u.user_type;
