document.addEventListener('DOMContentLoaded', () => {
    // Control elements
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const svgContainer = document.getElementById('svg-container');
    const themeCheckboxes = document.querySelectorAll('#theme-options input[type="checkbox"]');
    const shapeCheckboxes = document.querySelectorAll('#shape-options input[type="checkbox"]');

    // ---CONFIGURATION---
    const THEMES = {
        codeEditor: ['#E91E63', '#cc0000', '#FF9800', '#0000DD', '#0066bb', '#336699', '#bb0066', '#22bb22'],
        sunset: ['#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B'],
        oceanDeep: ['#001219', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00', '#CA6702'],
        forestFloor: ['#283618', '#606C38', '#DDA15E', '#BC6C25', '#FEFAE0', '#A3A380', '#582F0E'],
        monochrome: ['#212529', '#495057', '#6C757D', '#ADB5BD', '#DEE2E6', '#F8F9FA'],
        pastelDream: ['#FAD2E1', '#E2ECE9', '#BEE1E6', '#F0EFEB', '#FFD8BE', '#DFE7FD'],
        neonGlow: ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0', '#00F5D4'],
    };
    
    const BACKGROUND_COLOR = '#EFEFEF';
    const SVG_WIDTH = 1584;
    const SVG_HEIGHT = 396;
    const GRID_COLS = 12;
    const GRID_ROWS = 3;
    const TILE_SIZE = SVG_WIDTH / GRID_COLS;

    function createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
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
        return createSVGElement('circle', {
            cx: x + size / 2,
            cy: y + size / 2,
            r: size / 2,
            fill: color
        });
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

    const generatePattern = () => {
        svgContainer.innerHTML = '';
        const svg = createSVGElement('svg', {
            width: SVG_WIDTH, height: SVG_HEIGHT, viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`, id: 'generated-svg'
        });
        svg.appendChild(createSVGElement('rect', {
            x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT, fill: BACKGROUND_COLOR
        }));

        let combinedColors = [];
        themeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                combinedColors = combinedColors.concat(THEMES[checkbox.value]);
            }
        });

        if (combinedColors.length === 0) {
            combinedColors = THEMES.codeEditor;
        }

        const shuffledColors = combinedColors.sort(() => 0.5 - Math.random());
        const uniqueColors = [...new Set(shuffledColors)]; 
        const generationPalette = uniqueColors.slice(0, 5);

        const availableShapes = [];
        shapeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                availableShapes.push(checkbox.value);
            }
        });

        if (availableShapes.length === 0 || generationPalette.length === 0) {
            svgContainer.appendChild(svg);
            return;
        }

        for (let i = 0; i < GRID_ROWS; i++) {
            for (let j = 0; j < GRID_COLS; j++) {
                const tileX = j * TILE_SIZE;
                const tileY = i * TILE_SIZE;
                const shapeType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
                const fillColor = generationPalette[Math.floor(Math.random() * generationPalette.length)];
                const orientation = (i + j) % 4;

                switch (shapeType) {
                    case 'arc':
                        svg.appendChild(createQuarterCircle(tileX, tileY, TILE_SIZE, fillColor, orientation));
                        break;
                    case 'eye':
                        svg.appendChild(createEyeShape(tileX, tileY, TILE_SIZE, fillColor, orientation));
                        break;
                    case 'semi':
                        svg.appendChild(createSemiCircle(tileX, tileY, TILE_SIZE, fillColor, orientation));
                        break;
                    case 'circle':
                        svg.appendChild(createCircle(tileX, tileY, TILE_SIZE, fillColor));
                        break;
                }
            }
        }
        svgContainer.appendChild(svg);
    };
    
    const downloadPattern = () => {
        const svg = document.getElementById('generated-svg');
        if (!svg) {
            console.error("No SVG found to download.");
            return;
        }

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

    generateBtn.addEventListener('click', generatePattern);
    downloadBtn.addEventListener('click', downloadPattern);
    
    document.querySelectorAll('.options-fieldset input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', generatePattern);
    });

    generatePattern();
});