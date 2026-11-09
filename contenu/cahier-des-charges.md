# Cahier des charges — Carré mobile VGA sur FPGA

Version 0.2 · périmètre : boutons uniquement, sans accéléromètre · 2026-11-09

> Document évolutif. Une exigence n'est jamais effacée : on change son statut (validée, modifiée, abandonnée) et on note pourquoi.

---

## 1. Intention

Construire un système autonome où deux boutons de la carte FPGA déplacent un carré projeté sur un mur. Aucun ordinateur n'est branché au projecteur : le FPGA génère lui-même le signal vidéo.

## 2. Utilisateur et usage

| | |
|---|---|
| Qui | Une personne face au mur projeté, la carte devant elle |
| Geste | Appuyer sur KEY0 (gauche) ou KEY1 (droite) |
| Ce qu'elle voit | Un carré vert qui glisse sur fond noir et s'arrête aux bords |

## 3. Périmètre

| Dans le projet | Hors du projet |
|---|---|
| Génération VGA 640 × 480 par le FPGA | Résolutions supérieures |
| Une couleur (vert) | Rouge et bleu, dégradés |
| Une forme simple (carré) | Images, texte, sprites |
| Entrées : les deux boutons de la carte | Accéléromètre, capteurs externes, réseau |
| Alimentation par USB | Boîtier autonome sur batterie |

## 4. Exigences fonctionnelles

| ID | Exigence | Critère de validation | Version | Statut |
|---|---|---|---|---|
| EF-01 | Le projecteur affiche une image générée par le FPGA | Surface verte stable, sans ordinateur | V1 | Validée |
| EF-02 | Un carré est dessiné à une position donnée | Carré de 40 px au centre, fond noir | V2 | Validée |
| EF-03 | Le carré se déplace avec les boutons | KEY0 : vers la gauche, KEY1 : vers la droite | V2b | À confirmer |
| EF-04 | Le carré reste dans l'écran | Il s'arrête aux bords, sans disparaître ni réapparaître | V2b | À confirmer |
| EF-05 | Le mouvement est fluide | Pas de déchirure, traversée de l'écran en environ 2,5 s | V2b | À confirmer |

## 5. Contraintes

| Type | Contrainte | Source |
|---|---|---|
| Matériel | Carte Terasic DE0-Nano (Cyclone IV E, EP4CE22F17C6) | Disponible |
| Matériel | Projecteur Epson EB-S11, entrée VGA | Disponible |
| Norme | VGA 640 × 480 à 60 Hz, synchros actives à l'état bas | Norme VGA |
| Électrique | Couleur 0 à 0,7 V sur 75 Ω ; sorties FPGA en 3,3 V | Norme VGA, manuel DE0-Nano |
| Horloge | 50 MHz sur la carte, pixel à 25 MHz (÷ 2) | Manuel DE0-Nano |
| Entrées | Boutons KEY0 et KEY1, actifs à l'état bas | Manuel DE0-Nano |
| Outils | Quartus II 14.1 (compilation), Quartus Prime Programmer 24.1 (programmation) | Poste de travail |
| Poste | Un seul PC, Windows 11 | — |
| Mesure | Multimètre (V, Hz) ; oscilloscope DSO138 hors service | Atelier |

## 6. Interfaces

| Signal | Sens | Nature | Broche FPGA | Vers |
|---|---|---|---|---|
| CLOCK_50 | Entrée | Horloge 50 MHz | PIN_R8 | Oscillateur de la carte |
| KEY0 | Entrée | Logique, active à l'état bas | PIN_J15 | Bouton de la carte |
| KEY1 | Entrée | Logique, active à l'état bas | PIN_E1 | Bouton de la carte |
| HSYNC | Sortie | Logique 3,3 V | PIN_D3 | Borne 13 du VGA |
| VSYNC | Sortie | Logique 3,3 V | PIN_C3 | Borne 14 du VGA |
| GREEN | Sortie | Analogique via 330 Ω | PIN_A2 | Borne 2 du VGA |

Détail du câblage : fiche 6. Détail électrique : fiche 7.

## 7. Versions et jalons

| Version | Inconnue isolée | Livrable | Statut |
|---|---|---|---|
| V1 | Génération VGA + interface électrique | Image verte stable | Validée (29/10/2026) |
| V2 | Dessin par coordonnées | Carré fixe au centre | Validée |
| V2b | Mouvement | Carré piloté par les boutons | À confirmer |

## 8. Choix de conception

| Paramètre | Valeur | Justification |
|---|---|---|
| Côté du carré S | 40 pixels | Visible sans encombrer l'écran |
| Position de départ | (300, 220) | Centre : (640 − S) / 2 et (480 − S) / 2 |
| Course horizontale | 0 à 600 | 640 − S, le carré reste entier |
| Vitesse | 4 pixels par image | Traversée en environ 2,5 s |
| Moment de mise à jour | Fin d'image | Éviter la déchirure |
| Priorité si deux boutons | KEY0 l'emporte | Ordre du `if … elsif` |

## 9. Questions ouvertes

- Faut-il un déplacement vertical ? Il n'y a que deux boutons sur la carte : il faudrait utiliser les interrupteurs ou un bouton externe.

## 10. Évolutions possibles (hors projet actuel)

- Pilotage par l'accéléromètre de la carte (ADXL345, liaison SPI).
- Règle de jeu : cible, score.
- Entrée par capteur gestuel ou par web app (bureau d'études).

## 11. Liens

- Onglets Architecture, Temps, Logique et Matériel de cette page
- Manuel Terasic DE0-Nano
