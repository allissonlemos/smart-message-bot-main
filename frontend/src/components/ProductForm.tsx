import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormProps {
  titulo: string;
  setTitulo: (value: string) => void;
  preco: string;
  setPreco: (value: string) => void;
  cupom: string;
  setCupom: (value: string) => void;
  link: string;
  setLink: (value: string) => void;
  imagem: string;
  setImagem: (value: string) => void;
}

export const ProductForm = ({
  titulo,
  setTitulo,
  preco,
  setPreco,
  cupom,
  setCupom,
  link,
  setLink,
  imagem,
  setImagem,
}: ProductFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo" className="text-foreground">
          📺 Título do Produto
        </Label>
        <Textarea
          id="titulo"
          placeholder="Ex: Smart TV U8100F Crystal 75'' UHD 4K 2025 Preto Bivolt Samsung"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preco" className="text-foreground">
          🎁 Preço
        </Label>
        <Input
          id="preco"
          placeholder="Ex: 4.319"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cupom" className="text-foreground">
          🏷️ Cupom (opcional)
        </Label>
        <Input
          id="cupom"
          placeholder="Ex: Use cupom PROMO10"
          value={cupom}
          onChange={(e) => setCupom(e.target.value)}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link" className="text-foreground">
          🔗 Link do Produto
        </Label>
        <Input
          id="link"
          placeholder="Preenchido automaticamente ao extrair o produto"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imagem" className="text-foreground">
          📸 URL da Imagem
        </Label>
        <Input
          id="imagem"
          placeholder="URL da imagem do produto"
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};
