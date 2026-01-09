import { Card, CardContent } from "@/components/ui/card";

interface MessagePreviewProps {
  titulo: string;
  preco: string;
  cupom: string;
  link: string;
  imagem: string;
}

export const MessagePreview = ({ titulo, preco, cupom, link, imagem }: MessagePreviewProps) => {
  const formattedMessage = `🛍️ ${titulo || "[Título do Produto]"}

🎁 R$ ${preco || "[Preço]"}${cupom ? `

🏷️ ${cupom}` : ""}

🛒 Confira Aqui
${link || "[Link do Produto]"}`;

  return (
    <div className="space-y-4">
      {imagem && (
        <div className="flex justify-center">
          <img 
            src={imagem} 
            alt="Produto" 
            className="max-w-full h-48 object-cover rounded-lg border border-border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <Card className="bg-muted/50 border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Pré-visualização da mensagem:</p>
          <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
            {formattedMessage}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export const getFormattedMessage = (titulo: string, preco: string, cupom: string, link: string, imagem?: string): string => {
  return `🛍️ ${titulo || "[Título do Produto]"}

🎁 R$ ${preco || "[Preço]"}${cupom ? `

🏷️ ${cupom}` : ""}

🛒 Confira Aqui
${link || "[Link do Produto]"}`;
};
