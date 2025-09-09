document.addEventListener('DOMContentLoaded', () => {
    const randomiseAllBtn = document.getElementById('randomise-all-btn');
    const randomiseShapesBtn = document.getElementById('randomise-shapes-btn');
    const randomiseColoursBtn = document.getElementById('randomise-colours-btn');
    const downloadBtn = document.getElementById('download-btn');
    const svgContainer = document.getElementById('svg-container');
    const themeRadios = document.querySelectorAll('#theme-options input[type="radio"]');
    const shapeCheckboxes = document.querySelectorAll('#shape-options input[type="checkbox"]');
    const colorPicker = document.getElementById('color-picker');
    const addColorBtn = document.getElementById('add-color-btn');
    const customThemeSwatches = document.getElementById('custom-theme-swatches');

    let gridState = [];
    const THEMES = {
        codeEditor: ['#E91E63', '#cc0000', '#FF9800', '#0000DD', '#0066bb', '#336699', '#bb0066', '#22bb22'],
        sunset: ['#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B'],
        oceanDeep: ['#001219', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00', '#CA6702'],
        forestFloor: ['#283618', '#606C38', '#DDA15E', '#BC6C25', '#FEFAE0', '#A3A380', '#582F0E'],
        monochrome: ['#212529', '#495057', '#6C757D', '#ADB5BD', '#DEE2E6', '#F8F9FA'],
        pastelDream: ['#FAD2E1', '#E2ECE9', '#BEE1E6', '#F0EFEB', '#FFD8BE', '#DFE7FD'],
        neonGlow: ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0', '#00F5D4'],
    };
    let customThemeColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];
    const BACKGROUND_COLOR = '#EFEFEF';
    const SVG_WIDTH = 1584;
    const SVG_HEIGHT = 396;
    const GRID_COLS = 12;
    const GRID_ROWS = 3;
    const TILE_SIZE = SVG_WIDTH / GRID_COLS;
    const getActiveColors = () => {
        const selectedThemeRadio = document.querySelector('#theme-options input[type="radio"]:checked');
        const selectedThemeName = selectedThemeRadio ? selectedThemeRadio.value : 'codeEditor';
        let activeColors = [];
        if (selectedThemeName === 'custom') {
            activeColors = customThemeColors;
        } else {
            activeColors = THEMES[selectedThemeName];
        }
        if (!activeColors || activeColors.length === 0) {
            activeColors = THEMES.codeEditor;
        }
        return activeColors;
    };
    
    const getAvailableShapes = () => {
        const shapes = [];
        shapeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) { shapes.push(checkbox.value); }
        });
        return shapes;
    };
    const randomiseAll = () => {
        const availableShapes = getAvailableShapes();
        const activeColors = getActiveColors();
        gridState = [];
 
        if (availableShapes.length === 0 || activeColors.length === 0) {
            renderGrid(); // Render an empty grid if no options are selected
            return;
        }
        
        const shuffledColors = activeColors.sort(() => 0.5 - Math.random());
        const uniqueColors = [...new Set(shuffledColors)]; 
        const generationPalette = uniqueColors.slice(0, 5);

        for (let i = 0; i < GRID_ROWS; i++) {
            gridState[i] = [];
            for (let j = 0; j < GRID_COLS; j++) {
                gridState[i][j] = {
                    shape: availableShapes[Math.floor(Math.random() * availableShapes.length)],
                    color: generationPalette[Math.floor(Math.random() * generationPalette.length)],
                    orientation: (i + j) % 4,
                };
            }
        }
        renderGrid();
    };

    const randomiseShapes = () => {
        const availableShapes = getAvailableShapes();
        if (availableShapes.length === 0 || !gridState.length) return;

        gridState.forEach((row, i) => {
            row.forEach((tile, j) => {
                tile.shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
                tile.orientation = (i + j) % 4;
            });
        });
        renderGrid();
    };

    const randomiseColours = () => {
        const activeColors = getActiveColors();
        if (activeColors.length === 0 || !gridState.length) return;
        
        const shuffledColors = activeColors.sort(() => 0.5 - Math.random());
        const uniqueColors = [...new Set(shuffledColors)]; 
        const generationPalette = uniqueColors.slice(0, 5);
        if(generationPalette.length === 0) return;

        gridState.forEach(row => {
            row.forEach(tile => {
                tile.color = generationPalette[Math.floor(Math.random() * generationPalette.length)];
            });
        });
        renderGrid();
    };

    const renderGrid = () => {
        svgContainer.innerHTML = '';
        const svg = createSVGElement('svg', {
            width: SVG_WIDTH, height: SVG_HEIGHT, viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`, id: 'generated-svg'
        });
        svg.appendChild(createSVGElement('rect', { x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT, fill: BACKGROUND_COLOR }));

        if (!gridState.length) {
            svgContainer.appendChild(svg);
            return;
        }

        gridState.forEach((row, i) => {
            row.forEach((tile, j) => {
                const tileX = j * TILE_SIZE;
                const tileY = i * TILE_SIZE;
                
                switch (tile.shape) {
                    case 'arc': svg.appendChild(createQuarterCircle(tileX, tileY, TILE_SIZE, tile.color, tile.orientation)); break;
                    case 'eye': svg.appendChild(createEyeShape(tileX, tileY, TILE_SIZE, tile.color, tile.orientation)); break;
                    case 'semi': svg.appendChild(createSemiCircle(tileX, tileY, TILE_SIZE, tile.color, tile.orientation)); break;
                    case 'circle': svg.appendChild(createCircle(tileX, tileY, TILE_SIZE, tile.color)); break;
                }
            });
        });
        svgContainer.appendChild(svg);
    };
    const renderSwatches = () => {
        customThemeSwatches.innerHTML = '';
        customThemeColors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-swatch';
            removeBtn.innerHTML = '&times;';
            removeBtn.dataset.index = index;
            swatch.appendChild(removeBtn);
            customThemeSwatches.appendChild(swatch);
        });
    };

    const addColor = () => {
        if (customThemeColors.length >= 10) { alert("You can have a maximum of 10 custom colors."); return; }
        const newColor = colorPicker.value;
        if (!customThemeColors.includes(newColor)) {
            customThemeColors.push(newColor);
            renderSwatches();
            const customRadio = document.querySelector('#theme-custom');
            if (customRadio && customRadio.checked) { randomiseColours(); }
        }
    };

    const removeColor = (index) => {
        customThemeColors.splice(index, 1);
        renderSwatches();
        const customRadio = document.querySelector('#theme-custom');
        if (customRadio && customRadio.checked) { randomiseColours(); }
    };

    function createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const key in attributes) { element.setAttribute(key, attributes[key]); }
        return element;
    }

    function createQuarterCircle(x, y, size, color, orientation) {
        const path = createSVGElement('path', { fill: color });
        const corner = orientation % 4;
        let d = "";
        switch (corner) {
            case 0: d = `M${x},${y+size} A${size},${size} 0 0 1 ${x+size},${y} L${x+size},${y+size} Z`; break;
            case 1: d = `M${x+size},${y+size} A${size},${size} 0 0 0 ${x},${y} L${x},${y+size} Z`; break;
            case 2: d = `M${x+size},${y} A${size},${size} 0 0 1 ${x},${y+size} L${x},${y} Z`; break;
            case 3: d = `M${x},${y} A${size},${size} 0 0 0 ${x+size},${y+size} L${x+size},${y} Z`; break;
        }
        path.setAttribute('d', d);
        return path;
    }
    
    function createCircle(x, y, size, color) {
        return createSVGElement('circle', { cx: x + size / 2, cy: y + size / 2, r: size / 2, fill: color });
    }

    function createSemiCircle(x, y, size, color, orientation) {
        const path = createSVGElement('path', { fill: color });
        const side = orientation % 4;
        const stretchFactor = 1.5; 
        let d = "";
        switch (side) {
            case 0: d = `M${x},${y+size} Q ${x + size/2},${y+size - size * stretchFactor} ${x+size},${y+size} Z`; break;
            case 1: d = `M${x},${y} Q ${x + size * stretchFactor},${y + size/2} ${x},${y+size} Z`; break;
            case 2: d = `M${x},${y} Q ${x + size/2},${y + size * stretchFactor} ${x+size},${y} Z`; break;
            case 3: d = `M${x+size},${y} Q ${x+size - size * stretchFactor},${y + size/2} ${x+size},${y+size} Z`; break;
        }
        path.setAttribute('d', d);
        return path;
    }

    function createEyeShape(x, y, size, color, orientation) {
        const path = createSVGElement('path', { fill: color });
        const isDiagonal1 = orientation % 2 === 0;
        let d = "";
        if (isDiagonal1) {
            d = `M${x},${y} A ${size},${size} 0 0 1 ${x+size},${y+size} A ${size},${size} 0 0 1 ${x},${y} Z`;
        } else {
            d = `M${x+size},${y} A ${size},${size} 0 0 0 ${x},${y+size} A ${size},${size} 0 0 0 ${x+size},${y} Z`;
        }
        path.setAttribute('d', d);
        return path;
    }
    const downloadPattern = () => {
        const svg = document.getElementById('generated-svg');
        if (!svg) { console.error("No SVG found to download."); return; }
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = SVG_WIDTH * scale;
        canvas.height = SVG_HEIGHT * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        const img = new Image();
        const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'generated-pattern.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.src = svgDataUrl;
    };

    randomiseAllBtn.addEventListener('click', randomiseAll);
    randomiseShapesBtn.addEventListener('click', randomiseShapes);
    randomiseColoursBtn.addEventListener('click', randomiseColours);
    downloadBtn.addEventListener('click', downloadPattern);
    themeRadios.forEach(radio => radio.addEventListener('change', randomiseAll));
    shapeCheckboxes.forEach(checkbox => checkbox.addEventListener('change', randomiseAll));
    
    addColorBtn.addEventListener('click', addColor);
    customThemeSwatches.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-swatch')) {
            removeColor(e.target.dataset.index);
        }
    });

    renderSwatches();
    randomiseAll(); 
});