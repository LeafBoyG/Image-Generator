document.addEventListener('DOMContentLoaded', () => {
    // ---CONTROL ELEMENTS---
    const openControlsBtn = document.getElementById('open-controls-btn');
    const closeControlsBtn = document.getElementById('close-controls-btn');
    const controlsPanel = document.getElementById('controls-panel');
    const panelOverlay = document.getElementById('panel-overlay');
    const showTourBtn = document.getElementById('show-tour-btn');
    const randomiseAllBtn = document.getElementById('randomise-all-btn');
    const randomiseShapesBtn = document.getElementById('randomise-shapes-btn');
    const randomiseColoursBtn = document.getElementById('randomise-colours-btn');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const exportSvgBtn = document.getElementById('export-svg-btn');
    const svgContainer = document.getElementById('svg-container');
    const themeRadios = document.querySelectorAll('#theme-options input[type="radio"]');
    const shapeCheckboxes = document.querySelectorAll('#shape-options input[type="checkbox"]');
    const colorPicker = document.getElementById('color-picker');
    const addColorBtn = document.getElementById('add-color-btn');
    const customThemeSwatches = document.getElementById('custom-theme-swatches');
    const colsSlider = document.getElementById('cols-slider');
    const colsValue = document.getElementById('cols-value');
    const rowsSlider = document.getElementById('rows-slider');
    const rowsValue = document.getElementById('rows-value');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const densitySlider = document.getElementById('density-slider');
    const densityValue = document.getElementById('density-value');
    const strokeToggle = document.getElementById('stroke-toggle');
    const strokeWidthGroup = document.getElementById('stroke-width-group');
    const strokeWidthSlider = document.getElementById('stroke-width-slider');
    const strokeWidthValue = document.getElementById('stroke-width-value');

    // ---CONFIGURATION & STATE---
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
    const TILE_SIZE = 100;
    let GRID_COLS = 12;
    let GRID_ROWS = 3;
    let SVG_WIDTH = GRID_COLS * TILE_SIZE;
    let SVG_HEIGHT = GRID_ROWS * TILE_SIZE;
    let BACKGROUND_COLOR = '#EFEFEF';

    // ---PANEL LOGIC---
    const openPanel = () => {
        controlsPanel.classList.add('is-open');
        panelOverlay.classList.add('is-visible');
        document.body.classList.add('panel-open');
    };

    const closePanel = () => {
        controlsPanel.classList.remove('is-open');
        panelOverlay.classList.remove('is-visible');
        document.body.classList.remove('panel-open');
    };
    
    // ---ONBOARDING TOUR---
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'shadow-md bg-purple-dark',
            scrollTo: true,
            cancelIcon: { enabled: true },
        }
    });

    tour.addStep({
        title: 'Welcome!',
        text: 'Welcome to the SVG Shape Generator! This quick tour will show you the main features.',
        buttons: [{ text: 'Next', action: tour.next }]
    });
    tour.addStep({
        title: 'The Canvas',
        text: 'This is where your art is generated. You can also swipe on it to quickly change shapes or colours, or double-tap to randomise everything!',
        attachTo: { element: '#svg-container', on: 'top' },
        buttons: [{ text: 'Back', action: tour.back }, { text: 'Next', action: tour.next }]
    });
    tour.addStep({
        title: 'Open Controls',
        text: 'Tap this button to open the main controls panel where you can fine-tune your pattern.',
        attachTo: { element: '#open-controls-btn', on: 'bottom' },
        buttons: [{ text: 'Back', action: tour.back }, { text: 'Next', action: tour.next }],
        beforeShowPromise: () => new Promise(resolve => {
            closePanel();
            setTimeout(resolve, 100);
        })
    });
    tour.addStep({
        title: 'Choose Your Style',
        text: 'Inside the panel, you can control the grid layout, switch to outline mode, select colour themes, create a custom theme, and pick your favourite shapes!',
        attachTo: { element: '#controls-panel', on: 'right' },
        buttons: [{ text: 'Back', action: tour.back }, { text: 'Next', action: tour.next }],
        beforeShowPromise: () => new Promise(resolve => {
            openPanel();
            setTimeout(resolve, 400);
        })
    });
    tour.addStep({
        title: 'Randomise & Download',
        text: 'Use these buttons to randomise different parts of your pattern, then download it as a high-quality PNG or a scalable SVG file.',
        attachTo: { element: '.button-group', on: 'top' },
        buttons: [{ text: 'Back', action: tour.back }, { text: 'Done', action: tour.complete }],
        beforeShowPromise: () => new Promise(resolve => {
            closePanel();
            setTimeout(resolve, 400);
        })
    });
    
    tour.on('complete', () => localStorage.setItem('hasSeenTour', 'true'));
    tour.on('cancel', () => localStorage.setItem('hasSeenTour', 'true'));

    // ---HELPER FUNCTIONS---
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

    // ---CORE LOGIC---
    const randomiseAll = () => {
        GRID_COLS = parseInt(colsSlider.value);
        GRID_ROWS = parseInt(rowsSlider.value);
        SVG_WIDTH = GRID_COLS * TILE_SIZE;
        SVG_HEIGHT = GRID_ROWS * TILE_SIZE;
        BACKGROUND_COLOR = bgColorPicker.value;
        const density = parseFloat(densitySlider.value) / 100;
        const availableShapes = getAvailableShapes();
        const activeColors = getActiveColors();
        gridState = [];

        if (availableShapes.length === 0 || activeColors.length === 0) {
            renderGrid(); return;
        }
        
        const generationPalette = [...new Set(activeColors.sort(() => 0.5 - Math.random()))].slice(0, 5);
        if (generationPalette.length === 0) { renderGrid(); return; }

        for (let i = 0; i < GRID_ROWS; i++) {
            gridState[i] = [];
            for (let j = 0; j < GRID_COLS; j++) {
                if (Math.random() < density) {
                    gridState[i][j] = {
                        shape: availableShapes[Math.floor(Math.random() * availableShapes.length)],
                        color: generationPalette[Math.floor(Math.random() * generationPalette.length)],
                        orientation: (i + j) % 4,
                        gridIndex: i * GRID_COLS + j
                    };
                } else {
                    gridState[i][j] = { shape: 'empty', gridIndex: i * GRID_COLS + j };
                }
            }
        }
        renderGrid();
    };

    const randomiseShapes = () => {
        const availableShapes = getAvailableShapes();
        const density = parseFloat(densitySlider.value) / 100;
        if (availableShapes.length === 0 || !gridState.length) return;

        gridState.forEach((row, i) => {
            row.forEach((tile, j) => {
                if (Math.random() < density) {
                    tile.shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
                    tile.orientation = (i + j) % 4;
                } else {
                    tile.shape = 'empty';
                }
            });
        });
        renderGrid();
    };

    const randomiseColours = () => {
        const activeColors = getActiveColors();
        if (activeColors.length === 0 || !gridState.length) return;
        
        const generationPalette = [...new Set(activeColors.sort(() => 0.5 - Math.random()))].slice(0, 5);
        if(generationPalette.length === 0) return;

        gridState.forEach(row => {
            row.forEach(tile => {
                if (tile.shape !== 'empty') {
                    tile.color = generationPalette[Math.floor(Math.random() * generationPalette.length)];
                }
            });
        });
        renderGrid();
    };

    // ---RENDERING---
    const renderGrid = () => {
        svgContainer.innerHTML = '';

        const isStrokeMode = strokeToggle.checked;
        const strokeWidth = parseFloat(strokeWidthSlider.value);
        const bleed = isStrokeMode ? strokeWidth / 2 : 0;
        const viewBox = `${-bleed} ${-bleed} ${SVG_WIDTH + bleed * 2} ${SVG_HEIGHT + bleed * 2}`;
        
        const svg = createSVGElement('svg', {
            width: SVG_WIDTH, height: SVG_HEIGHT, viewBox: viewBox, id: 'generated-svg'
        });
        svg.appendChild(createSVGElement('rect', { x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT, fill: BACKGROUND_COLOR }));
        svgContainer.appendChild(svg);

        if (!gridState.length) return;

        const tilesToDraw = gridState.flat().filter(tile => tile.shape !== 'empty');
        if (tilesToDraw.length === 0) return;

        const MAX_ANIMATION_DURATION = 800;
        const perTileDelay = Math.min(15, MAX_ANIMATION_DURATION / tilesToDraw.length);

        tilesToDraw.forEach((tile, index) => {
            setTimeout(() => {
                if (!document.body.contains(svg)) return;

                const tileX = (tile.gridIndex % GRID_COLS) * TILE_SIZE;
                const tileY = Math.floor(tile.gridIndex / GRID_COLS) * TILE_SIZE;
                
                let shapeElement;
                switch (tile.shape) {
                    case 'arc': shapeElement = createQuarterCircle(tileX, tileY, TILE_SIZE, tile.color, tile.orientation, isStrokeMode, strokeWidth); break;
                    case 'eye': shapeElement = createEyeShape(tileX, tileY, TILE_SIZE, tile.color, tile.orientation, isStrokeMode, strokeWidth); break;
                    case 'semi': shapeElement = createSemiCircle(tileX, tileY, TILE_SIZE, tile.color, tile.orientation, isStrokeMode, strokeWidth); break;
                    case 'circle': shapeElement = createCircle(tileX, tileY, TILE_SIZE, tile.color, isStrokeMode, strokeWidth); break;
                }
                
                if (shapeElement) {
                    shapeElement.classList.add('shape-animated');
                    svg.appendChild(shapeElement);
                }
            }, index * perTileDelay);
        });
    };
    
    // ---CUSTOM THEME---
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

    // ---SHAPE DRAWING---
    function createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const key in attributes) { element.setAttribute(key, attributes[key]); }
        return element;
    }

    function createStyledElement(tag, baseAttrs, color, isStrokeMode, strokeWidth) {
        const attributes = { ...baseAttrs };
        if (isStrokeMode) {
            attributes.fill = 'none';
            attributes.stroke = color;
            attributes['stroke-width'] = strokeWidth;
        } else {
            attributes.fill = color;
        }
        return createSVGElement(tag, attributes);
    }
    
    function createQuarterCircle(x, y, size, color, orientation, isStrokeMode, strokeWidth) {
        let d = "";
        switch (orientation % 4) {
            case 0: d = `M${x},${y+size} A${size},${size} 0 0 1 ${x+size},${y} L${x+size},${y+size} Z`; break;
            case 1: d = `M${x+size},${y+size} A${size},${size} 0 0 0 ${x},${y} L${x},${y+size} Z`; break;
            case 2: d = `M${x+size},${y} A${size},${size} 0 0 1 ${x},${y+size} L${x},${y} Z`; break;
            case 3: d = `M${x},${y} A${size},${size} 0 0 0 ${x+size},${y+size} L${x+size},${y} Z`; break;
        }
        return createStyledElement('path', { d }, color, isStrokeMode, strokeWidth);
    }
    
    function createCircle(x, y, size, color, isStrokeMode, strokeWidth) {
        const attrs = { cx: x + size / 2, cy: y + size / 2, r: size / 2 };
        return createStyledElement('circle', attrs, color, isStrokeMode, strokeWidth);
    }

    function createSemiCircle(x, y, size, color, orientation, isStrokeMode, strokeWidth) {
        const stretchFactor = 1.5; 
        let d = "";
        switch (orientation % 4) {
            case 0: d = `M${x},${y+size} Q ${x + size/2},${y+size - size * stretchFactor} ${x+size},${y+size} Z`; break;
            case 1: d = `M${x},${y} Q ${x + size * stretchFactor},${y + size/2} ${x},${y+size} Z`; break;
            case 2: d = `M${x},${y} Q ${x + size/2},${y + size * stretchFactor} ${x+size},${y} Z`; break;
            case 3: d = `M${x+size},${y} Q ${x+size - size * stretchFactor},${y + size/2} ${x+size},${y+size} Z`; break;
        }
        return createStyledElement('path', { d }, color, isStrokeMode, strokeWidth);
    }

    function createEyeShape(x, y, size, color, orientation, isStrokeMode, strokeWidth) {
        let d = "";
        if (orientation % 2 === 0) {
            d = `M${x},${y} A ${size},${size} 0 0 1 ${x+size},${y+size} A ${size},${size} 0 0 1 ${x},${y} Z`;
        } else {
            d = `M${x+size},${y} A ${size},${size} 0 0 0 ${x},${y+size} A ${size},${size} 0 0 0 ${x+size},${y} Z`;
        }
        return createStyledElement('path', { d }, color, isStrokeMode, strokeWidth);
    }
    
    // ---DOWNLOAD & EXPORT---
    const downloadPNG = () => {
        const svg = document.getElementById('generated-svg');
        if (!svg) { console.error("No SVG found to download."); return; }
        
        const isStrokeMode = strokeToggle.checked;
        const strokeWidth = parseFloat(strokeWidthSlider.value);
        const bleed = isStrokeMode ? strokeWidth / 2 : 0;
        
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = (SVG_WIDTH + bleed * 2) * scale;
        canvas.height = (SVG_HEIGHT + bleed * 2) * scale;
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
    
    const exportSVG = () => {
        const svg = document.getElementById('generated-svg');
        if (!svg) { console.error("No SVG found to export."); return; }
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svg);
        if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated-pattern.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ---EVENT LISTENERS---
    openControlsBtn.addEventListener('click', openPanel);
    closeControlsBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);
    randomiseAllBtn.addEventListener('click', randomiseAll);
    randomiseShapesBtn.addEventListener('click', randomiseShapes);
    randomiseColoursBtn.addEventListener('click', randomiseColours);
    downloadPngBtn.addEventListener('click', downloadPNG);
    exportSvgBtn.addEventListener('click', exportSVG);
    showTourBtn.addEventListener('click', () => {
        localStorage.removeItem('hasSeenTour');
        tour.start();
    });
    
    themeRadios.forEach(radio => radio.addEventListener('change', randomiseAll));
    shapeCheckboxes.forEach(checkbox => checkbox.addEventListener('change', randomiseAll));
    
    addColorBtn.addEventListener('click', addColor);
    customThemeSwatches.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-swatch')) {
            removeColor(e.target.dataset.index);
        }
    });

    colsSlider.addEventListener('input', () => { colsValue.textContent = colsSlider.value; });
    colsSlider.addEventListener('change', randomiseAll);
    rowsSlider.addEventListener('input', () => { rowsValue.textContent = rowsSlider.value; });
    rowsSlider.addEventListener('change', randomiseAll);
    bgColorPicker.addEventListener('input', randomiseAll);
    densitySlider.addEventListener('input', () => { densityValue.textContent = densitySlider.value; });
    densitySlider.addEventListener('change', randomiseAll);
    
    strokeToggle.addEventListener('change', () => {
        strokeWidthGroup.classList.toggle('hidden', !strokeToggle.checked);
        renderGrid();
    });
    
    strokeWidthSlider.addEventListener('input', () => { strokeWidthValue.textContent = strokeWidthSlider.value; });
    strokeWidthSlider.addEventListener('change', renderGrid);

    controlsPanel.addEventListener('click', (e) => {
        if (!e.target.classList.contains('stepper-btn')) return;
        const targetSliderId = e.target.dataset.target;
        const step = parseInt(e.target.dataset.step, 10);
        const slider = document.getElementById(targetSliderId);

        if (slider) {
            const min = parseInt(slider.min, 10);
            const max = parseInt(slider.max, 10);
            let currentValue = parseInt(slider.value, 10);
            
            let newValue = currentValue + step;
            if (newValue < min) newValue = min;
            if (newValue > max) newValue = max;

            slider.value = newValue;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    let touchstartX = 0;
    let touchstartY = 0;
    let lastTap = 0;
    const swipeThreshold = 50;

    svgContainer.addEventListener('touchstart', (e) => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    }, { passive: true });

    svgContainer.addEventListener('touchend', (e) => {
        const touchendX = e.changedTouches[0].screenX;
        const touchendY = e.changedTouches[0].screenY;
        const dX = touchendX - touchstartX;
        const dY = touchendY - touchstartY;

        if (Math.abs(dX) > swipeThreshold || Math.abs(dY) > swipeThreshold) {
            if (Math.abs(dX) > Math.abs(dY)) {
                randomiseShapes();
            } else {
                randomiseColours();
            }
        } else {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                randomiseAll();
            }
            lastTap = currentTime;
        }
    }, { passive: true });

    svgContainer.addEventListener('dblclick', randomiseAll);
    
    // ---INITIAL SETUP---
    renderSwatches();
    randomiseAll();

    if (!localStorage.getItem('hasSeenTour')) {
        setTimeout(() => {
            tour.start();
        }, 1000);
    }
});