# Product Requirements Document: Blikveld Online (Mobile-First)

## 1. Projectvisie
Het transformeren van de bewezen effectieve 'Blikveld' gevaarherkenningstraining naar een laagdrempelige, mobile-first webapplicatie. Een interactieve gevaarherkenningstraining voor mobiel gebruik, gebaseerd op de Blikveld-methodiek. De training gebruikt een 'onderbroken video-ervaring' om jongeren actief te laten nadenken over verkeersgevaren en hun eigen handelingsperspectief.

## 2. Doelgroepen & Assets
* **Auto:** Beginnend bestuurders (18-24 jaar).
* **E-bike/Fatbike:** Scholieren (12-18 jaar).
* **Scooter:** Onervaren bestuurders (16+ jaar).
* **Asset Structuur:** Elke situatie bestaat uit twee videobestanden:
    * **Video A (De Situatie):** Eindigt met een 'freeze' op zwart en een instructie van de presentator.
    * **Video B (De Ontknoping):** Toont de afloop en de uitleg van een ervaren bestuurder.

## 3. Functionele Requirements: De 'Blikveld' Flow
Per training worden 4 situaties doorlopen met de volgende stappen:
1.  **Onboarding:** Korte uitleg over het mechanisme en het belang van gevaarherkenning.
2.  **Basisgegevens:** Invoer van naam, leeftijd en woonplaats.
3.  **Vervoerskeuze:** Selectie tussen Auto, E-bike/Fatbike of Scooter.

Per situatie doorloopt de gebruiker deze cyclus:

1.  **Fase 1: Observatie (Landscape)**
    * Gebruiker draait telefoon horizontaal.
    * **Video A** speelt af. De situatie wordt opgebouwd en stopt op het kritieke moment.
    * De presentator in de video vraagt: "Schrijf nu op wat je denkt dat er gebeurt."

2.  **Fase 2: Reflectie & Invoer (Portrait)**
    * Gebruiker draait telefoon verticaal (automatische detectie).
    * **Vraag 1:** "Wat denk jij dat er gebeurt?" (Vrije tekstinvoer).
    * **Vraag 2:** "Wat kun je doen om dit te vermijden?" (Focus op gedrag: remmen, uitwijken, vaart minderen).
    * Knop "Bekijk de afloop" verschijnt na invullen.

3.  **Fase 3: De Les (Landscape)**
    * Gebruiker draait telefoon weer horizontaal.
    * **Video B** speelt af: De situatie loopt door (de ontknoping) gevolgd door de expert debrief (visuele cues en tips).

## 4. Technische Specificaties
* **Frontend:** Web App (PWA). Inclusief detectie van schermoriëntatie.
* **Video-display:** Geforceerde of geadviseerde Landscape-modus tijdens video-playback om het volledige 16:9 blikveld te behouden.
* **Backend:** Opslag van antwoorden en gebruikersdata voor rapportage.
* **State Management:** De app moet onthouden bij welke stap van welke situatie de gebruiker is.
* **Orientation API:** Soepele overgangen tussen landscape (video) en portrait (input).
* **Dataopslag:** Antwoorden op Vraag 1 en Vraag 2 worden gekoppeld aan de specifieke situatie-ID opgeslagen in de database.
* **Asset Optimalisatie:** Prefetching van video's in de achtergrond om wachttijden te minimaliseren.
* **Data:** Exportmogelijkheid voor beheerders (voltooiingspercentage, demografische gegevens, kwalitatieve antwoorden).

## 5. UI/UX Richtlijnen
* Minimalistisch design passend bij de doelgroep 12-24 jaar.
* De app moet een toegankeijke interface hebben, maar mag qua uitstraling wel aansprekend zijn voor jongeren.
* Focus op de video; interface-elementen mogen de actie niet overlappen.
* Toetsenbord-vriendelijke invoervelden op mobiel (tekstveld boven het keyboard).
* Heldere visuele instructie voor het kantelen van de telefoon.
* Minimalistische interface in portrait-modus zodat de focus op de tekstinvoer ligt.
* Gebruik als inspiratie voor de vormgeving de voorbeelden vanuit de map 'inspiration'.
* Verwerk het logo van 'blikveld' op een subtiele wijze in het design, bijvoorbeeld in de header of footer.
