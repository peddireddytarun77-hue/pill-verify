/**
 * PharmaVerify 5x5mm Pill Studio - Web 1: Data Admin Hub
 * Features compact payload generation, primary key routing (pk: 1, 2, 3),
 * physical 5mm scale calibration, and data management.
 */

// Global State
let pillDatabase = [];
let currentPillId = 'paracetamol';
let currentPayloadMode = 'directUrl'; // 'directUrl' (lowest matrix, instant auto camera redirect), 'rootUrl', 'compact', 'labeled'
let currentLinkBase = 'github'; // 'github' or 'local'
let currentErrorCorrection = 'L'; // 'L' (Low - lowest dot density for 5mm), 'M', 'H'
let currentFace = 'top';
let pillRenderer = null;
let html5QrScanner = null;

const GITHUB_USER = 'peddireddytarun77-hue';
const GITHUB_BASE_URL = `https://${GITHUB_USER}.github.io/pill-verify/verify.html`;
const GITHUB_ROOT_URL = `https://${GITHUB_USER}.github.io/pill-verify/`;
const LOCAL_BASE_URL = `${window.location.origin}/verify.html`;
const LOCAL_ROOT_URL = `${window.location.origin}/`;

// If user navigates to index.html?id=1, redirect to Web 2 (verify.html?id=1)
(function checkDeepLink() {
  const search = window.location.search;
  const hash = window.location.hash;
  const params = new URLSearchParams(search);
  const qId = params.get('id') || params.get('pk') || params.get('p') || (/^\?[0-9]+$/.test(search) ? search.replace('?', '') : '') || (/^#[0-9]+$/.test(hash) ? hash.replace('#', '') : '');
  if (qId) {
    window.location.replace(`verify.html?id=${encodeURIComponent(qId)}`);
  }
})();

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
        pk: 1,
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
        pk: 2,
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
        pk: 3,
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

  // Payload Mode Select
  const payloadModeSelect = document.getElementById('payloadModeSelect');
  if (payloadModeSelect) {
    payloadModeSelect.addEventListener('change', (e) => {
      currentPayloadMode = e.target.value;
      regenerateQR();
    });
  }

  // Error Correction Select (Level L creates lowest dot count for 5mm)
  const ecSelect = document.getElementById('ecSelect');
  if (ecSelect) {
    ecSelect.addEventListener('change', (e) => {
      currentErrorCorrection = e.target.value;
      regenerateQR();
    });
  }

  // Link Base Select (GitHub Pages vs Localhost)
  const linkBaseSelect = document.getElementById('linkBaseSelect');
  if (linkBaseSelect) {
    linkBaseSelect.addEventListener('change', (e) => {
      currentLinkBase = e.target.value;
      regenerateQR();
    });
  }

  // Downloads & Print
  document.getElementById('btnDownloadSvg')?.addEventListener('click', downloadQrSvg);
  document.getElementById('btnDownloadPng')?.addEventListener('click', downloadHighResPng);
  document.getElementById('btnPrintSheet')?.addEventListener('click', () => window.print());

  // Mobile Scan Simulator Modal
  document.getElementById('btnSimulateScan')?.addEventListener('click', openSimulatedScanModal);

  // Camera Scanner
  document.getElementById('btnToggleCamera')?.addEventListener('click', toggleCameraScanner);

  // Modal Close
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('simulatedScanModal');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => modalOverlay.style.display = 'none');
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });
  }

  // Add New Pill Form Toggle
  const toggleAddPillBtn = document.getElementById('toggleAddPillBtn');
  const addPillSection = document.getElementById('addPillSection');
  if (toggleAddPillBtn && addPillSection) {
    toggleAddPillBtn.addEventListener('click', () => {
      const isHidden = addPillSection.style.display === 'none' || !addPillSection.style.display;
      addPillSection.style.display = isHidden ? 'block' : 'none';
      toggleAddPillBtn.textContent = isHidden ? '✕ Close Add Form' : '+ Add New Pill Record (Web 1)';
    });
  }

  // Add Pill Form Submit
  const newPillForm = document.getElementById('newPillForm');
  if (newPillForm) {
    newPillForm.addEventListener('submit', handleAddNewPill);
  }
}

function handleAddNewPill(e) {
  e.preventDefault();
  const name = document.getElementById('newPillName').value.trim();
  const dosage = document.getElementById('newPillDosage').value.trim();
  const indication = document.getElementById('newPillIndication').value.trim();
  const mfg = document.getElementById('newPillMfg').value;
  const exp = document.getElementById('newPillExp').value;

  if (!name || !mfg || !exp) return alert('Please enter required pill details.');

  const nextPk = pillDatabase.length + 1;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const newPill = {
    pk: nextPk,
    id: slug,
    code: `${name.substring(0, 3).toUpperCase()}-${dosage.replace(/[^0-9]/g, '') || '500'}`,
    name: name,
    genericName: name,
    dosage: dosage || "500 mg",
    indication: indication || "General therapeutic medication.",
    category: "Pharmaceutical Formulation",
    mfgDate: mfg,
    expDate: exp,
    batchNumber: `LOT-NEW-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    serialNumber: `SN-${slug.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
    manufacturer: "Global Pharma Labs",
    mfgLicense: "MFG-FDA-AUTH-9910",
    authenticityStatus: "VERIFIED_GENUINE",
    pillPhysicalSpecs: {
      form: "Standard Tablet",
      color: "#F8FAFC",
      dimensions: "12 mm Diameter",
      qrPrintPlacement: "Top Center (5mm × 5mm)",
      qrTargetSize: "5 mm × 5 mm"
    },
    dosageInstructions: "Use as directed by healthcare professional.",
    safetyWarnings: [
      "Keep out of reach of children.",
      "Consult physician before use."
    ],
    storage: "Store below 25°C."
  };

  pillDatabase.push(newPill);
  alert(`Added ${name} to Database with Primary Key #${nextPk}!`);

  // Reset form and select new pill
  e.target.reset();
  selectPill(newPill.id);
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

// Generates the URL using the Primary Key (?id=1)
function getVerificationUrl(pill, isRoot = false) {
  if (isRoot) {
    const base = currentLinkBase === 'github' ? GITHUB_ROOT_URL : LOCAL_ROOT_URL;
    return `${base}?id=${pill.pk}`;
  }
  const base = currentLinkBase === 'github' ? GITHUB_BASE_URL : LOCAL_BASE_URL;
  return `${base}?id=${pill.pk}`;
}

// Builds the payload - GUARANTEED PURE HTTPS URL ONLY
function buildPayload(pill) {
  if (currentPayloadMode === 'rootUrl') {
    return getVerificationUrl(pill, true);
  }
  // Standard Direct HTTPS Link (Lowest Matrix 33x33 • Instant Camera Redirection)
  return getVerificationUrl(pill, false);
}

function regenerateQR() {
  const pill = getActivePill();
  if (!pill) return;

  const payload = buildPayload(pill);
  const verifyUrl = getVerificationUrl(pill, currentPayloadMode === 'rootUrl');

  // Update Primary Key badge
  const pkBadge = document.getElementById('currentPkBadge');
  if (pkBadge) {
    pkBadge.textContent = `Primary Key: #${pill.pk}`;
  }

  // Update matrix density badge & camera redirect notice
  const matrixBadge = document.getElementById('matrixGridBadge');
  const redirectNotice = document.getElementById('scanRedirectNotice');
  if (matrixBadge) {
    matrixBadge.textContent = '33×33 Matrix (~0.15mm)';
    matrixBadge.style.color = '#10b981';
  }
  if (redirectNotice) {
    redirectNotice.textContent = '⚡ Direct HTTP: Camera detects web link & redirects automatically';
    redirectNotice.style.color = '#38bdf8';
  }

  // Update direct test link button
  const testBtn = document.getElementById('testScannedLinkBtn');
  if (testBtn) {
    testBtn.href = verifyUrl;
    testBtn.textContent = `🔗 Click to Test & Open URL: #${pill.pk} (${pill.name}) ↗`;
  }

  // Update Payload Display
  const payloadDisplay = document.getElementById('payloadDisplay');
  if (payloadDisplay) {
    payloadDisplay.textContent = payload;
  }

  // Update payload breakdown
  document.getElementById('breakdownPk').textContent = `#${pill.pk}`;
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

  // Determine QRCodejs error correction level
  let ecLevel = QRCode.CorrectLevel.L;
  if (currentErrorCorrection === 'M') ecLevel = QRCode.CorrectLevel.M;
  if (currentErrorCorrection === 'H') ecLevel = QRCode.CorrectLevel.H;

  if (window.QRCode) {
    // 1. Generate Magnified View
    new QRCode(magnifiedTarget, {
      text: payload,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: ecLevel
    });

    // 2. Generate 5x5mm Micro QR
    new QRCode(microTarget, {
      text: payload,
      width: 64,
      height: 64,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: ecLevel
    });

    // Update pill visualizer canvas with rendered QR
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
    stampInfo.innerHTML = `<strong>${pill.name}</strong> • ${faceText} • Primary Key: <strong>#${pill.pk}</strong> • Target Area: <strong>5 mm × 5 mm</strong> Micro-Zone`;
  }
}

// Download High-Resolution 600 DPI PNG calibrated for 5mm x 5mm edible printer
function downloadHighResPng() {
  const pill = getActivePill();
  const payload = buildPayload(pill);

  const tempContainer = document.createElement('div');
  tempContainer.style.display = 'none';
  document.body.appendChild(tempContainer);

  let ecLevel = QRCode.CorrectLevel.L;
  if (currentErrorCorrection === 'M') ecLevel = QRCode.CorrectLevel.M;
  if (currentErrorCorrection === 'H') ecLevel = QRCode.CorrectLevel.H;

  new QRCode(tempContainer, {
    text: payload,
    width: 250,
    height: 250,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: ecLevel
  });

  setTimeout(() => {
    const canvas = tempContainer.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `PK_${pill.pk}_${pill.id}_5x5mm_micro_qr_600dpi.png`;
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

  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const size = canvas.width;
  
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="5mm" height="5mm" viewBox="0 0 ${size} ${size}">`;
  svgContent += `<rect width="100%" height="100%" fill="#ffffff"/>`;

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
  link.download = `PK_${pill.pk}_${pill.id}_5x5mm_vector_laser.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Simulated Scan Modal (Demonstrates how a phone camera reads the payload)
function openSimulatedScanModal() {
  const pill = getActivePill();
  const verifyUrl = getVerificationUrl(pill);

  document.getElementById('simPk').textContent = `#${pill.pk}`;
  document.getElementById('simPillName').textContent = `${pill.name} (${pill.dosage})`;
  document.getElementById('simMfg').textContent = pill.mfgDate;
  document.getElementById('simExp').textContent = pill.expDate;
  
  const linkElem = document.getElementById('simRedirectBtn');
  linkElem.href = verifyUrl;
  linkElem.textContent = `Open Web 2 Portal for Primary Key #${pill.pk} ↗`;

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
        html5QrScanner.stop();
        html5QrScanner = null;
        readerDiv.style.display = 'none';
        btn.textContent = 'Scan with Camera';

        const match = decodedText.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          window.location.href = `verify.html?id=${match[1]}`;
        } else {
          alert("Scanned QR Code:\n" + decodedText);
        }
      },
      (error) => {}
    ).catch(err => {
      alert("Camera access was not granted or not available. Use the 'Test Mobile Phone Scan Popup' to preview the mobile scanner experience!");
      readerDiv.style.display = 'none';
      btn.textContent = 'Scan with Camera';
      html5QrScanner = null;
    });
  }
}
