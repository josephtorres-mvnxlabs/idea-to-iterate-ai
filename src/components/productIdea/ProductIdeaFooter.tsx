
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ProductIdeaFooterProps {
  createdAt: string;
  updatedAt: string;
  onClose: () => void;
  onEdit: () => void;
}

export function ProductIdeaFooter({ 
  createdAt, 
  updatedAt, 
  onClose,
  onEdit
}: ProductIdeaFooterProps) {
  return (
    <div className="border-t pt-4 justify-between flex">
      <div className="text-sm text-muted-foreground">
        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
        {createdAt !== updatedAt && (
          <span className="ml-4">Updated: {new Date(updatedAt).toLocaleDateString()}</span>
        )}
      </div>
      <div>
        <Button variant="outline" onClick={onClose} className="mr-2">
          Close
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" /> Edit Idea
        </Button>
      </div>
    </div>
  );
}
