
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface ProductIdeaHeaderProps {
  title: string;
  description: string;
  status: string;
  priority: string;
  onClose: () => void;
}

export function ProductIdeaHeader({ 
  title, 
  description, 
  status, 
  priority,
  onClose 
}: ProductIdeaHeaderProps) {
  return (
    <div className="relative border-b">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 mb-2">
            <Badge className={
              status === 'proposed' ? 'bg-blue-100 text-blue-800' :
              status === 'under_review' ? 'bg-amber-100 text-amber-800' :
              status === 'approved' ? 'bg-green-100 text-green-800' :
              status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-purple-100 text-purple-800'
            }>
              {status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{priority} priority</Badge>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-base">{description}</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
