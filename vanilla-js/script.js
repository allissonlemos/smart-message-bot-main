// Estado da aplicação
let state = {
    productLink: '',
    titulo: '',
    precoDe: '',
    valorCalculo: '',
    desconto: '',
    preco: '',
    cupom: '',
    link: '',
    imagem: '',
    categoria: '',
    linkCategoria: '',
    isLoading: false,
    activeTab: 'mercadolivre'
};

// Elementos DOM
const elements = {
    productLink: document.getElementById('productLink'),
    extractBtn: document.getElementById('extractBtn'),
    extractIcon: document.getElementById('extractIcon'),
    loadingIcon: document.getElementById('loadingIcon'),
    imagePreview: document.getElementById('imagePreview'),
    messagePreview: document.getElementById('messagePreview'),
    copyBtn: document.getElementById('copyBtn'),
    titulo: document.getElementById('titulo'),
    precoDe: document.getElementById('precoDe'),
    valorCalculo: document.getElementById('valorCalculo'),
    desconto: document.getElementById('desconto'),
    preco: document.getElementById('preco'),
    cupom: document.getElementById('cupom'),
    link: document.getElementById('link'),
    imagem: document.getElementById('imagem'),
    categoria: document.getElementById('categoria'),
    linkCategoria: document.getElementById('linkCategoria'),
    clearBtn: document.getElementById('clearBtn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    // Elementos da Shopee
    shopeeLink: document.getElementById('shopeeLink'),
    shopeeExtractBtn: document.getElementById('shopeeExtractBtn'),
    shopeeExtractIcon: document.getElementById('shopeeExtractIcon'),
    shopeeLoadingIcon: document.getElementById('shopeeLoadingIcon'),
    shopeeClearBtn: document.getElementById('shopeeClearBtn'),
    // Elementos do MagaLu
    magaluLink: document.getElementById('magaluLink'),
    magaluExtractBtn: document.getElementById('magaluExtractBtn'),
    magaluExtractIcon: document.getElementById('magaluExtractIcon'),
    magaluLoadingIcon: document.getElementById('magaluLoadingIcon'),
    magaluClearBtn: document.getElementById('magaluClearBtn'),
    // Elementos da Amazon
    amazonLink: document.getElementById('amazonLink'),
    amazonExtractBtn: document.getElementById('amazonExtractBtn'),
    amazonExtractIcon: document.getElementById('amazonExtractIcon'),
    amazonLoadingIcon: document.getElementById('amazonLoadingIcon'),
    amazonClearBtn: document.getElementById('amazonClearBtn')
};

// Função para mostrar toast
function showToast(message, isError = false) {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${isError ? 'error' : ''}`;
    elements.toast.classList.remove('hidden');
    
    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}

// Função para calcular preço com desconto
function calcularPrecoComDesconto() {
    const valorOriginal = parseFloat(state.valorCalculo) || 0;
    const valorDesconto = parseFloat(state.desconto) || 0;
    
    if (valorOriginal > 0 && valorDesconto > 0) {
        const precoFinal = valorOriginal - valorDesconto;
        state.preco = Math.max(0, precoFinal).toString();
        elements.preco.value = state.preco;
        updatePreview();
    }
}

// Função para gerar mensagem formatada
function getFormattedMessage() {
    const { titulo, precoDe, preco, cupom, link, categoria, linkCategoria } = state;
    let message = `🛍️ ${titulo || '[Título do Produto]'}`;
    
    if (precoDe) {
        message += `

💸 ~De R$ ${precoDe}~`;
    }
    
    message += `

🎁 *Por R$ ${preco || '[Preço]'}*${cupom ? `

🏷️ ${cupom}` : ''}

🛒 Confira Aqui
${link || '[Link do Produto]'}`;
    
    if (categoria) {
        message += `

--------------------------

⭐ ${categoria}
${linkCategoria || link || '[Link da Categoria]'}`;
    }
    
    return message;
}

// Função para atualizar preview
function updatePreview() {
    elements.messagePreview.textContent = getFormattedMessage();
    
    // Atualizar imagem
    if (state.imagem) {
        elements.imagePreview.innerHTML = `<img src="${state.imagem}" alt="Produto" onerror="this.parentElement.classList.add('hidden')">`;
        elements.imagePreview.classList.remove('hidden');
    } else {
        elements.imagePreview.classList.add('hidden');
    }
}

// Função para limpar campos da Shopee
function clearShopeeFields() {
    elements.shopeeLink.value = '';
    clearFields();
}
async function extractShopeeData() {
    const link = elements.shopeeLink.value.trim();
    if (!link) {
        showToast('Cole o link da Shopee primeiro', true);
        return;
    }

    elements.shopeeExtractBtn.disabled = true;
    elements.shopeeExtractIcon.classList.add('hidden');
    elements.shopeeLoadingIcon.classList.remove('hidden');

    try {
        // Primeiro, seguir redirecionamentos se for link encurtado
        let finalUrl = link;
        if (link.includes('s.shopee.com.br')) {
            try {
                const redirectResponse = await fetch(`https://corsproxy.io/?${encodeURIComponent(link)}`, {
                    method: 'HEAD',
                    redirect: 'follow'
                });
                finalUrl = redirectResponse.url.replace('https://corsproxy.io/?', '');
                finalUrl = decodeURIComponent(finalUrl);
            } catch (e) {
                finalUrl = link; // Usar link original se falhar
            }
        }

        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(finalUrl)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extrair título com seletores específicos da Shopee
        let titulo = getAttribute(doc, 'meta[property="og:title"]', 'content') ||
                    getAttribute(doc, 'meta[name="twitter:title"]', 'content') ||
                    getTextContent(doc, 'span[data-testid="pdp-product-title"], .shopee-page-product-detail__title, .item-header__title') ||
                    getTextContent(doc, 'h1') ||
                    getTextContent(doc, 'title');
        
        // Extrair imagem
        const imagem = getAttribute(doc, 'meta[property="og:image"]', 'content') ||
                      getAttribute(doc, 'meta[name="twitter:image"]', 'content');
        
        // Extrair preços da Shopee com múltiplas estratégias
        let precoAtual = '';
        let precoAnterior = '';
        
        // Estratégia 1: Buscar em dados estruturados JSON-LD
        const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (let script of scripts) {
            try {
                const data = JSON.parse(script.textContent);
                if (data.offers && data.offers.price) {
                    precoAtual = data.offers.price.toString();
                }
                if (data.offers && data.offers.priceSpecification) {
                    precoAnterior = data.offers.priceSpecification.price?.toString() || '';
                }
            } catch (e) {}
        }
        
        // Estratégia 2: Buscar por seletores CSS específicos da Shopee
        if (!precoAtual) {
            precoAtual = getTextContent(doc, '.pqTWkA, ._3n5NQx, .flex-no-wrap, [data-testid="pdp-price"], .shopee-price') ||
                        getTextContent(doc, '.price-current, .current-price, .sale-price');
        }
        
        if (!precoAnterior) {
            precoAnterior = getTextContent(doc, '.original-price, .price-original, .old-price, .before-price');
        }
        
        // Estratégia 3: Buscar por padrões de preço no texto
        if (!precoAtual) {
            const bodyText = doc.body ? doc.body.textContent : '';
            const priceMatches = bodyText.match(/R\$\s*([\d.,]+)/g) || [];
            
            if (priceMatches.length > 0) {
                // Filtrar e ordenar preços encontrados
                const validPrices = priceMatches
                    .map(p => {
                        const cleanPrice = p.replace(/[^\d.,]/g, '');
                        const numPrice = parseFloat(cleanPrice.replace(',', '.'));
                        return { original: p, clean: cleanPrice, numeric: numPrice };
                    })
                    .filter(p => p.numeric >= 1) // Preço mínimo de R$ 1
                    .sort((a, b) => b.numeric - a.numeric); // Ordenar do maior para o menor
                
                if (validPrices.length >= 2) {
                    precoAnterior = validPrices[0].clean.replace(/[^0-9]/g, ''); // Maior preço (anterior)
                    precoAtual = validPrices[1].clean.replace(/[^0-9]/g, ''); // Segundo maior (atual)
                } else if (validPrices.length === 1) {
                    precoAtual = validPrices[0].clean.replace(/[^0-9]/g, '');
                }
            }
        }
        
        // Limpar preços (manter apenas números)
        precoAtual = precoAtual.toString().replace(/[^0-9]/g, '');
        precoAnterior = precoAnterior.toString().replace(/[^0-9]/g, '');
        
        // Aplicar dados aos campos
        if (titulo) {
            const tituloLimpo = titulo.trim().substring(0, 200);
            elements.titulo.value = tituloLimpo;
            state.titulo = tituloLimpo;
        }
        
        if (precoAtual) {
            elements.preco.value = precoAtual;
            state.preco = precoAtual;
        }
        
        if (precoAnterior && precoAnterior !== precoAtual) {
            elements.precoDe.value = precoAnterior;
            state.precoDe = precoAnterior;
        }
        
        if (finalUrl) {
            elements.link.value = finalUrl;
            state.link = finalUrl;
        }
        
        if (imagem) {
            elements.imagem.value = imagem;
            state.imagem = imagem;
        }
        
        updatePreview();
        
        const message = `Dados da Shopee extraídos!${precoAnterior ? ' (Preço anterior encontrado)' : ''}`;
        showToast(message);
        
    } catch (error) {
        console.error('Erro Shopee:', error);
        showToast('Erro ao extrair da Shopee. Verifique o link e tente novamente.', true);
    } finally {
        elements.shopeeExtractBtn.disabled = false;
        elements.shopeeExtractIcon.classList.remove('hidden');
        elements.shopeeLoadingIcon.classList.add('hidden');
    }
}

// Função para extrair do MagaLu
async function extractMagaluData() {
    const link = elements.magaluLink.value.trim();
    if (!link) {
        showToast('Cole o link do MagaLu primeiro', true);
        return;
    }

    elements.magaluExtractBtn.disabled = true;
    elements.magaluExtractIcon.classList.add('hidden');
    elements.magaluLoadingIcon.classList.remove('hidden');

    try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(link)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const titulo = getAttribute(doc, 'meta[property="og:title"]', 'content') ||
                      getTextContent(doc, 'title') || '';
        
        const imagem = getAttribute(doc, 'meta[property="og:image"]', 'content') || '';
        
        const bodyText = doc.body ? doc.body.textContent : '';
        const priceMatches = bodyText.match(/R\$\s*([\d.,]+)/g) || [];
        const validPrices = priceMatches
            .map(p => p.replace(/[^\d.,]/g, ''))
            .filter(p => {
                const num = parseFloat(p.replace(',', '.'));
                return num >= 10;
            })
            .sort((a, b) => parseFloat(b.replace(',', '.')) - parseFloat(a.replace(',', '.')));
        
        const preco = validPrices.length > 0 ? validPrices[0].replace(/[^0-9]/g, '') : '';
        
        if (titulo) {
            elements.titulo.value = titulo.trim().substring(0, 200);
            state.titulo = titulo.trim().substring(0, 200);
        }
        
        if (preco) {
            elements.preco.value = preco;
            state.preco = preco;
        }
        
        if (link) {
            elements.link.value = link;
            state.link = link;
        }
        
        if (imagem) {
            elements.imagem.value = imagem;
            state.imagem = imagem;
        }
        
        updatePreview();
        showToast('Dados do MagaLu extraídos com sucesso!');
        
    } catch (error) {
        showToast('Erro ao extrair do MagaLu. Tente novamente.', true);
    } finally {
        elements.magaluExtractBtn.disabled = false;
        elements.magaluExtractIcon.classList.remove('hidden');
        elements.magaluLoadingIcon.classList.add('hidden');
    }
}

// Função para extrair da Amazon
async function extractAmazonData() {
    const link = elements.amazonLink.value.trim();
    if (!link) {
        showToast('Cole o link da Amazon primeiro', true);
        return;
    }

    elements.amazonExtractBtn.disabled = true;
    elements.amazonExtractIcon.classList.add('hidden');
    elements.amazonLoadingIcon.classList.remove('hidden');

    try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(link)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const titulo = getAttribute(doc, 'meta[property="og:title"]', 'content') ||
                      getTextContent(doc, 'title') || '';
        
        const imagem = getAttribute(doc, 'meta[property="og:image"]', 'content') || '';
        
        const bodyText = doc.body ? doc.body.textContent : '';
        const priceMatches = bodyText.match(/R\$\s*([\d.,]+)/g) || [];
        const validPrices = priceMatches
            .map(p => p.replace(/[^\d.,]/g, ''))
            .filter(p => {
                const num = parseFloat(p.replace(',', '.'));
                return num >= 10;
            })
            .sort((a, b) => parseFloat(b.replace(',', '.')) - parseFloat(a.replace(',', '.')));
        
        const preco = validPrices.length > 0 ? validPrices[0].replace(/[^0-9]/g, '') : '';
        
        if (titulo) {
            elements.titulo.value = titulo.trim().substring(0, 200);
            state.titulo = titulo.trim().substring(0, 200);
        }
        
        if (preco) {
            elements.preco.value = preco;
            state.preco = preco;
        }
        
        if (link) {
            elements.link.value = link;
            state.link = link;
        }
        
        if (imagem) {
            elements.imagem.value = imagem;
            state.imagem = imagem;
        }
        
        updatePreview();
        showToast('Dados da Amazon extraídos com sucesso!');
        
    } catch (error) {
        showToast('Erro ao extrair da Amazon. Tente novamente.', true);
    } finally {
        elements.amazonExtractBtn.disabled = false;
        elements.amazonExtractIcon.classList.remove('hidden');
        elements.amazonLoadingIcon.classList.add('hidden');
    }
}

// Funções para limpar campos
function clearMagaluFields() {
    elements.magaluLink.value = '';
    clearFields();
}

function clearAmazonFields() {
    elements.amazonLink.value = '';
    clearFields();
}

// Função para alternar abas
function switchTab(tabName) {
    state.activeTab = tabName;
    
    // Atualizar botões das abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Atualizar conteúdo das abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// Função para extrair informações do produto (real)
async function extractProductInfo() {
    if (!state.productLink.trim()) {
        showToast('Por favor, insira um link do produto', true);
        return;
    }

    state.isLoading = true;
    elements.extractBtn.disabled = true;
    elements.extractIcon.classList.add('hidden');
    elements.loadingIcon.classList.remove('hidden');

    try {
        // Usar proxy CORS alternativo
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = encodeURIComponent(state.productLink);
        
        const response = await fetch(proxyUrl + targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error('Não foi possível acessar a página');
        }
        
        const html = await response.text();
        
        // Criar um parser DOM temporário
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extrair informações usando seletores específicos
        const extractedData = extractFromHTML(doc, state.productLink);
        
        if (!extractedData.titulo && !extractedData.preco) {
            throw new Error('Não foi possível extrair informações do produto');
        }
        
        // Atualizar estado
        state.titulo = extractedData.titulo || '[Título não encontrado]';
        state.preco = extractedData.preco || '[Preço não encontrado]';
        state.link = state.productLink;
        state.imagem = extractedData.imagem || '';

        // Atualizar campos
        elements.titulo.value = state.titulo;
        elements.preco.value = state.preco;
        elements.link.value = state.link;
        elements.imagem.value = state.imagem;

        updatePreview();
        showToast('Informações extraídas com sucesso!');

    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao extrair informações: ' + error.message, true);
    } finally {
        state.isLoading = false;
        elements.extractBtn.disabled = false;
        elements.extractIcon.classList.remove('hidden');
        elements.loadingIcon.classList.add('hidden');
    }
}

// Função para extrair dados do HTML focando em meta tags
function extractFromHTML(doc, url) {
    let titulo = '';
    let preco = '';
    let imagem = '';
    
    // Priorizar meta tags Open Graph (mais confiáveis)
    titulo = getAttribute(doc, 'meta[property="og:title"]', 'content') ||
             getAttribute(doc, 'meta[name="twitter:title"]', 'content') ||
             getTextContent(doc, 'title') ||
             getTextContent(doc, 'h1');
    
    imagem = getAttribute(doc, 'meta[property="og:image"]', 'content') ||
             getAttribute(doc, 'meta[name="twitter:image"]', 'content') ||
             getAttribute(doc, 'link[rel="image_src"]', 'href');
    
    // Para preço, tentar meta tags específicas primeiro
    preco = getAttribute(doc, 'meta[property="product:price:amount"]', 'content') ||
            getAttribute(doc, 'meta[name="price"]', 'content') ||
            getAttribute(doc, 'meta[property="og:price:amount"]', 'content');
    
    // Se não encontrou preço nas meta tags, buscar no conteúdo
    if (!preco) {
        const hostname = new URL(url).hostname.toLowerCase();
        
        if (hostname.includes('mercadolivre')) {
            preco = extractPrice(doc, '.andes-money-amount__fraction, .price-tag-fraction, [class*="price"], .ui-pdp-price__second-line .andes-money-amount__fraction');
        } else if (hostname.includes('amazon')) {
            preco = extractPrice(doc, '.a-price-whole, .a-offscreen, [class*="price"]');
        } else if (hostname.includes('magazineluiza')) {
            preco = extractPrice(doc, '[data-testid="price-value"], .price-template__text, [class*="price"]');
        } else if (hostname.includes('americanas') || hostname.includes('submarino')) {
            preco = extractPrice(doc, '[data-testid="price-value"], .sales-price, [class*="price"]');
        } else {
            preco = extractPrice(doc, '[class*="price"], [class*="preco"], [class*="valor"]');
        }
    }
    
    return {
        titulo: titulo.trim().substring(0, 200),
        preco: formatPrice(preco),
        imagem: imagem
    };
}

// Funções auxiliares para extração
function getTextContent(doc, selectors) {
    const selectorList = selectors.split(', ');
    for (const selector of selectorList) {
        const element = doc.querySelector(selector);
        if (element && element.textContent.trim()) {
            return element.textContent.trim();
        }
    }
    return '';
}

function getAttribute(doc, selectors, attribute) {
    const selectorList = selectors.split(', ');
    for (const selector of selectorList) {
        const element = doc.querySelector(selector);
        if (element && element.getAttribute(attribute)) {
            return element.getAttribute(attribute);
        }
    }
    return '';
}

function extractPrice(doc, selectors) {
    const selectorList = selectors.split(', ');
    const prices = [];
    
    for (const selector of selectorList) {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.textContent.trim();
            const parentText = el.parentElement ? el.parentElement.textContent.toLowerCase() : '';
            
            // Ignorar se contém palavras relacionadas a parcelamento
            if (parentText.includes('parcela') || parentText.includes('/mês') || 
                parentText.includes('x de') || parentText.includes('sem juros')) {
                return;
            }
            
            const match = text.match(/\d+(?:[.,]\d{2})?/);
            if (match) {
                const cleanPrice = match[0].replace(',', '.');
                const value = Math.floor(parseFloat(cleanPrice));
                
                // Filtrar valores muito baixos (provavelmente parcelas)
                if (value >= 50) {
                    prices.push(value);
                }
            }
        });
    }
    
    console.log('Preços encontrados:', prices);
    return prices.length > 0 ? Math.min(...prices).toString() : '';
}

function formatPrice(price) {
    if (!price) return '';
    return price.replace(/[^0-9]/g, '');
}

// Função para copiar mensagem
async function copyMessage() {
    try {
        await navigator.clipboard.writeText(getFormattedMessage());
        showToast('Mensagem copiada para a área de transferência!');
    } catch (error) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = getFormattedMessage();
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Mensagem copiada para a área de transferência!');
    }
}

// Função para limpar campos
function clearFields() {
    state = {
        productLink: '',
        titulo: '',
        precoDe: '',
        valorCalculo: '',
        desconto: '',
        preco: '',
        cupom: '',
        link: '',
        imagem: '',
        categoria: '',
        linkCategoria: '',
        isLoading: false
    };

    elements.productLink.value = '';
    elements.titulo.value = '';
    elements.precoDe.value = '';
    elements.valorCalculo.value = '';
    elements.desconto.value = '';
    elements.preco.value = '';
    elements.cupom.value = '';
    elements.link.value = '';
    elements.imagem.value = '';
    elements.categoria.value = '';
    elements.linkCategoria.value = '';

    updatePreview();
    showToast('Campos limpos com sucesso!');
}

// Event listeners
elements.productLink.addEventListener('input', (e) => {
    state.productLink = e.target.value;
});

elements.extractBtn.addEventListener('click', extractProductInfo);

elements.copyBtn.addEventListener('click', copyMessage);

elements.clearBtn.addEventListener('click', clearFields);

// Event listeners para Shopee
if (elements.shopeeExtractBtn) {
    elements.shopeeExtractBtn.addEventListener('click', extractShopeeData);
}
if (elements.shopeeClearBtn) {
    elements.shopeeClearBtn.addEventListener('click', clearShopeeFields);
}

// Event listeners para MagaLu
if (elements.magaluExtractBtn) {
    elements.magaluExtractBtn.addEventListener('click', extractMagaluData);
}
if (elements.magaluClearBtn) {
    elements.magaluClearBtn.addEventListener('click', clearMagaluFields);
}

// Event listeners para Amazon
if (elements.amazonExtractBtn) {
    elements.amazonExtractBtn.addEventListener('click', extractAmazonData);
}
if (elements.amazonClearBtn) {
    elements.amazonClearBtn.addEventListener('click', clearAmazonFields);
}

// Event listeners para abas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// Event listeners para campos de edição
elements.titulo.addEventListener('input', (e) => {
    state.titulo = e.target.value;
    updatePreview();
});

elements.precoDe.addEventListener('input', (e) => {
    state.precoDe = e.target.value;
    updatePreview();
});

elements.valorCalculo.addEventListener('input', (e) => {
    state.valorCalculo = e.target.value;
    calcularPrecoComDesconto();
});

elements.desconto.addEventListener('input', (e) => {
    state.desconto = e.target.value;
    calcularPrecoComDesconto();
});

elements.preco.addEventListener('input', (e) => {
    state.preco = e.target.value;
    updatePreview();
});

elements.cupom.addEventListener('input', (e) => {
    state.cupom = e.target.value;
    updatePreview();
});

elements.link.addEventListener('input', (e) => {
    state.link = e.target.value;
    updatePreview();
});

elements.imagem.addEventListener('input', (e) => {
    state.imagem = e.target.value;
    updatePreview();
});

elements.categoria.addEventListener('input', (e) => {
    state.categoria = e.target.value;
    updatePreview();
});

elements.linkCategoria.addEventListener('input', (e) => {
    state.linkCategoria = e.target.value;
    updatePreview();
});

// Inicializar preview
updatePreview();