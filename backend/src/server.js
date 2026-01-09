import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Message Bot API is running' });
});

app.post('/api/format-message', (req, res) => {
  const { titulo, preco, cupom, link } = req.body;
  
  const formattedMessage = `🛍️ ${titulo || '[Título do Produto]'}

🎁 R$ ${preco || '[Preço]'}${cupom ? `

🏷️ ${cupom}` : ''}

🛒 Confira Aqui
${link || '[Link do Produto]'}`;

  res.json({ 
    success: true, 
    message: formattedMessage 
  });
});

app.post('/api/extract-product', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL é obrigatória' 
    });
  }

  try {
    // Adicionar User-Agent para evitar bloqueios
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    const response = await axios.get(url, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);

    // Extrair dados com múltiplas estratégias para diferentes e-commerce
    let titulo = '';
    let preco = '';
    let imagem = '';

    // Tentar extrair título
    titulo = 
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      '';

    // Tentar extrair preço (buscar pelo menor valor com desconto)
    let precos = [];
    
    // Buscar múltiplos seletores de preço
    $('[data-testid="current-price"], [class*="price"], [class*="preco"], [class*="discount"], [class*="sale"]').each((i, el) => {
      const texto = $(el).text().replace(/[^0-9,]/g, '');
      if (texto && texto.length > 2) {
        const valor = parseInt(texto.replace(/,\d+$/, '').replace(/\./g, ''));
        if (valor > 0) precos.push(valor);
      }
    });
    
    // Pegar o menor preço encontrado
    preco = precos.length > 0 ? Math.min(...precos).toString() : '';

    // Tentar extrair imagem
    imagem = 
      $('meta[property="og:image"]').attr('content') ||
      $('img[class*="product"]').first().attr('src') ||
      $('img').first().attr('src') ||
      '';

    // Limpar e normalizar dados
    titulo = titulo.trim().substring(0, 200);
    
    if (!titulo && !preco) {
      return res.status(400).json({ 
        success: false, 
        error: 'Não foi possível extrair informações do produto. Tente preencher manualmente.',
        titulo: '',
        preco: '',
        imagem: ''
      });
    }

    res.json({ 
      success: true, 
      titulo: titulo || '[Título não encontrado]',
      preco: preco || '[Preço não encontrado]',
      imagem: imagem || ''
    });
  } catch (error) {
    console.error('Erro ao extrair produto:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar o link do produto',
      titulo: '',
      preco: '',
      imagem: ''
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});