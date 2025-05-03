
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Status,
  StatusEntityType, 
  StatusConfiguration
} from '@/models/statusConfig';
import * as statusConfigService from '@/services/statusConfigService';

// Form schema for creating/editing statuses
const statusFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid hex color').optional(),
  order: z.coerce.number().int().min(1, 'Order must be at least 1'),
  is_default: z.boolean().optional(),
  is_completed: z.boolean().optional()
});

type StatusFormValues = z.infer<typeof statusFormSchema>;

const entityTypeLabels: Record<StatusEntityType, string> = {
  product_idea: 'Product Ideas',
  epic: 'Epics',
  task: 'Tasks'
};

const StatusConfigurationPanel = () => {
  // State
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [statusConfigs, setStatusConfigs] = useState<StatusConfiguration[]>([]);
  const [currentEntityType, setCurrentEntityType] = useState<StatusEntityType>('task');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  
  // Form for adding/editing statuses
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366F1',
      order: 10,
      is_default: false,
      is_completed: false
    }
  });
  
  // Load statuses and configurations on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedStatuses, fetchedConfigs] = await Promise.all([
          statusConfigService.getAllStatuses(),
          statusConfigService.getAllStatusConfigurations()
        ]);
        setStatuses(fetchedStatuses);
        setStatusConfigs(fetchedConfigs);
      } catch (error) {
        console.error('Failed to load status data:', error);
        toast({
          title: 'Error loading status configurations',
          description: 'Please try again later',
          variant: 'destructive'
        });
      }
    };
    
    loadData();
  }, []);
  
  // Get statuses for the current entity type
  const getStatusesForCurrentEntityType = () => {
    const enabledStatusIds = statusConfigs
      .filter(config => config.entity_type === currentEntityType && config.enabled)
      .map(config => config.status_id);
    
    return statuses
      .filter(status => enabledStatusIds.includes(status.id))
      .sort((a, b) => a.order - b.order);
  };
  
  // Check if a status is enabled for the current entity type
  const isStatusEnabledForEntity = (statusId: string) => {
    return statusConfigs.some(
      config => config.status_id === statusId && 
                config.entity_type === currentEntityType && 
                config.enabled
    );
  };
  
  // Toggle status enabled/disabled for current entity type
  const toggleStatusEnabled = async (statusId: string, enabled: boolean) => {
    try {
      await statusConfigService.setStatusEnabledForEntityType(
        statusId,
        currentEntityType,
        enabled
      );
      
      // Update local state
      setStatusConfigs(prevConfigs => {
        const existingConfigIndex = prevConfigs.findIndex(
          c => c.status_id === statusId && c.entity_type === currentEntityType
        );
        
        if (existingConfigIndex >= 0) {
          // Update existing config
          const newConfigs = [...prevConfigs];
          newConfigs[existingConfigIndex] = {
            ...newConfigs[existingConfigIndex],
            enabled
          };
          return newConfigs;
        } else {
          // Add new config (this shouldn't normally happen but just in case)
          return [...prevConfigs, {
            id: `temp-${Date.now()}`, // Will be replaced by proper ID from service
            entity_type: currentEntityType,
            status_id: statusId,
            enabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
        }
      });
      
      toast({
        title: 'Status updated',
        description: `${enabled ? 'Enabled' : 'Disabled'} status for ${entityTypeLabels[currentEntityType]}`,
      });
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast({
        title: 'Failed to update status',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };
  
  // Handle form submission for adding/editing a status
  const handleSubmitStatus = async (values: StatusFormValues) => {
    try {
      if (editingStatus) {
        // Update existing status
        const updatedStatus = await statusConfigService.updateStatus(editingStatus.id, values);
        if (updatedStatus) {
          setStatuses(prevStatuses => 
            prevStatuses.map(s => s.id === updatedStatus.id ? updatedStatus : s)
          );
          toast({
            title: 'Status updated',
            description: `${values.name} has been updated successfully`
          });
        }
      } else {
        // Create new status
        const newStatus = await statusConfigService.createStatus(values);
        setStatuses(prevStatuses => [...prevStatuses, newStatus]);
        
        // Enable this status for the current entity type
        await statusConfigService.setStatusEnabledForEntityType(
          newStatus.id,
          currentEntityType,
          true
        );
        
        // Update configurations in state
        setStatusConfigs(prevConfigs => [...prevConfigs, {
          id: `config-${Date.now()}`, // Will be replaced by proper ID from service
          entity_type: currentEntityType,
          status_id: newStatus.id,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
        toast({
          title: 'Status created',
          description: `${values.name} has been created and enabled for ${entityTypeLabels[currentEntityType]}`
        });
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setEditingStatus(null);
      form.reset();
    } catch (error) {
      console.error('Failed to save status:', error);
      toast({
        title: 'Error',
        description: 'Failed to save status',
        variant: 'destructive'
      });
    }
  };
  
  // Open dialog for editing a status
  const openEditDialog = (status: Status) => {
    setEditingStatus(status);
    form.reset({
      name: status.name,
      description: status.description || '',
      color: status.color || '#6366F1',
      order: status.order,
      is_default: !!status.is_default,
      is_completed: !!status.is_completed
    });
    setIsDialogOpen(true);
  };
  
  // Open dialog for creating a new status
  const openCreateDialog = () => {
    setEditingStatus(null);
    form.reset({
      name: '',
      description: '',
      color: '#6366F1',
      order: getStatusesForCurrentEntityType().length * 10 + 10, // Set order to last + 10
      is_default: false,
      is_completed: false
    });
    setIsDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Configurations</CardTitle>
        <CardDescription>
          Configure available statuses for different entity types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="task"
          value={currentEntityType}
          onValueChange={(value) => setCurrentEntityType(value as StatusEntityType)}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="product_idea">Product Ideas</TabsTrigger>
            <TabsTrigger value="epic">Epics</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
          </TabsList>
          
          {Object.keys(entityTypeLabels).map((entityType) => (
            <TabsContent key={entityType} value={entityType} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {entityTypeLabels[entityType as StatusEntityType]} Statuses
                </h3>
                <Button onClick={openCreateDialog}>Add New Status</Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statuses.map(status => (
                    <TableRow key={status.id}>
                      <TableCell>{status.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {status.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {status.color && (
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: status.color }}
                            />
                          )}
                          <span>{status.color || 'None'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{status.order}</TableCell>
                      <TableCell>{status.is_default ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{status.is_completed ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Switch 
                          checked={isStatusEnabledForEntity(status.id)} 
                          onCheckedChange={(checked) => toggleStatusEnabled(status.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(status)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Dialog for adding/editing statuses */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStatus ? `Edit Status: ${editingStatus.name}` : 'Add New Status'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitStatus)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Status name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Status description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <div className="flex gap-2 items-center">
                          <input 
                            type="color"
                            value={field.value || '#6366F1'}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-10 h-10 rounded"
                          />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Determines the sorting order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Default Status</FormLabel>
                          <FormDescription>
                            Use as default for new entities
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_completed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Completion Status</FormLabel>
                          <FormDescription>
                            Counts as completed for progress
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStatus ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StatusConfigurationPanel;
