import { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { ProductLinkExtractor } from "@/components/ProductLinkExtractor";
import { MessagePreview, getFormattedMessage } from "@/components/MessagePreview";
import { CopyButton } from "@/components/CopyButton";
import { ClearButton } from "@/components/ClearButton";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [productLink, setProductLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [preco, setPreco] = useState("");
  const [cupom, setCupom] = useState("");
  const [link, setLink] = useState("");
  const [imagem, setImagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => {
    setProductLink("");
    setTitulo("");
    setPreco("");
    setCupom("");
    setLink("");
    setImagem("");
  };

  const handleExtract = async (data: { titulo: string; preco: string; imagem: string }) => {
    setTitulo(data.titulo);
    setPreco(data.preco);
    setLink(productLink);
    setImagem(data.imagem);
  };

  const formattedMessage = getFormattedMessage(titulo, preco, cupom, link, imagem);

  return (
    <div className="min-h-screen bg-background dark">
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            📱 Formatador WhatsApp
          </h1>
          <p className="text-sm text-muted-foreground">
            Formate mensagens de produtos para grupos de vendas
          </p>
        </div>

        {/* Product Link Extractor */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            🔍 Extrair Informações
          </h2>
          <ProductLinkExtractor
            productLink={productLink}
            setProductLink={setProductLink}
            onExtract={handleExtract}
            isLoading={isLoading}
          />
        </div>

        <Separator className="my-6 bg-border" />

        {/* Message Preview */}
        <div className="mb-6">
          <MessagePreview
            titulo={titulo}
            preco={preco}
            cupom={cupom}
            link={link}
            imagem={imagem}
          />
        </div>

        {/* Copy Button */}
        <div className="mb-6">
          <CopyButton textToCopy={formattedMessage} />
        </div>

        <Separator className="my-6 bg-border" />

        {/* Edit Fields */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            ✏️ Editar Informações
          </h2>
          <ProductForm
            titulo={titulo}
            setTitulo={setTitulo}
            preco={preco}
            setPreco={setPreco}
            cupom={cupom}
            setCupom={setCupom}
            link={link}
            setLink={setLink}
            imagem={imagem}
            setImagem={setImagem}
          />
        </div>

        {/* Clear Button */}
        <ClearButton onClear={handleClear} />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Cole o link e as informações serão extraídas automaticamente
        </p>
      </div>
    </div>
  );
};

export default Index;
