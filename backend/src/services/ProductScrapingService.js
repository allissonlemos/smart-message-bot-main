import * as cheerio from 'cheerio';

export class ProductScrapingService {
  static async extractProductInfo(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao acessar a página');
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const hostname = new URL(url).hostname.toLowerCase();
      
      if (hostname.includes('mercadolivre')) {
        return this.extractMercadoLivre($);
      } else if (hostname.includes('amazon')) {
        return this.extractAmazon($);
      } else if (hostname.includes('magazineluiza')) {
        return this.extractMagazineLuiza($);
      } else {
        return this.extractGeneric($);
      }
    } catch (error) {
      throw new Error(`Erro ao extrair informações: ${error.message}`);
    }
  }
  
  static extractMercadoLivre($) {
    const titulo = $('h1.ui-pdp-title').text().trim();
    const preco = $('.andes-money-amount__fraction').first().text().trim();
    const imagem = $('.ui-pdp-image img').first().attr('src');
    
    return { titulo, preco, imagem };
  }
  
  static extractAmazon($) {
    const titulo = $('#productTitle').text().trim();
    const preco = $('.a-price-whole').first().text().trim();
    const imagem = $('#landingImage').attr('src');
    
    return { titulo, preco, imagem };
  }
  
  static extractMagazineLuiza($) {
    const titulo = $('[data-testid="heading-product-title"]').text().trim();
    const preco = $('[data-testid="price-value"]').text().trim();
    const imagem = $('[data-testid="product-image"]').attr('src');
    
    return { titulo, preco, imagem };
  }
  
  static extractGeneric($) {
    const titulo = $('h1').first().text().trim();
    const preco = $('[class*="price"]').first().text().replace(/[^\d,]/g, '');
    const imagem = $('img').first().attr('src');
    
    return { titulo, preco, imagem };
  }
}