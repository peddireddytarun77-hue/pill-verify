/**
 * PharmaVerify 5x5mm Pill Studio - Lab & Administration Hub
 * Manages pill database, 5x5mm QR rendering, physical scale calibration, and phone scan simulation.
 */

// Global State
let pillDatabase = [];
let currentPillId = 'paracetamol';
let currentPayloadMode = 'spec'; // 'spec' (text + link), 'directUrl', 'compact'
let currentLinkBase = 'github'; // 'github' or 'local'
let currentFace = 'top';
let pillRenderer = null;
let currentQrInstance = null;
let html5QrScanner = null;

const GITHUB_USER = 'peddireddytarun77-hue';
const GITHUB_BASE_URL = `https://${GITHUB_USER}.github.io/pill-verify/verify.html`;
const LOCAL_BASE_URL = `${window.location.origin}/verify.html`;

document.addEventListener('DOMContentLoaded', async () => {
  await loadPillDatabase();
  initRenderer();
  setupEventListeners();
  selectPill('paracetamol');
});

// Load database from database.json with fallback
async function loadPillDatabase() {
  try {
    const res = await fetch('database.json');
    if (res.ok) {
      const data = await res.json();
      pillDatabase = data.pills;
    } else {
      throw new Error('Fallback to internal');
    }
  } catch (e) {
    console.warn('Loading fallback internal database:', e);
    pillDatabase = [
      {
        id: "paracetamol",
        code: "PARA-500",
        name: "Paracetamol",
        genericName: "Acetaminophen",
        dosage: "500 mg",
        indication: "Treats fever and mild pain.",
        category: "Analgesic & Antipyretic",
        mfgDate: "2026-02-15",
        expDate: "2028-02-15",
        batchNumber: "LOT-PRX-2026-081",
        serialNumber: "SN-PARA-9842103",
        manufacturer: "BioPharma Core Ltd.",
        mfgLicense: "MFG-FDA-IND-88210",
        authenticityStatus: "VERIFIED_GENUINE",
        pillPhysicalSpecs: {
          form: "Oblong Caplet Tablet",
          color: "#F8FAFC",
          dimensions: "16.5 mm × 7.2 mm",
          qrPrintPlacement: "Top Face Center",
          qrTargetSize: "5 mm × 5 mm"
        }
      },
      {
        id: "ibuprofen",
        code: "IBU-400",
        name: "Ibuprofen",
        genericName: "Isobutylphenylpropionic Acid",
        dosage: "400 mg",
        indication: "Reduces pain, swelling, and fever.",
        category: "Non-Steroidal Anti-Inflammatory Drug (NSAID)",
        mfgDate: "2026-01-10",
        expDate: "2028-01-10",
        batchNumber: "LOT-IBU-2026-442",
        serialNumber: "SN-IBU-7740192",
        manufacturer: "CareHealth Therapeutics",
        mfgLicense: "MFG-FDA-IND-54192",
        authenticityStatus: "VERIFIED_GENUINE",
        pillPhysicalSpecs: {
          form: "Round Coated Tablet",
          color: "#D9534F",
          dimensions: "10.0 mm Diameter",
          qrPrintPlacement: "Convex Center Face",
          qrTargetSize: "5 mm × 5 mm"
        }
      },
      {
        id: "amoxicillin",
        code: "AMX-500",
        name: "Amoxicillin",
        genericName: "Amoxicillin Trihydrate",
        dosage: "500 mg",
        indication: "Treats bacterial infections like chest or ear infections.",
        category: "Broad-Spectrum Penicillin Antibiotic",
        mfgDate: "2026-03-01",
        expDate: "2027-09-01",
        batchNumber: "LOT-AMX-2026-919",
        serialNumber: "SN-AMX-3301984",
        manufacturer: "Apex LifeSciences",
        mfgLicense: "MFG-FDA-IND-31048",
        authenticityStatus: "VERIFIED_GENUINE",
        pillPhysicalSpecs: {
          form: "Two-Tone Hard Gelatin Capsule",
          color: "#800020",
          dimensions: "19.4 mm × 6.8 mm",
          qrPrintPlacement: "Body Section Cylindrical Band",
          qrTargetSize: "5 mm × 5 mm"
        }
      }
    ];
  }
}

function initRenderer() {
  if (window.PillRenderer) {
    pillRenderer = new window.PillRenderer('pillPreviewCanvas');
  }
}

function setupEventListeners() {
  // Pill Card Clicks
  document.querySelectorAll('.pill-card').forEach(card => {
    card.addEventListener('click', () => {
      const pillId = card.getAttribute('data-pill-id');
      selectPill(pillId);
    });
  });

  // Pill Face Toggle Buttons
  const btnTop = document.getElementById('faceTopBtn');
  const btnBack = document.getElementById('faceBackBtn');
  if (btnTop && btnBack) {
    btnTop.addEventListener('click', () => {
      currentFace = 'top';
      btnTop.classList.add('active');
      btnBack.classList.remove('active');
      if (pillRenderer) pillRenderer.setFace('top');
      updatePillStampText();
    });
    btnBack.addEventListener('click', () => {
      currentFace = 'back';
      btnBack.classList.add('active');
      btnTop.classList.remove('active');
      if (pillRenderer) pillRenderer.setFace('back');
      updatePillStampText();
    });
  }

  // Payload Mode Radio/Select
  const payloadModeSelect = document.getElementById('payloadModeSelect');
  if (payloadModeSelect) {
    payloadModeSelect.addEventListener('change', (e) => {
      currentPayloadMode = e.target.value;
      regenerateQR();
    });
  }

  // Link Base Toggle (GitHub Pages vs Localhost)
  const linkBaseSelect = document.getElementById('linkBaseSelect');
  if (linkBaseSelect) {
    linkBaseSelect.addEventListener('change', (e) => {
      currentLinkBase = e.target.value;
      regenerateQR();
    });
  }

  // Download SVG
  const btnDownloadSvg = document.getElementById('btnDownloadSvg');
  if (btnDownloadSvg) {
    btnDownloadSvg.addEventListener('click', downloadQrSvg);
  }

  // Download High-Res PNG (600 DPI 5x5mm)
  const btnDownloadPng = document.getElementById('btnDownloadPng');
  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', downloadHighResPng);
  }

  // Print 5mm Sheet
  const btnPrintSheet = document.getElementById('btnPrintSheet');
  if (btnPrintSheet) {
    btnPrintSheet.addEventListener('click', printPillSheet);
  }

  // Simulate Scan Button
  const btnSimulateScan = document.getElementById('btnSimulateScan');
  if (btnSimulateScan) {
    btnSimulateScan.addEventListener('click', openSimulatedScanModal);
  }

  // Camera Scanner Toggle
  const btnToggleCamera = document.getElementById('btnToggleCamera');
  if (btnToggleCamera) {
    btnToggleCamera.addEventListener('click', toggleCameraScanner);
  }

  // Modal Close
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('simulatedScanModal');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });
  }
}

function selectPill(pillId) {
  currentPillId = pillId;

  // Update UI pill cards
  document.querySelectorAll('.pill-card').forEach(card => {
    if (card.getAttribute('data-pill-id') === pillId) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // Regenerate QR with updated pill info
  regenerateQR();
  updatePillStampText();
}

function getActivePill() {
  return pillDatabase.find(p => p.id === currentPillId) || pillDatabase[0];
}

function getVerificationUrl(pillId) {
  const base = currentLinkBase === 'github' ? GITHUB_BASE_URL : LOCAL_BASE_URL;
  return `${base}?id=${pillId}`;
}

// Builds the payload according to user requirements
function buildPayload(pill) {
  const verifyUrl = getVerificationUrl(pill.id);

  if (currentPayloadMode === 'spec') {
    // EXACT USER SPECIFICATION:
    // "When I scan the QR in first shows pill name manfacture and expiry date 
    // And last a common http link that directly redirects to the web page connects to the data base"
    return `PILL: ${pill.name} ${pill.dosage}\nMFG: ${pill.mfgDate}\nEXP: ${pill.expDate}\nLINK: ${verifyUrl}`;
  } else if (currentPayloadMode === 'directUrl') {
    // Direct URL mode (instantly navigates browser)
    return verifyUrl;
  } else {
    // Compact Pharma JSON
    return JSON.stringify({
      pill: pill.name,
      mfg: pill.mfgDate,
      exp: pill.expDate,
      url: verifyUrl
    });
  }
}

function regenerateQR() {
  const pill = getActivePill();
  if (!pill) return;

  const payload = buildPayload(pill);
  const verifyUrl = getVerificationUrl(pill.id);

  // Update Payload Display
  const payloadDisplay = document.getElementById('payloadDisplay');
  if (payloadDisplay) {
    payloadDisplay.textContent = payload;
  }

  // Update payload breakdown
  document.getElementById('breakdownPill').textContent = `${pill.name} (${pill.dosage})`;
  document.getElementById('breakdownMfg').textContent = pill.mfgDate;
  document.getElementById('breakdownExp').textContent = pill.expDate;
  
  const linkElem = document.getElementById('breakdownLink');
  if (linkElem) {
    linkElem.href = verifyUrl;
    linkElem.textContent = verifyUrl;
  }

  // Clear previous QR containers
  const microTarget = document.getElementById('microQrTarget');
  const magnifiedTarget = document.getElementById('magnifiedQrTarget');
  if (microTarget) microTarget.innerHTML = '';
  if (magnifiedTarget) magnifiedTarget.innerHTML = '';

  // Generate 5x5mm Micro QR code
  // Uses qrcodejs library
  if (window.QRCode) {
    // 1. Generate Magnified (160x160px for high visibility inspection)
    new QRCode(magnifiedTarget, {
      text: payload,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    // 2. Generate Micro QR (small container calibrated to 5mm x 5mm)
    new QRCode(microTarget, {
      text: payload,
      width: 64,
      height: 64,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    // Wait a brief tick for the canvas/image to render then update the pill visualizer
    setTimeout(() => {
      const qrCanvas = magnifiedTarget.querySelector('canvas') || magnifiedTarget.querySelector('img');
      if (pillRenderer) {
        pillRenderer.setPill(pill, qrCanvas);
      }
    }, 80);
  }
}

function updatePillStampText() {
  const pill = getActivePill();
  if (!pill) return;
  const stampInfo = document.getElementById('pillStampInfo');
  if (stampInfo) {
    const faceText = currentFace === 'top' ? 'Top Surface (Primary Dose Face)' : 'Back / Reverse Surface';
    stampInfo.innerHTML = `<strong>${pill.name}</strong> • ${faceText} • Target Area: <strong>5 mm × 5 mm</strong> Micro-Zone`;
  }
}

// Download High Resolution 600 DPI PNG calibrated for 5mm x 5mm edible printer
function downloadHighResPng() {
  const pill = getActivePill();
  const payload = buildPayload(pill);

  // 5mm at 600 DPI is approx 118 x 118 pixels.
  // We render at 300x300 for razor-sharp clarity.
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 300;
  tempCanvas.height = 300;
  const tempContainer = document.createElement('div');
  tempContainer.style.display = 'none';
  document.body.appendChild(tempContainer);

  const qr = new QRCode(tempContainer, {
    text: payload,
    width: 300,
    height: 300,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    const canvas = tempContainer.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${pill.id}_5x5mm_micro_qr_600dpi.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    document.body.removeChild(tempContainer);
  }, 100);
}

// Download Vector SVG for laser micro-etching
function downloadQrSvg() {
  const pill = getActivePill();
  const magnifiedTarget = document.getElementById('magnifiedQrTarget');
  const canvas = magnifiedTarget.querySelector('canvas');
  if (!canvas) return;

  // Convert canvas pixels to simple vector SVG rects
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const size = canvas.width;
  
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="5mm" height="5mm" viewBox="0 0 ${size} ${size}">`;
  svgContent += `<rect width="100%" height="100%" fill="#ffffff"/>`;

  // Detect dark pixels
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const r = imgData.data[idx];
      if (r < 128) {
        svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000000"/>`;
      }
    }
  }
  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${pill.id}_5x5mm_vector_laser.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Print 5mm Pill Calibrated Stencil Sheet
function printPillSheet() {
  window.print();
}

// Simulated Scan Modal (Demonstrates how a phone camera reads the payload)
function openSimulatedScanModal() {
  const pill = getActivePill();
  const verifyUrl = getVerificationUrl(pill.id);

  document.getElementById('simPillName').textContent = `${pill.name} (${pill.dosage})`;
  document.getElementById('simMfg').textContent = pill.mfgDate;
  document.getElementById('simExp').textContent = pill.expDate;
  
  const linkElem = document.getElementById('simRedirectBtn');
  linkElem.href = verifyUrl;
  linkElem.textContent = `Open Authenticated Database: ${pill.name}`;

  document.getElementById('simulatedScanModal').style.display = 'flex';
}

// HTML5 Camera QR Scanner
function toggleCameraScanner() {
  const readerDiv = document.getElementById('reader');
  const btn = document.getElementById('btnToggleCamera');

  if (html5QrScanner) {
    html5QrScanner.stop().then(() => {
      html5QrScanner = null;
      readerDiv.style.display = 'none';
      btn.textContent = 'Scan with Camera';
    }).catch(err => console.error(err));
    return;
  }

  readerDiv.style.display = 'block';
  btn.textContent = 'Stop Camera';

  if (window.Html5Qrcode) {
    html5QrScanner = new Html5Qrcode("reader");
    html5QrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        // Successful scan!
        html5QrScanner.stop();
        html5QrScanner = null;
        readerDiv.style.display = 'none';
        btn.textContent = 'Scan with Camera';

        // Check if contains URL or matches our pills
        const match = decodedText.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          window.location.href = `verify.html?id=${match[1]}`;
        } else {
          alert("Scanned QR Code:\n" + decodedText);
        }
      },
      (error) => {
        // Continuous scan frame
      }
    ).catch(err => {
      alert("Camera access was not granted or not available. Use the 'Simulate Smartphone Scan' button to preview the mobile scanner experience!");
      readerDiv.style.display = 'none';
      btn.textContent = 'Scan with Camera';
      html5QrScanner = null;
    });
  }
}
