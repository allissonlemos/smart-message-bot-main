import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton = ({ textToCopy }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copiado! ✅",
        description: "Mensagem copiada para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      size="lg"
      className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-5 w-5" />
          Copiar Mensagem
        </>
      )}
    </Button>
  );
};
