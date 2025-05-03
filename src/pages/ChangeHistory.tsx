
import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import ChangeLogViewer from '../components/ChangeLogViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityType } from '@/models/changeLog';

const ChangeHistory = () => {
  const [entityType, setEntityType] = useState<EntityType | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'all' | 'by-entity' | 'by-user'>('all');
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Change History</h1>
        </div>
        
        <Tabs defaultValue="all" onValueChange={(value) => setViewMode(value as any)}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Changes</TabsTrigger>
              <TabsTrigger value="by-entity">By Entity Type</TabsTrigger>
              <TabsTrigger value="by-user">By User</TabsTrigger>
            </TabsList>
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <TabsContent value="all">
                <ChangeLogViewer limit={50} />
              </TabsContent>
              
              <TabsContent value="by-entity">
                <div className="mb-6">
                  <Select 
                    onValueChange={(value) => setEntityType(value as EntityType)} 
                    value={entityType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="epic">Epics</SelectItem>
                      <SelectItem value="task">Tasks</SelectItem>
                      <SelectItem value="product_idea">Product Ideas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {entityType ? (
                  <ChangeLogViewer entityType={entityType} limit={50} />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select an entity type to view its change history
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="by-user">
                <div className="text-center text-gray-500 py-8">
                  User selection will be implemented in a future update.
                  For now, all user changes are displayed together.
                </div>
                <ChangeLogViewer limit={50} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ChangeHistory;
