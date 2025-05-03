
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from './ui/table';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { ChangeLog } from '../models/changeLog';
import api from '../services/api';

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateString;
  }
};

const getOperationColor = (operation: string) => {
  switch(operation) {
    case 'create': return 'bg-green-500';
    case 'update': return 'bg-blue-500';
    case 'delete': return 'bg-red-500';
    case 'status_change': return 'bg-yellow-500';
    case 'link': return 'bg-purple-500';
    case 'unlink': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

const formatValue = (value: any) => {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

interface ChangeLogViewerProps {
  entityType?: 'user' | 'epic' | 'task' | 'product_idea';
  entityId?: string;
  userId?: string;
  limit?: number;
}

const ChangeLogViewer: React.FC<ChangeLogViewerProps> = ({
  entityType,
  entityId,
  userId,
  limit = 10
}) => {
  const [selectedLog, setSelectedLog] = useState<ChangeLog | null>(null);

  // Determine which API call to make
  const fetchChangeLogs = () => {
    if (entityType && entityId) {
      return api.changeLogs.getByEntity(entityType, entityId);
    } 
    if (userId) {
      return api.changeLogs.getByUser(userId);
    }
    return api.changeLogs.getAll();
  };

  const { data: changeLogs, isLoading, error } = useQuery({
    queryKey: ['changeLogs', entityType, entityId, userId],
    queryFn: fetchChangeLogs
  });

  if (isLoading) {
    return <div>Loading change history...</div>;
  }

  if (error) {
    return <div>Error loading change history: {(error as Error).message}</div>;
  }

  const displayLogs = changeLogs ? 
    (limit ? changeLogs.slice(0, limit) : changeLogs) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayLogs.length > 0 ? (
              displayLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                  <TableCell>
                    <Badge className={getOperationColor(log.operation)}>
                      {log.operation.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.entity_type} ({log.entity_id.substring(0, 8)}...)
                  </TableCell>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      {selectedLog && (
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Change Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-semibold">Date:</div>
                              <div>{formatDate(selectedLog.created_at)}</div>
                              <div className="font-semibold">Operation:</div>
                              <div>{selectedLog.operation.replace('_', ' ')}</div>
                              <div className="font-semibold">Entity:</div>
                              <div>{selectedLog.entity_type} ({selectedLog.entity_id})</div>
                              <div className="font-semibold">Changed By:</div>
                              <div>{selectedLog.user_id}</div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">Changes:</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Old Value</TableHead>
                                    <TableHead>New Value</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedLog.changes.map((change, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{change.field}</TableCell>
                                      <TableCell>{formatValue(change.oldValue)}</TableCell>
                                      <TableCell>{formatValue(change.newValue)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No change history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {limit && changeLogs && changeLogs.length > limit && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline">View More</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangeLogViewer;
