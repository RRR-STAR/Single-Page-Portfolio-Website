/**
 * ImageGenerator - Canvas-based image/icon generator
 * Creates unique, deterministic images from text descriptions.
 * No external APIs required — fully offline.
 */
const ImageGenerator = {

  /**
   * Hash a string to a numeric seed value
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) || 1;
  },

  /**
   * Seeded pseudo-random number generator
   */
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  },

  /**
   * Generate an array of harmonious HSL colors from a seed
   */
  generateColors(seed, count) {
    const colors = [];
    const baseHue = (this.seededRandom(seed) * 360) | 0;
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + i * 47 + (this.seededRandom(seed + i * 137) * 60)) % 360 | 0;
      const sat = 55 + (this.seededRandom(seed + i * 271) * 35) | 0;
      const light = 35 + (this.seededRandom(seed + i * 413) * 35) | 0;
      colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
    }
    return colors;
  },

  /**
   * Generate a full-size abstract image from text
   * @param {string} text - Description text
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {string} data URL (PNG)
   */
  generateFromText(text, width = 800, height = 600) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const seed = this.hashString(text);
    const colors = this.generateColors(seed, 5);

    // Multi-stop gradient background
    const angle = this.seededRandom(seed + 99) * Math.PI * 2;
    const gx1 = width / 2 + Math.cos(angle) * width / 2;
    const gy1 = height / 2 + Math.sin(angle) * height / 2;
    const gx2 = width / 2 - Math.cos(angle) * width / 2;
    const gy2 = height / 2 - Math.sin(angle) * height / 2;
    const gradient = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.4, colors[1]);
    gradient.addColorStop(0.7, colors[2]);
    gradient.addColorStop(1, colors[3]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric shapes
    const shapeCount = 6 + (seed % 8);
    for (let i = 0; i < shapeCount; i++) {
      const s = seed + i * 173;
      ctx.globalAlpha = 0.08 + this.seededRandom(s + 1) * 0.18;
      ctx.fillStyle = colors[i % colors.length];

      const shapeType = (this.seededRandom(s) * 4) | 0;
      const x = this.seededRandom(s + 10) * width;
      const y = this.seededRandom(s + 20) * height;
      const size = 30 + this.seededRandom(s + 30) * Math.min(width, height) * 0.35;

      ctx.beginPath();
      if (shapeType === 0) {
        // Circle
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shapeType === 1) {
        // Rounded rectangle
        const rw = size;
        const rh = size * (0.4 + this.seededRandom(s + 40) * 0.8);
        const r = Math.min(rw, rh) * 0.2;
        ctx.roundRect(x - rw / 2, y - rh / 2, rw, rh, r);
        ctx.fill();
      } else if (shapeType === 2) {
        // Triangle
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Ring
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.lineWidth = size * 0.12;
        ctx.strokeStyle = colors[(i + 2) % colors.length];
        ctx.globalAlpha = 0.15;
        ctx.stroke();
      }
    }

    // Mesh-like connecting lines
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const s = seed + i * 500;
      ctx.beginPath();
      ctx.moveTo(this.seededRandom(s) * width, this.seededRandom(s + 1) * height);
      ctx.bezierCurveTo(
        this.seededRandom(s + 2) * width, this.seededRandom(s + 3) * height,
        this.seededRandom(s + 4) * width, this.seededRandom(s + 5) * height,
        this.seededRandom(s + 6) * width, this.seededRandom(s + 7) * height
      );
      ctx.stroke();
    }

    // Large watermark letter
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffffff';
    const fontSize = Math.min(width, height) * 0.35;
    ctx.font = `bold ${fontSize}px 'Montserrat', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const letter = text.trim().charAt(0).toUpperCase();
    ctx.fillText(letter, width / 2, height / 2);

    // Subtle noise overlay for texture
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 2000; i++) {
      const nx = Math.random() * width;
      const ny = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(nx, ny, 1, 1);
    }

    ctx.globalAlpha = 1;
    return canvas.toDataURL('image/png');
  },

  /**
   * Generate a smaller icon-style image from text
   * @param {string} text - Description text
   * @param {number} size - Icon size (square)
   * @returns {string} data URL (PNG)
   */
  generateIcon(text, size = 200) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const seed = this.hashString(text);
    const colors = this.generateColors(seed, 3);

    // Circular gradient background
    const gradient = ctx.createRadialGradient(
      size * 0.4, size * 0.35, 0,
      size / 2, size / 2, size * 0.55
    );
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.7, colors[1]);
    gradient.addColorStop(1, colors[2]);

    // Draw circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Inner decorative ring
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.04;
    ctx.stroke();

    // Small accent dots
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 5; i++) {
      const s = seed + i * 200;
      const angle = this.seededRandom(s) * Math.PI * 2;
      const dist = size * 0.2 + this.seededRandom(s + 1) * size * 0.15;
      const dx = size / 2 + Math.cos(angle) * dist;
      const dy = size / 2 + Math.sin(angle) * dist;
      const dotSize = 2 + this.seededRandom(s + 2) * size * 0.04;
      ctx.beginPath();
      ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Center letter
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    const fontSize = size * 0.38;
    ctx.font = `bold ${fontSize}px 'Montserrat', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const letter = text.trim().charAt(0).toUpperCase();

    // Text shadow
    ctx.globalAlpha = 0.3;
    ctx.fillText(letter, size / 2 + 2, size / 2 + 2);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(letter, size / 2, size / 2);

    ctx.globalAlpha = 1;
    return canvas.toDataURL('image/png');
  }
};
