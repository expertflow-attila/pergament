# Pergamenre hányt szavak — Editio Premium

Venczel-Tóth Evelin könyves blogja / booktube oldala.
Élő oldal: <https://pergamen-site-premium.vercel.app>

## 👀 Előnézet — a legfrissebb állapot (valódi betűkkel renderelve)

### Asztali — a kezdőlap teteje
![Asztali — hero](preview/desktop-hero.png)

### Logó (toll) változatok
![Toll-logó változatok](preview/logo.png)

### Teljes kezdőlap — asztali
![Teljes asztali oldal](preview/desktop-full.png)

### Teljes kezdőlap — mobil
![Mobil nézet](preview/mobile-full.png)

> A fotók helye üres (azokat nem tudtam áthozni); minden más a végleges állapot.

---

## ⚠️ Fontos — mit tartalmaz ez a branch

Ezt a változatot a **futó Vercel deploymentből rekonstruáltam**, mert a kanonikus
forrásrepó (`expertflow-attila/pergamen-site-premium`) ebből a munkamenetből nem volt
elérhető. A rekonstrukció a **kezdőlapra (`index.html`) és a megosztott asset-ekre**
terjed ki.

### Benne van
- `index.html` — a teljes kezdőlap
- `assets/styles.css`, `assets/home.css`, `assets/shelf.css`, `assets/print.css`
- `assets/main.js`, `assets/shelf.js`, `assets/motion.js`
- `manifest.webmanifest`

### Logó / ikonok (ebben a repóban újragenerálva)
- `favicon.svg` + `favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png` — új logó
  a mostani palettában (marigold korong, tinta „§" szerkesztői jel, levendula tintacsepp).
  A fejlécbe is bekerült (a „Pergamen" felirat mellé), minden oldalon (megosztott `main.js`).

### Még hiányzik (a kanonikus repóból kell áthozni)
- **Fotók (bináris):** `assets/img/hero-portrait.jpg`, `cozy-nook.jpg`, `about-portrait.jpg`,
  `assets/books/book-1.jpg … book-15.jpg`, `og-image.jpg` — ezeket szövegként nem lehetett letölteni.
- **Aloldalak:** `/kritikak`, `/esszek`, `/videok`, `/esemenyek`, `/rolam`, `/kiadoknak`,
  `/kapcsolat` (külön HTML-ek) + `assets/pages.css`.

Emiatt ez a branch önmagában **nem teljes, deploy-kész oldal** — a megosztott
asset-javítások (lásd lent) viszont az összes aloldalra is érvényesek.

---

## ✅ Ebben a branchben elvégzett javítások

| # | Hol | Mit |
|---|-----|-----|
| 1 | `styles.css` + `main.js` | **Mobil menü** (≤900px): eddig nem volt — csak a „Kapcsolat" gomb látszott. Mostantól hamburger-gomb nyit egy menüt az összes navigációs linkkel. A megosztott fájlokban van, így **minden aloldalon** működik. |
| 2 | `index.html` | **Ellentmondó hírlevél-gyakoriság** javítva: a lede „Havonta egyszer", de a felsorolás „Kéthetente levél" volt → egységesítve **„Havonta egy levél"-re**. |
| 3 | `index.html` | **E-mail mező akadálymentesítése**: `aria-label`, `name`, `autocomplete` hozzáadva (eddig csak placeholder volt). |
| 4 | `index.html` | A `.play-btn` megkapta a `type="button"` attribútumot. |
| 5 | `index.html` + `manifest.webmanifest` | **theme-color egységesítés** (`#f7f4f1` / `#FBF7EE` → `#ffffff`, ami a tényleges háttér). |

## 🔎 Még megoldásra váró (tartalmi/döntési) pontok
- **Üres `href="#"` linkek:** 5 közösségi link (YouTube, Facebook, Instagram, Moly, Spotify),
  a 3 esemény „Jegy →" linkje és a „Teljes archívum" — valódi URL-ek kellenek.
- **Kiemelt videó:** a `data-youtube` a YouTube főoldalára mutat, nem konkrét videóra.
- `print.css` olyan betűkre hivatkozik (`Lora`, `Cormorant Garamond`, `Pinyon Script`),
  amelyeket az oldal már nem tölt be (`Instrument Serif` + `DM Sans`) — egy korábbi dizájn maradványa.

## Helyi futtatás
```bash
python3 -m http.server 8099
# majd: http://localhost:8099/
```
