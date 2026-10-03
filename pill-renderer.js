/**
 * PillRenderer - High fidelity 2D/3D pill simulator for on-dose 5mm micro-QR stamping
 */

class PillRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.currentPill = null;
    this.currentFace = 'top'; // 'top' or 'back'
    this.qrImage = null;
    this.setupRetina();
  }

  setupRetina() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  setPill(pillData, qrImageElement) {
    this.currentPill = pillData;
    this.qrImage = qrImageElement;
    this.render();
  }

  setFace(face) {
    this.currentFace = face;
    this.render();
  }

  render() {
    if (!this.ctx || !this.currentPill) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle lab workbench background grid
    this.drawBackground(ctx, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    switch (this.currentPill.id) {
      case 'paracetamol':
        this.drawParacetamol(ctx, centerX, centerY);
        break;
      case 'ibuprofen':
        this.drawIbuprofen(ctx, centerX, centerY);
        break;
      case 'amoxicillin':
        this.drawAmoxicillin(ctx, centerX, centerY);
        break;
      default:
        this.drawParacetamol(ctx, centerX, centerY);
    }
  }

  drawBackground(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Scale reference badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('STAMP SIMULATION: 5×5mm MICRO-QR ON DOSE', 16, 22);
    ctx.restore();
  }

  // Draw Paracetamol: Elongated White Caplet with central score line
  drawParacetamol(ctx, cx, cy) {
    ctx.save();
    const pillW = 240;
    const pillH = 100;
    const radius = 50;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 15;

    // Main Caplet Shape
    ctx.beginPath();
    ctx.roundRect(cx - pillW / 2, cy - pillH / 2, pillW, pillH, radius);

    // Bevel gradient
    const grad = ctx.createLinearGradient(cx - pillW / 2, cy - pillH / 2, cx + pillW / 2, cy + pillH / 2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#f1f5f9');
    grad.addColorStop(0.7, '#e2e8f0');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Edge highlight (specular reflection)
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();

    // Subtle inner bevel curve
    ctx.beginPath();
    ctx.roundRect(cx - pillW / 2 + 6, cy - pillH / 2 + 6, pillW - 12, pillH - 12, radius - 6);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Score line (break line across middle)
    ctx.beginPath();
    ctx.moveTo(cx, cy - pillH / 2 + 10);
    ctx.lineTo(cx, cy + pillH / 2 - 10);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // High relief shadow next to score line
    ctx.beginPath();
    ctx.moveTo(cx + 1.5, cy - pillH / 2 + 10);
    ctx.lineTo(cx + 1.5, cy + pillH / 2 - 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw On-Dose Markings
    if (this.currentFace === 'top') {
      // Top face: Printed 5x5mm QR code on one lobe, pharma text on the other
      this.drawStampedQR(ctx, cx - 60, cy, 64);

      // Engraved identification text on other side
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PARA 500', cx + 60, cy - 6);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('BP / USP', cx + 60, cy + 12);
    } else {
      // Back face: Alternative print or clean score line
      this.drawStampedQR(ctx, cx + 60, cy, 64);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BIO-PHARMA', cx - 60, cy);
    }

    ctx.restore();
  }

  // Draw Ibuprofen: Coated Round Tablet (Warm Red / Orange Terracotta)
  drawIbuprofen(ctx, cx, cy) {
    ctx.save();
    const radius = 75;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;

    // Convex circular tablet
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    // Coated sugar / film gradient
    const grad = ctx.createRadialGradient(cx - 25, cy - 25, 10, cx, cy, radius);
    grad.addColorStop(0, '#f87171');
    grad.addColorStop(0.4, '#ef4444');
    grad.addColorStop(0.85, '#dc2626');
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Specular highlight rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Convex dome highlight
    const domeGrad = ctx.createRadialGradient(cx - 30, cy - 30, 5, cx - 20, cy - 20, 60);
    domeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    domeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw QR Code stamped at center
    if (this.currentFace === 'top') {
      // 5mm printed code at center with food-grade edible contrast pad
      this.drawStampedQR(ctx, cx, cy, 70, true);
    } else {
      // Back face with embossed dosage
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('IBU 400', cx, cy - 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('CH 442', cx, cy + 16);
    }

    ctx.restore();
  }

  // Draw Amoxicillin: Two-Tone Capsule (Maroon Cap & Amber Body)
  drawAmoxicillin(ctx, cx, cy) {
    ctx.save();
    const capW = 120;
    const bodyW = 130;
    const totalW = capW + bodyW;
    const capsuleH = 88;
    const r = capsuleH / 2;

    const startX = cx - totalW / 2;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;

    // First draw Amber/Yellow Body (Right side)
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - r);
    ctx.lineTo(startX + totalW - r, cy - r);
    ctx.arc(startX + totalW - r, cy, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(cx - 10, cy + r);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    bodyGrad.addColorStop(0, '#fef08a');
    bodyGrad.addColorStop(0.3, '#facc15');
    bodyGrad.addColorStop(0.7, '#eab308');
    bodyGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Second draw Maroon Cap (Left side - overlaps body slightly)
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - r - 2);
    ctx.arc(startX + r, cy, r + 2, Math.PI / 2, -Math.PI / 2);
    ctx.lineTo(cx + 8, cy - r - 2);
    ctx.closePath();

    const capGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    capGrad.addColorStop(0, '#9f1239');
    capGrad.addColorStop(0.3, '#881337');
    capGrad.addColorStop(0.7, '#4c0519');
    capGrad.addColorStop(1, '#2e020f');
    ctx.fillStyle = capGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Interlocking joint ring rim
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - r - 2);
    ctx.lineTo(cx + 8, cy + r + 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // High gloss reflection along top edge of capsule
    ctx.beginPath();
    ctx.ellipse(cx, cy - r + 14, totalW * 0.42, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // Draw Stamped Micro-QR
    if (this.currentFace === 'top') {
      // Stamped onto the amber body flat cylinder
      this.drawStampedQR(ctx, cx + 55, cy, 60);

      // Engraved AMX 500 on the maroon cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AMX 500', cx - 50, cy);
    } else {
      // Back face
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOT 919', cx - 50, cy);
      ctx.fillStyle = '#713f12';
      ctx.fillText('APEX LABS', cx + 55, cy);
    }

    ctx.restore();
  }

  // Draw Stamped QR Code onto tablet surface
  drawStampedQR(ctx, x, y, size, addWhiteBacking = false) {
    const half = size / 2;

    if (addWhiteBacking) {
      // Edible titanium dioxide white ink base layer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x - half - 4, y - half - 4, size + 8, size + 8, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Try to draw from actual QR image or canvas
    if (this.qrImage) {
      try {
        ctx.drawImage(this.qrImage, x - half, y - half, size, size);
      } catch (e) {
        this.drawMockQRMatrix(ctx, x - half, y - half, size);
      }
    } else {
      this.drawMockQRMatrix(ctx, x - half, y - half, size);
    }

    // Target caliper crosshairs (5x5mm stamp indicator)
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x - half - 3, y - half - 3, size + 6, size + 6);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '9px var(--font-mono, monospace)';
    ctx.textAlign = 'center';
    ctx.fillText('5×5mm', x, y + half + 14);
    ctx.restore();
  }

  drawMockQRMatrix(ctx, x, y, size) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#000000';

    // 3 standard finder patterns
    const pSize = size * 0.28;
    this.drawFinderPattern(ctx, x, y, pSize);
    this.drawFinderPattern(ctx, x + size - pSize, y, pSize);
    this.drawFinderPattern(ctx, x, y + size - pSize, pSize);

    // Random micro dots
    const mod = size / 15;
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if ((r < 5 && c < 5) || (r < 5 && c > 9) || (r > 9 && c < 5)) continue;
        if ((r * 7 + c * 13) % 3 === 0) {
          ctx.fillRect(x + c * mod, y + r * mod, mod, mod);
        }
      }
    }
  }

  drawFinderPattern(ctx, x, y, s) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + s * 0.2, y + s * 0.2, s * 0.6, s * 0.6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + s * 0.35, y + s * 0.35, s * 0.3, s * 0.3);
  }
}

window.PillRenderer = PillRenderer;
