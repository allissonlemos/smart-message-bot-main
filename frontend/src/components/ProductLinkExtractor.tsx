import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductLinkExtractorProps {
  productLink: string;
  setProductLink: (value: string) => void;
  onExtract: (data: { titulo: string; preco: string; imagem: string }) => void;
  isLoading: boolean;
}

export const ProductLinkExtractor = ({
  productLink,
  setProductLink,
  onExtract,
  isLoading,
}: ProductLinkExtractorProps) => {
  const { toast } = useToast();

  const extractProductInfo = async () => {
    if (!productLink.trim()) {
      toast({
        title: "Link necessário",
        description: "Por favor, insira um link do produto",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/extract-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: productLink }),
      });

      const data = await response.json();

      if (data.success) {
        onExtract({
          titulo: data.titulo,
          preco: data.preco,
          imagem: data.imagem
        });
        
        toast({
          title: "Informações extraídas!",
          description: "Os dados do produto foram carregados com sucesso",
        });
      } else {
        toast({
          title: "Erro na extração",
          description: data.error || "Não foi possível extrair as informações do produto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na extração",
        description: "Não foi possível conectar com o servidor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productLink" className="text-foreground">
          🔗 Link do Produto
        </Label>
        <div className="flex gap-2">
          <Input
            id="productLink"
            placeholder="Cole o link do produto aqui"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground flex-1"
          />
          <Button
            onClick={extractProductInfo}
            disabled={isLoading || !productLink.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};