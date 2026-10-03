# PharmaVerify: On-Dose 5×5mm Pill QR Authentication & Database System

A complete pharmaceutical on-dose authentication system designed for **5 mm × 5 mm** micro-QR codes stamped or laser-etched directly onto medication tablets.

Developed for GitHub user: **[peddireddytarun77-hue](https://github.com/peddireddytarun77-hue)**.

---

## 💊 The 3 Core Medications in Database

| Medication | Form & 5mm Placement | Indication | Mfg Date | Exp Date | Lot / Batch |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Paracetamol (500 mg)** | Oblong Caplet (Top Face) | **Treats fever and mild pain.** | 2026-02-15 | 2028-02-15 | `LOT-PRX-2026-081` |
| **Ibuprofen (400 mg)** | Coated Round Tablet (Convex Dome) | **Reduces pain, swelling, and fever.** | 2026-01-10 | 2028-01-10 | `LOT-IBU-2026-442` |
| **Amoxicillin (500 mg)** | Two-Tone Capsule (Body Band) | **Treats bacterial infections like chest or ear infections.** | 2026-03-01 | 2027-09-01 | `LOT-AMX-2026-919` |

---

## 📲 Scanned QR Code Behavior

When any smartphone camera (iPhone / Android) scans the 5×5 mm pill code, it detects:

```text
PILL: Paracetamol 500 mg
MFG: 2026-02-15
EXP: 2028-02-15
LINK: https://peddireddytarun77-hue.github.io/pill-verify/verify.html?id=paracetamol
```

1. **Immediate Text Display:** The camera UI immediately displays the **Pill Name**, **Manufacture Date**, and **Expiry Date**.
2. **One-Tap Redirection:** The camera detects the `LINK:` and presents a button redirecting the consumer directly to the authenticated verification portal connected to the live database (`verify.html`).

---

## 🔬 5 mm × 5 mm Physical Size & Engineering Constraints

Tablets have very limited surface area (typically 8–17 mm). To make the 5×5 mm code scan reliably:
* **Calibrated Module Density:** The generator uses optimized low-version QR grids (21×21 or 25×25 matrix) so individual black/white ink squares measure **~0.20 mm**, which is reliably readable by standard smartphone cameras.
* **Vector Laser SVG Export:** Infinitely scalable vector paths for industrial UV or CO2 laser marking machines.
* **600 DPI High-Res Export:** Precision bitmap output for drop-on-demand pharmaceutical edible inkjet printers.
* **Realistic 3D/Canvas Visualizer:** Shows the 5mm micro-code accurately stamped onto the top and back faces of Paracetamol caplets, Ibuprofen tablets, and Amoxicillin capsules.

---

## 🚀 Quick Start (Running Locally)

1. Open PowerShell / Terminal in this folder:
   ```bash
   npm start
   ```
2. Open your browser:
   * **Main Lab & Pill Studio:** [http://localhost:3000](http://localhost:3000)
   * **Consumer Verification Portal:** [http://localhost:3000/verify.html?id=paracetamol](http://localhost:3000/verify.html?id=paracetamol)

---

## 🌐 Deploying to GitHub Pages (`peddireddytarun77-hue`)

Because the web application is pure HTML, CSS, and JavaScript with zero build step, it can be hosted on GitHub Pages in seconds:

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: On-Dose 5x5mm Pill QR Authentication System"
   ```
2. Create a GitHub repository named `pill-verify` on your account (`peddireddytarun77-hue`):
   ```bash
   git branch -M main
   git remote add origin https://github.com/peddireddytarun77-hue/pill-verify.git
   git push -u origin main
   ```
3. Enable GitHub Pages:
   * Go to **Repository Settings** > **Pages**.
   * Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your live verification portal is now accessible worldwide at:
   `https://peddireddytarun77-hue.github.io/pill-verify/verify.html?id=paracetamol`
