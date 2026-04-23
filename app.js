// Import Google Fonts pro zobrazení v aplikaci
const fontStyle = document.createElement('style');
fontStyle.innerHTML = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;700&family=Open+Sans:wght@400;500;700&family=Roboto+Condensed:wght@400;700&family=Roboto:wght@400;500;700&display=swap');";
document.head.appendChild(fontStyle);

const CUSTOM_FONTS_URLS = {
    "Inter-Regular": "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjZ-Ck-8.ttf",
    "Inter-Medium": "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjZ-Ck-8.ttf",
    "Inter-Bold": "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjZ-Ck-8.ttf",
    "Roboto-Regular": "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA_0lFQm.ttf",
    "Roboto-Medium": "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWub2bVmUiA_0lFQm.ttf",
    "Roboto-Bold": "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjalmUiA_0lFQm.ttf",
    "RobotoCondensed-Regular": "https://fonts.gstatic.com/s/robotocondensed/v31/ieVo2ZhZI2eCN5jzbjEETS9weq8-_d6T_POl0fRJeyWyosBO5XljK9SL.ttf",
    "RobotoCondensed-Bold": "https://fonts.gstatic.com/s/robotocondensed/v31/ieVo2ZhZI2eCN5jzbjEETS9weq8-_d6T_POl0fRJeyVVpcBO5XljK9SL.ttf",
    "Lato-Regular": "https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHjx4wWyWtFCc.ttf",
    "Lato-Bold": "https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh6UVSwiPHA3q5d0.ttf",
    "Montserrat-Regular": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX9-obK4.ttf",
    "Montserrat-Medium": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Hw5aX9-obK4.ttf",
    "Montserrat-Bold": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX9-obK4.ttf",
    "OpenSans-Regular": "https://fonts.gstatic.com/s/opensans/v44/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVcUx6EQ.ttf",
    "OpenSans-Medium": "https://fonts.gstatic.com/s/opensans/v44/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjr0B4gaVcUx6EQ.ttf",
    "OpenSans-Bold": "https://fonts.gstatic.com/s/opensans/v44/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVcUx6EQ.ttf"
};

function getCssFont(fontId) {
    if (fontId === 'Helvetica') return 'Arial, sans-serif';
    if (fontId === 'TimesRoman') return '"Times New Roman", serif';
    if (fontId === 'Courier') return '"Courier New", monospace';
    
    // Rozparsování např. "Inter-Bold"
    const [family, weight] = fontId.split('-');
    let cssFamily = family;
    if (family === 'RobotoCondensed') cssFamily = '"Roboto Condensed"';
    if (family === 'OpenSans') cssFamily = '"Open Sans"';
    
    const cssWeight = weight === 'Bold' ? '700' : (weight === 'Medium' ? '500' : '400');
    return `${cssWeight} 1em "${cssFamily}", sans-serif`;
}

let pdfDataUri = null;
let pdfDocInstance = null;
let currentPageNum = 1;
let totalPages = 1;
let currentPage = null;
let pdfTextContent = null; // Uložení extrahovaného textu pro nativní detekci
let blocks = [];
let currentScale = 1.0;
let pdfDimensions = { width: 0, height: 0 };

let currentMode = 'select';
let selectedBlockId = null;

// Tažení pro kreslení
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentRect = null;

// Přesouvání bloků
let isDraggingBlock = false;
let dragElement = null;
let dragStartX = 0;
let dragStartY = 0;
let dragStartBlockX = 0;
let dragStartBlockY = 0;

// DOM Elementy
const uploadBtn = document.getElementById('pdf-upload');
const exportBtn = document.getElementById('export-btn');
const statusPanel = document.getElementById('status-panel');
const statusText = document.getElementById('status-text');
const emptyState = document.getElementById('empty-state');
const workspace = document.getElementById('workspace');
const canvas = document.getElementById('pdf-canvas');
const overlayContainer = document.getElementById('overlay-container');
const toolbar = document.getElementById('toolbar');
const pdfContainer = document.getElementById('pdf-container');
const propertiesPanel = document.getElementById('properties-panel');
const zoomControls = document.getElementById('zoom-controls');

const pageControls = document.getElementById('page-controls');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Vlastnosti UI
const propFont = document.getElementById('prop-font');
const propSize = document.getElementById('prop-size');
const propColor = document.getElementById('prop-color');
const propBg = document.getElementById('prop-bg');
const propBgTrans = document.getElementById('prop-bg-transparent');
const propOffsetY = document.getElementById('prop-offset-y');
const nudgeUp = document.getElementById('nudge-up');
const nudgeDown = document.getElementById('nudge-down');
const deleteBlockBtn = document.getElementById('delete-block-btn');

function showStatus(text) {
    statusPanel.classList.remove('hidden');
    statusText.textContent = text;
}

function hideStatus() {
    statusPanel.classList.add('hidden');
}

// Inicializace OCR
let ocrWorker = null;
async function initOCR() {
    if (!ocrWorker) {
        showStatus('Příprava OCR engine...');
        ocrWorker = await Tesseract.createWorker();
        await ocrWorker.loadLanguage('ces+eng');
        await ocrWorker.initialize('ces+eng');
        hideStatus();
    }
}

function getCanvasCrop(xCanvas, yCanvas, wCanvas, hCanvas) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = wCanvas;
    tempCanvas.height = hCanvas;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(canvas, xCanvas, yCanvas, wCanvas, hCanvas, 0, 0, wCanvas, hCanvas);
    return tempCanvas.toDataURL('image/png');
}

// Mapování nativního PDF písma na naše
function mapPdfFontToOurs(fontName) {
    fontName = (fontName || '').toLowerCase();
    if (fontName.includes('times')) return 'TimesRoman';
    if (fontName.includes('courier')) return 'Courier';
    if (fontName.includes('roboto')) return 'Roboto-Regular';
    if (fontName.includes('inter')) return 'Inter-Regular';
    if (fontName.includes('arial')) return 'OpenSans-Regular'; // Fallback for Arial to OpenSans
    if (fontName.includes('montserrat')) return 'Montserrat-Regular';
    if (fontName.includes('lato')) return 'Lato-Regular';
    if (fontName.includes('sans')) return 'OpenSans-Regular';
    return 'Helvetica'; // Defaultní fallback
}

// Pokus o detekci textu z PDF.js (pokud to nejsou křivky)
function findNativeTextIntersection(xPDF, yPDF, wPDF, hPDF) {
    if (!pdfTextContent || !pdfTextContent.items) return null;
    
    // Y je v pdfTextContent odspodu! Přepočítáme:
    const searchYBottom = pdfDimensions.height - (yPDF + hPDF);
    const searchYTop = pdfDimensions.height - yPDF;
    
    for (const item of pdfTextContent.items) {
        const itemX = item.transform[4];
        const itemY = item.transform[5];
        const itemSize = item.transform[0]; // Přibližná výška fontu
        const itemW = item.width;
        
        // Zjednodušený průnik bboxů
        if (itemX < xPDF + wPDF && itemX + itemW > xPDF &&
            itemY < searchYTop && itemY + itemSize > searchYBottom) {
            return {
                text: item.str,
                size: Math.abs(itemSize),
                fontName: item.fontName
            };
        }
    }
    return null;
}

// ---- NÁSTROJOVÁ LIŠTA ----
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentMode = e.currentTarget.dataset.mode;
        pdfContainer.setAttribute('data-mode', currentMode);
        if (currentMode !== 'select') selectBlock(null); 
    });
});

// ---- ZOOM & STRÁNKOVÁNÍ ----
async function renderPDFPage() {
    if (!currentPage) return;
    const viewport = currentPage.getViewport({ scale: currentScale });
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const unscaledViewport = currentPage.getViewport({ scale: 1.0 });
    pdfDimensions.width = unscaledViewport.width;
    pdfDimensions.height = unscaledViewport.height;
    
    await currentPage.render({ canvasContext: context, viewport: viewport }).promise;
    document.getElementById('zoom-level').textContent = `${Math.round(currentScale * 100)}%`;
    renderOverlays();
}

async function loadPage(pageNum) {
    if (!pdfDocInstance || pageNum < 1 || pageNum > totalPages) return;
    showStatus(`Načítám stranu ${pageNum}...`);
    currentPageNum = pageNum;
    currentPage = await pdfDocInstance.getPage(currentPageNum);
    pdfTextContent = await currentPage.getTextContent();
    
    // Fit-to-screen logika jen při prvním načtení dokumentu (při startu je currentScale 1.0)
    if (pageNum === 1 && !window.hasFittedZoom) {
        const unscaledViewport = currentPage.getViewport({ scale: 1.0 });
        const workspaceRect = workspace.getBoundingClientRect();
        const availableHeight = workspaceRect.height - 40;
        const availableWidth = workspaceRect.width - 40;
        
        const scaleX = availableWidth / unscaledViewport.width;
        const scaleY = availableHeight / unscaledViewport.height;
        currentScale = Math.min(scaleX, scaleY);
        if (currentScale > 2.5) currentScale = 2.5; 
        if (currentScale < 0.1) currentScale = 0.5;
        window.hasFittedZoom = true;
    }
    
    await renderPDFPage();
    
    pageInfo.textContent = `Strana ${currentPageNum} z ${totalPages}`;
    prevPageBtn.disabled = currentPageNum === 1;
    nextPageBtn.disabled = currentPageNum === totalPages;
    selectBlock(null);
    hideStatus();
}

prevPageBtn.addEventListener('click', () => loadPage(currentPageNum - 1));
nextPageBtn.addEventListener('click', () => loadPage(currentPageNum + 1));

document.getElementById('zoom-in').addEventListener('click', () => {
    if (currentScale >= 3.0) return;
    currentScale += 0.25;
    renderPDFPage();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (currentScale <= 0.5) return;
    currentScale -= 0.25;
    renderPDFPage();
});

// ---- PROPERTIES PANEL ----
function updatePropertiesPanel() {
    if (!selectedBlockId) {
        propertiesPanel.classList.add('disabled');
        deleteBlockBtn.style.display = 'none';
        [propFont, propSize, propColor, propBg, propBgTrans, propOffsetY, nudgeUp, nudgeDown].forEach(el => el.disabled = true);
        return;
    }
    
    propertiesPanel.classList.remove('disabled');
    deleteBlockBtn.style.display = 'block';
    [propFont, propSize, propColor, propBg, propBgTrans, propOffsetY, nudgeUp, nudgeDown].forEach(el => el.disabled = false);
    
    const block = blocks.find(b => b.id === selectedBlockId);
    if (block) {
        propFont.value = block.font;
        propSize.value = Math.round(block.size);
        propColor.value = block.color;
        propOffsetY.value = block.offsetY || 0;
        
        if (block.bgColor === 'transparent') {
            propBgTrans.checked = true;
            propBg.disabled = true;
        } else {
            propBgTrans.checked = false;
            propBg.disabled = false;
            propBg.value = block.bgColor;
        }
        
        if (block.type === 'erase') {
            propFont.disabled = true;
            propSize.disabled = true;
            propColor.disabled = true;
            propOffsetY.disabled = true;
            nudgeUp.disabled = true;
            nudgeDown.disabled = true;
        }
    }
}

function getActiveBlock() {
    return blocks.find(b => b.id === selectedBlockId);
}

[propFont, propSize, propColor, propBg, propOffsetY].forEach(el => {
    el.addEventListener('change', () => {
        const block = getActiveBlock();
        if (block) {
            block.font = propFont.value;
            block.size = parseInt(propSize.value) || 14;
            block.color = propColor.value;
            block.offsetY = parseInt(propOffsetY.value) || 0;
            if (!propBgTrans.checked) block.bgColor = propBg.value;
            renderOverlays();
        }
    });
});

propBgTrans.addEventListener('change', (e) => {
    propBg.disabled = e.target.checked;
    const block = getActiveBlock();
    if (block) {
        block.bgColor = e.target.checked ? 'transparent' : propBg.value;
        renderOverlays();
    }
});

nudgeUp.addEventListener('click', () => {
    const block = getActiveBlock();
    if (block) {
        block.offsetY = (block.offsetY || 0) - 1;
        propOffsetY.value = block.offsetY;
        renderOverlays();
    }
});

nudgeDown.addEventListener('click', () => {
    const block = getActiveBlock();
    if (block) {
        block.offsetY = (block.offsetY || 0) + 1;
        propOffsetY.value = block.offsetY;
        renderOverlays();
    }
});

deleteBlockBtn.addEventListener('click', () => {
    if (!selectedBlockId) return;
    blocks = blocks.filter(b => b.id !== selectedBlockId);
    selectBlock(null);
    renderOverlays();
});

function selectBlock(id) {
    selectedBlockId = id;
    renderOverlays(); 
    updatePropertiesPanel();
}


// ---- RENDER BLOKŮ ----
function renderOverlays() {
    overlayContainer.innerHTML = '';
    
    blocks.filter(b => b.page === currentPageNum).forEach(block => {
        const div = document.createElement('div');
        div.className = `text-block ${selectedBlockId === block.id ? 'selected' : ''}`;
        
        const scaledX = block.x * currentScale;
        const scaledY = block.y * currentScale;
        const scaledW = block.w * currentScale;
        const scaledH = block.h * currentScale;
        const scaledSize = block.size * currentScale;
        // Posun textu
        const scaledOffsetY = (block.offsetY || 0) * currentScale;
        
        div.style.left = `${scaledX}px`;
        div.style.top = `${scaledY}px`;
        div.style.width = `${scaledW}px`;
        div.style.height = `${scaledH}px`;
        
        if (block.bgColor !== 'transparent') div.style.backgroundColor = block.bgColor;
        if (block.type === 'form' && block.bgColor === 'transparent') {
            div.style.backgroundColor = 'rgba(191, 219, 254, 0.3)';
            div.style.border = '1px dashed #3b82f6';
        }
        
let dragElement = null;

        // PŘESOUVÁNÍ BLOKŮ
        div.addEventListener('mousedown', (e) => {
            if (currentMode === 'select') {
                e.stopPropagation();
                selectBlock(block.id);
                
                // Inicializace přesunu
                isDraggingBlock = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                dragStartBlockX = block.x;
                dragStartBlockY = block.y;
                dragElement = div;
            }
        });

        if (block.type !== 'erase') {
            const inputContainer = document.createElement('div');
            inputContainer.style.width = '100%';
            inputContainer.style.height = '100%';
            inputContainer.style.display = 'flex';
            // Zajištění vertikálního posunu 
            inputContainer.style.transform = `translateY(${scaledOffsetY}px)`;
            
            const input = document.createElement(block.type === 'static' ? 'textarea' : 'input');
            input.className = 'text-input';
            input.value = block.text;
            
            input.style.font = getCssFont(block.font);
            input.style.fontSize = `${scaledSize}px`;
            input.style.color = block.color;
            
            if (block.type === 'form') input.placeholder = 'Vyplňovací pole...';
            
            input.addEventListener('input', (e) => {
                block.text = e.target.value;
            });
            input.addEventListener('focus', () => { 
                if (currentMode === 'select' && selectedBlockId !== block.id) {
                    selectBlock(block.id); 
                }
            });
            
            inputContainer.appendChild(input);
            div.appendChild(inputContainer);
        }
        
        overlayContainer.appendChild(div);
    });
}

// Zpracování přesunu bloků nad celým kontejnerem
document.addEventListener('mousemove', (e) => {
    if (isDraggingBlock && selectedBlockId && currentMode === 'select' && dragElement) {
        const block = blocks.find(b => b.id === selectedBlockId);
        if (block) {
            const deltaX = (e.clientX - dragStartX) / currentScale;
            const deltaY = (e.clientY - dragStartY) / currentScale;
            block.x = dragStartBlockX + deltaX;
            block.y = dragStartBlockY + deltaY;
            
            // POUZE aktualizujeme CSS
            dragElement.style.left = `${block.x * currentScale}px`;
            dragElement.style.top = `${block.y * currentScale}px`;
        }
    }
});
document.addEventListener('mouseup', () => {
    isDraggingBlock = false;
    dragElement = null;
});

// ---- KRESLENÍ NOVÝCH BLOKŮ ----
overlayContainer.addEventListener('mousedown', (e) => {
    if (currentMode === 'select') {
        if (e.target === overlayContainer) selectBlock(null);
        return; 
    }
    const rect = overlayContainer.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
    
    currentRect = document.createElement('div');
    currentRect.className = 'drawing-rect';
    currentRect.style.left = `${startX}px`;
    currentRect.style.top = `${startY}px`;
    overlayContainer.appendChild(currentRect);
});

overlayContainer.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentMode === 'select') return;
    const rect = overlayContainer.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    
    currentRect.style.left = `${x}px`;
    currentRect.style.top = `${y}px`;
    currentRect.style.width = `${w}px`;
    currentRect.style.height = `${h}px`;
});

overlayContainer.addEventListener('mouseup', async (e) => {
    if (!isDrawing || currentMode === 'select') return;
    isDrawing = false;
    currentRect.remove();
    
    const rect = overlayContainer.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    const xCanvas = Math.min(startX, endX);
    const yCanvas = Math.min(startY, endY);
    const wCanvas = Math.abs(endX - startX);
    const hCanvas = Math.abs(endY - startY);
    
    if (wCanvas < 10 || hCanvas < 10) return;
    
    const pdfX = xCanvas / currentScale;
    const pdfY = yCanvas / currentScale;
    const pdfW = wCanvas / currentScale;
    const pdfH = hCanvas / currentScale;
    
        const newBlock = {
        id: Date.now(),
        page: currentPageNum,
        x: pdfX, y: pdfY, w: pdfW, h: pdfH,
        type: 'static', text: '',
        font: 'OpenSans-Regular', size: Math.max(10, Math.floor(pdfH * 0.7)),
        color: '#000000', bgColor: '#ffffff', offsetY: 0
    };
    
    // DETEKCE NATIVNÍHO PÍSMA A TEXTU (Nahradí OCR, pokud to jde)
    let nativeTextData = null;
    if (currentMode === 'ocr') {
        nativeTextData = findNativeTextIntersection(pdfX, pdfY, pdfW, pdfH);
        if (nativeTextData) {
            newBlock.text = nativeTextData.text;
            // PDF.js font size někdy nebývá 100% spolehlivý, tak uděláme mix:
            newBlock.size = nativeTextData.size > 0 ? nativeTextData.size : newBlock.size;
            newBlock.font = mapPdfFontToOurs(nativeTextData.fontName);
            showStatus('Nalezen nativní PDF text! (Nevyužito OCR)');
            setTimeout(hideStatus, 2000);
        }
    }
    
    if (currentMode === 'erase') {
        newBlock.type = 'erase';
        newBlock.bgColor = '#ffffff';
    } 
    else if (currentMode === 'form') {
        newBlock.type = 'form';
        newBlock.bgColor = 'transparent';
    }
    else if (currentMode === 'text') {
        newBlock.type = 'static';
        newBlock.bgColor = 'transparent'; 
    }
    else if (currentMode === 'ocr') {
        newBlock.type = 'static';
        newBlock.bgColor = '#ffffff'; 
        
        // Pokud jsme nenašli nativní PDF text (křivky / rastr), zkusíme OCR
        if (!nativeTextData) {
            if (ocrWorker) {
                showStatus('Rozpoznávám text (OCR)...');
                try {
                    const cropUrl = getCanvasCrop(xCanvas, yCanvas, wCanvas, hCanvas);
                    const { data } = await ocrWorker.recognize(cropUrl);
                    newBlock.text = data.text.trim();
                } catch (err) {
                    console.error(err);
                }
                hideStatus();
            } else {
                alert("OCR se teprve načítá, zkuste to za okamžik.");
                return;
            }
        }
    }
    
    blocks.push(newBlock);
    document.querySelector('.tool-btn[data-mode="select"]').click();
    selectBlock(newBlock.id);
});

// ---- NAČTENÍ PDF ----
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    emptyState.classList.add('hidden');
    workspace.classList.remove('hidden');
    toolbar.classList.remove('hidden');
    zoomControls.classList.remove('hidden');
    exportBtn.style.display = 'inline-flex';
    
    showStatus('Načítám PDF dokument...');
    
    try {
        window.hasFittedZoom = false; // Reset zoom logic
        const arrayBuffer = await file.arrayBuffer();
        pdfDataUri = arrayBuffer.slice(0); // Uděláme kopii pro bezpečný export!
        
        pdfDocInstance = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPages = pdfDocInstance.numPages;
        
        if (totalPages > 1) {
            pageControls.classList.remove('hidden');
        } else {
            pageControls.classList.add('hidden');
        }
        
        await loadPage(1);
        hideStatus();
        initOCR();
        
    } catch (error) {
        console.error(error);
        showStatus('Chyba při zpracování PDF.');
        setTimeout(hideStatus, 3000);
    }
});

function hexToRgb(hex) {
    if (!hex) return null;
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    return {
        r: ((bigint >> 16) & 255) / 255,
        g: ((bigint >> 8) & 255) / 255,
        b: (bigint & 255) / 255
    };
}

const fontCache = {};

// ---- EXPORT PDF ----
exportBtn.addEventListener('click', async () => {
    if (!pdfDataUri) return;
    
    showStatus('Generuji PDF s vlastními fonty...');
    selectBlock(null); 
    
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfDataUri);
        pdfDoc.registerFontkit(window.fontkit);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        
        const standardFontsMap = {
            'Helvetica': await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica),
            'TimesRoman': await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman),
            'Courier': await pdfDoc.embedFont(PDFLib.StandardFonts.Courier)
        };
        
        const usedFonts = new Set(blocks.map(b => b.font));
        const activeFontsMap = { ...standardFontsMap };
        
        for (const fontName of usedFonts) {
            if (CUSTOM_FONTS_URLS[fontName]) {
                if (!fontCache[fontName]) {
                    showStatus(`Stahuji písmo ${fontName}...`);
                    try {
                        const res = await fetch(CUSTOM_FONTS_URLS[fontName]);
                        if (!res.ok) throw new Error("Nelze stáhnout: " + res.status);
                        const fontBytes = await res.arrayBuffer();
                        fontCache[fontName] = fontBytes;
                    } catch (e) {
                        console.error(`Písmo ${fontName} se nepodařilo stáhnout, použije se Helvetica.`, e);
                    }
                }
                if (fontCache[fontName]) {
                    showStatus(`Vkládám písmo ${fontName}...`);
                    try {
                        activeFontsMap[fontName] = await pdfDoc.embedFont(fontCache[fontName]);
                    } catch (e) {
                        console.error(`Chyba při vkládání písma ${fontName}`, e);
                    }
                }
            }
        }
        
        const form = pdfDoc.getForm();

        blocks.forEach(block => {
            const targetPage = pages[block.page - 1];
            if (!targetPage) return;
            
            const x = block.x;
            const y = pdfDimensions.height - (block.y + block.h);
            const w = block.w;
            const h = block.h;
            
            if (block.bgColor !== 'transparent') {
                const bgRgb = hexToRgb(block.bgColor);
                if (bgRgb) {
                    targetPage.drawRectangle({
                        x, y, width: w, height: h,
                        color: PDFLib.rgb(bgRgb.r, bgRgb.g, bgRgb.b)
                    });
                }
            }
            
            const cRgb = hexToRgb(block.color) || {r:0, g:0, b:0};
            const activeFont = activeFontsMap[block.font] || activeFontsMap['Helvetica'];
            
            if (block.type === 'static' && block.text) {
                const lines = block.text.split('\n');
                lines.forEach((line, i) => {
                    const offsetYPDF = (block.offsetY || 0); 
                    targetPage.drawText(line, {
                        x: x + 2,
                        y: y + h - (block.size * 1.0) - (i * block.size * 1.2) - offsetYPDF,
                        size: block.size,
                        font: activeFont,
                        color: PDFLib.rgb(cRgb.r, cRgb.g, cRgb.b),
                    });
                });
            } 
            else if (block.type === 'form') {
                const fieldName = `field_${block.id}`;
                let textField;
                try {
                    textField = form.getTextField(fieldName);
                    if (!textField) textField = form.createTextField(fieldName);
                } catch {
                    textField = form.createTextField(fieldName);
                }
                
                if (block.text) textField.setText(block.text);
                
                textField.addToPage(targetPage, {
                    x, y, width: w, height: h,
                    font: activeFont,
                    textColor: PDFLib.rgb(cRgb.r, cRgb.g, cRgb.b),
                    borderWidth: 0,
                });
            }
        });
        
        showStatus('Ukládám soubor...');
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf-extraktor-pro.pdf';
        a.click();
        URL.revokeObjectURL(url);
        
        hideStatus();
    } catch (error) {
        console.error(error);
        showStatus('Chyba při exportu.');
        setTimeout(hideStatus, 3000);
    }
});
