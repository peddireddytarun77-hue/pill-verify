/**
 * verify.js - Web 2: Consumer Pill Verification Portal
 * Queries the database using Primary Key (pk: 1, 2, 3) or slug ID,
 * and renders authenticated dosage, indication, and safety data.
 */

// Embedded database fallback to ensure instantaneous rendering offline/online
const PILL_RECORDS = [
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
      color: "White with Center Break Line",
      dimensions: "16.5 mm × 7.2 mm",
      qrPrintPlacement: "Top Face Center (5mm × 5mm)"
    },
    dosageInstructions: "1 tablet every 4 to 6 hours as needed. Do not exceed 4,000 mg (8 tablets) within 24 hours.",
    safetyWarnings: [
      "Do not consume with other acetaminophen-containing medications.",
      "Avoid alcoholic beverages during treatment.",
      "Overdose can cause serious liver damage. Seek immediate medical attention if excessive dose taken."
    ],
    storage: "Store below 25°C (77°F) in a dry place protected from moisture."
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
      color: "Terracotta Orange-Red Sugar Coat",
      dimensions: "10.0 mm Diameter",
      qrPrintPlacement: "Convex Center Face (5mm × 5mm)"
    },
    dosageInstructions: "1 tablet every 6 to 8 hours with food or milk. Maximum 1,200 mg daily without physician consultation.",
    safetyWarnings: [
      "Take with food or a glass of milk to prevent gastrointestinal upset.",
      "Contraindicated in active stomach ulcers or severe kidney impairment.",
      "Do not use during the third trimester of pregnancy."
    ],
    storage: "Store between 20°C and 25°C (68°F to 77°F)."
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
      color: "Maroon Cap / Gold Body",
      dimensions: "19.4 mm × 6.8 mm",
      qrPrintPlacement: "Body Section Cylindrical Band (5mm × 5mm)"
    },
    dosageInstructions: "1 capsule every 8 hours for full 7 to 10 day course as prescribed.",
    safetyWarnings: [
      "DO NOT TAKE if you have a known allergy to penicillin or cephalosporins.",
      "Complete the ENTIRE prescribed course even if symptoms disappear to prevent bacterial resistance.",
      "Contact your doctor immediately if a skin rash or breathing difficulty occurs."
    ],
    storage: "Store below 25°C (77°F). Keep container tightly closed away from moisture."
  }
];

let activeDatabase = PILL_RECORDS;

document.addEventListener('DOMContentLoaded', async () => {
  await fetchLatestDatabase();
  initVerificationPage();
});

// Try to fetch newest database.json if available
async function fetchLatestDatabase() {
  try {
    const res = await fetch('database.json');
    if (res.ok) {
      const data = await res.json();
      if (data.pills && data.pills.length) {
        activeDatabase = data.pills;
      }
    }
  } catch (e) {
    // using fallback PILL_RECORDS
  }
}

// Find pill by Primary Key (number 1, 2, 3), slug id ('paracetamol'), or code ('PARA-500')
function findPillByQuery(query) {
  if (!query) return activeDatabase[0];
  const qStr = String(query).trim().toLowerCase();

  // Try numerical primary key
  const numPk = parseInt(qStr, 10);
  if (!isNaN(numPk)) {
    const match = activeDatabase.find(p => p.pk === numPk);
    if (match) return match;
  }

  // Try slug id or code
  const matchSlug = activeDatabase.find(p => 
    p.id.toLowerCase() === qStr || 
    p.code.toLowerCase() === qStr ||
    p.name.toLowerCase() === qStr
  );
  if (matchSlug) return matchSlug;

  return activeDatabase[0];
}

function initVerificationPage() {
  const s = window.location.search;
  const h = window.location.hash;
  const params = new URLSearchParams(s);
  // Supports ?id=1, ?pk=1, ?p=1, ?id=paracetamol, or raw ?1, #1
  let query = params.get('id') || params.get('pk') || params.get('p');
  if (!query) {
    const rawSearch = s.replace(/^\?/, '').trim();
    const rawHash = h.replace(/^#/, '').trim();
    if (/^\d+$/.test(rawSearch)) {
      query = rawSearch;
    } else if (/^\d+$/.test(rawHash)) {
      query = rawHash;
    } else if (rawSearch) {
      query = rawSearch;
    } else {
      query = '1';
    }
  }

  const pill = findPillByQuery(query);
  renderPillVerification(pill);
}

function renderPillVerification(pill) {
  if (!pill) return;

  // Primary Key Display
  const pkBadge = document.getElementById('primaryKeyBadge');
  if (pkBadge) {
    pkBadge.textContent = `Primary Key: #${pill.pk}`;
  }

  // Header and core info
  document.getElementById('pillName').textContent = pill.name;
  document.getElementById('pillDosage').textContent = pill.dosage;
  document.getElementById('pillGeneric').textContent = pill.genericName;
  document.getElementById('pillCategory').textContent = pill.category;
  document.getElementById('pillIndication').textContent = pill.indication;

  // Manufacturing & Batch info
  document.getElementById('mfgDate').textContent = pill.mfgDate;
  document.getElementById('expDate').textContent = pill.expDate;
  document.getElementById('batchNumber').textContent = pill.batchNumber;
  document.getElementById('serialNumber').textContent = pill.serialNumber;
  document.getElementById('manufacturer').textContent = pill.manufacturer;
  document.getElementById('mfgLicense').textContent = pill.mfgLicense;

  // Physical specifications
  if (pill.pillPhysicalSpecs) {
    document.getElementById('pillForm').textContent = pill.pillPhysicalSpecs.form;
    document.getElementById('pillDimensions').textContent = pill.pillPhysicalSpecs.dimensions;
    document.getElementById('qrPlacement').textContent = pill.pillPhysicalSpecs.qrPrintPlacement;
  }

  // Medical instructions & warnings
  document.getElementById('dosageInstructions').textContent = pill.dosageInstructions;
  document.getElementById('storageInstructions').textContent = pill.storage;

  const warningsList = document.getElementById('warningsList');
  if (warningsList) {
    warningsList.innerHTML = '';
    pill.safetyWarnings.forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      warningsList.appendChild(li);
    });
  }

  // Calculate Expiry Status
  const expDateObj = new Date(pill.expDate);
  const today = new Date();
  const diffTime = expDateObj - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const statusBadge = document.getElementById('expiryStatusBadge');
  if (statusBadge) {
    if (diffDays > 90) {
      statusBadge.innerHTML = `<span class="pulse-dot"></span> Valid & Active Dose (Verified Database Entry #${pill.pk})`;
      statusBadge.style.color = '#10b981';
    } else if (diffDays > 0) {
      statusBadge.innerHTML = `⚠️ Expiring Soon (${diffDays} days remaining)`;
      statusBadge.style.color = '#f59e0b';
    } else {
      statusBadge.innerHTML = `❌ EXPIRED - DO NOT CONSUME`;
      statusBadge.style.color = '#ef4444';
    }
  }

  // Draw pill icon avatar
  drawMiniPillAvatar(pill);
}

function drawMiniPillAvatar(pill) {
  const canvas = document.getElementById('miniPillCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (pill.id === 'paracetamol') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - 30, cy - 14, 60, 28, 14);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // score line
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx, cy + 12);
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();
  } else if (pill.id === 'ibuprofen') {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (pill.id === 'amoxicillin') {
    // Capsule
    ctx.fillStyle = '#9f1239';
    ctx.beginPath();
    ctx.arc(cx - 12, cy, 14, Math.PI / 2, -Math.PI / 2);
    ctx.lineTo(cx, cy - 14);
    ctx.lineTo(cx, cy + 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(cx + 12, cy, 14, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(cx, cy + 14);
    ctx.lineTo(cx, cy - 14);
    ctx.closePath();
    ctx.fill();
  }
}
