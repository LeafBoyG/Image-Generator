// script.js

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const svgContainer = document.getElementById('svg-container');
    const downloadBtn = document.getElementById('download-btn'); // Get the new button

    const COLORS = [
        '#E91E63', '#cc0000', '#FF9800', '#0000DD', '#0066bb',
        '#336699', '#bb0066', '#22bb22', '#dd7700', '#3333bb',
        '#003388',
    ];

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

    function createQuarterCircle(x, y, size, color) {
        const path = createSVGElement('path', { fill: color });
        const corner = Math.floor(Math.random() * 4);
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

    const generatePattern = () => {
        svgContainer.innerHTML = '';
        const svg = createSVGElement('svg', {
            width: SVG_WIDTH,
            height: SVG_HEIGHT,
            viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`,
            id: 'generated-svg'
        });

        svg.appendChild(createSVGElement('rect', {
            x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT, fill: BACKGROUND_COLOR
        }));

        for (let i = 0; i < GRID_ROWS; i++) {
            for (let j = 0; j < GRID_COLS; j++) {
                const x = j * TILE_SIZE;
                const y = i * TILE_SIZE;
                const fillColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                svg.appendChild(createQuarterCircle(x, y, TILE_SIZE, fillColor));
            }
        }
        
        svgContainer.appendChild(svg);
    };

    // --- NEW: DOWNLOAD FUNCTION ---
    const downloadPattern = () => {
        const svg = document.getElementById('generated-svg');
        if (!svg) {
            console.error("No SVG found to download.");
            return;
        }

        // 1. Convert SVG to a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        // 2. Create a canvas to draw the SVG on
        const canvas = document.createElement('canvas');
        canvas.width = SVG_WIDTH;
        canvas.height = SVG_HEIGHT;
        const ctx = canvas.getContext('2d');

        // 3. Create an image, load the SVG string as its source
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function () {
            // 4. Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url); // Free up memory

            // 5. Create a link to download the canvas content as a PNG
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'generated-pattern.png'; // The filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.src = url;
    };

    // Attach event listeners
    generateBtn.addEventListener('click', generatePattern);
    downloadBtn.addEventListener('click', downloadPattern); // Attach to the new button

    // Generate a pattern on page load
    generatePattern();
});