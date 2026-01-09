import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ClearButtonProps {
  onClear: () => void;
}

export const ClearButton = ({ onClear }: ClearButtonProps) => {
  return (
    <Button
      onClick={onClear}
      variant="outline"
      size="lg"
      className="w-full h-12 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Limpar Campos
    </Button>
  );
};
