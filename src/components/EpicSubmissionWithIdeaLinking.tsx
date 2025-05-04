
import * as React from "react";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MOCK_PRODUCT_IDEAS } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { productIdeaApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { X, Link, Plus } from "lucide-react";

interface EpicSubmissionWithIdeaLinkingProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: {
    title: string;
    description: string;
    estimation: number;
    capability_category: string;
  };
  epicId?: string;
  productIdeaId?: string; // Optional ID of product idea to link automatically
}

export function EpicSubmissionWithIdeaLinking({
  onSuccess,
  onCancel,
  initialValues,
  epicId,
  productIdeaId
}: EpicSubmissionWithIdeaLinkingProps) {
  const [selectedProductIdeas, setSelectedProductIdeas] = React.useState<string[]>(
    productIdeaId ? [productIdeaId] : []
  );
  const [isProductIdeasDialogOpen, setIsProductIdeasDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleEpicSuccess = async (epicId: string) => {
    // Link the epic to all selected product ideas
    if (selectedProductIdeas.length > 0) {
      try {
        // Create link promises for all selected product ideas
        const linkPromises = selectedProductIdeas.map(ideaId => 
          productIdeaApi.linkToEpic(ideaId, epicId)
        );
        
        // Wait for all links to be created
        await Promise.all(linkPromises);
        
        toast({
          title: "Product ideas linked",
          description: `Epic has been linked to ${selectedProductIdeas.length} product idea(s)`,
        });
      } catch (error) {
        console.error("Error linking product ideas:", error);
        toast({
          title: "Error",
          description: "Failed to link some product ideas to the epic",
          variant: "destructive",
        });
      }
    }
    
    // Call the original onSuccess callback
    onSuccess();
  };
  
  const handleAddProductIdea = (ideaId: string) => {
    if (!selectedProductIdeas.includes(ideaId)) {
      setSelectedProductIdeas([...selectedProductIdeas, ideaId]);
    }
  };
  
  const handleRemoveProductIdea = (ideaId: string) => {
    setSelectedProductIdeas(selectedProductIdeas.filter(id => id !== ideaId));
  };
  
  // Get product ideas information for display
  const selectedIdeasInfo = MOCK_PRODUCT_IDEAS
    .filter(idea => selectedProductIdeas.includes(idea.id))
    .map(idea => ({ id: idea.id, title: idea.title }));
  
  // Get available product ideas (not already selected)
  const availableProductIdeas = MOCK_PRODUCT_IDEAS
    .filter(idea => !selectedProductIdeas.includes(idea.id));

  return (
    <div className="space-y-6">
      {/* Product Ideas Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Link to Product Ideas</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsProductIdeasDialogOpen(true)}
          >
            <Link className="h-4 w-4 mr-1" />
            Link Ideas
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedIdeasInfo.map(idea => (
            <Badge key={idea.id} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
              {idea.title}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveProductIdea(idea.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedIdeasInfo.length === 0 && (
            <div className="text-sm text-muted-foreground">No product ideas linked to this epic</div>
          )}
        </div>
      </div>
      
      {/* Epic Form */}
      <EpicSubmissionForm
        onSuccess={handleEpicSuccess}
        onCancel={onCancel}
        initialValues={initialValues}
        epicId={epicId}
      />
      
      {/* Product Ideas Selection Dialog */}
      <Dialog open={isProductIdeasDialogOpen} onOpenChange={setIsProductIdeasDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Link Product Ideas</DialogTitle>
          
          <div className="space-y-4 my-4">
            <h4 className="text-sm font-medium">Available Product Ideas</h4>
            {availableProductIdeas.length > 0 ? (
              <div className="space-y-2">
                {availableProductIdeas.map(idea => (
                  <div 
                    key={idea.id} 
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/50"
                  >
                    <div>
                      <p className="font-medium">{idea.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {idea.description}
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={() => {
                        handleAddProductIdea(idea.id);
                        setIsProductIdeasDialogOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                All product ideas have been linked already
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsProductIdeasDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
