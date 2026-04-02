# LPS – Lern- & Prüf-Simulator
Eine browserbasierte Angular-Anwendung zur Vorbereitung auf LPIC-1-Zertifizierungsprüfungen (Linux Professional Institute Certification).

# Beschreibung
Der LPS ermöglicht eine strukturierte Prüfungsvorbereitung durch drei unterschiedliche Modi:

# Lernmodus – Richtige Antworten werden sofort angezeigt, ohne Zeitdruck
Teil-Prüfmodus – Direktes Feedback nach jeder beantworteten Frage
Voll-Prüfmodus – 60 zufällige Fragen, Ergebnis erst am Ende (bestanden bei ≤ 8 Fehlern)

# Die Anwendung enthält zwei Fragenkataloge:
KatalogInhaltFragenLPIC-101Linux Administrator – Teil 1120 FragenLPIC-102Linux Administrator – Teil 2120 Fragen

# Installation & Start
Voraussetzungen: Node.js (LTS) und npm müssen installiert sein.
bash# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm start
Die Anwendung ist anschließend unter http://localhost:4200 erreichbar.
bash# Produktions-Build erstellen
npm run build

# Unit-Tests ausführen
npm test

🗂️ Projektstruktur
src/
├── app/
│   ├── frage-detail/         # Dumb Component – Darstellung einer Frage
│   │   ├── frage-detail.ts
│   │   ├── frage-detail.html
│   │   └── frage-detail.css
│   ├── fragen-liste/         # Smart Component – Steuerung & Logik
│   │   ├── fragen-liste.ts
│   │   ├── fragen-liste.html
│   │   └── fragen-liste.css
│   ├── frage.model.ts        # TypeScript Interfaces & Type Aliases
│   ├── fragen.service.ts     # HTTP-Datenabruf & Datentransformation
│   └── app.ts                # Root-Komponente
public/
├── fragen1.json              # Fragenkatalog LPIC-101 (120 Fragen)
└── fragen2.json              # Fragenkatalog LPIC-102 (120 Fragen)

# Technologien
TechnologieVersionAngular21.0.5TypeScript~5.9.2RxJS~7.8.0Vitest4.0.8Node.js / npmnpm 11.6.2

# Funktionsweise
Die Anwendung folgt einem dreistufigen Ablauf:
Katalog wählen  →  Modus wählen  →  Quiz
(LPIC-101/102)     (Lernen/Teil-/     (Fragen beantworten)
                    Vollprüfung)
Architektur: Smart/Dumb-Component-Pattern

FragenListe – hält den gesamten Anwendungszustand und die Geschäftslogik
FrageDetail – reine Präsentationskomponente (@Input / @Output)
FragenService – lädt die JSON-Kataloge per HTTP und transformiert die Rohdaten

