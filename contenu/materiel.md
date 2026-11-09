# Matériel

## Tableau des broches à trois niveaux

**Question :** par où passe physiquement chaque signal, du nom dans le code jusqu’au fil branché ?

**Quand l’utiliser :** avant le Pin Planner et avant de câbler. À vérifier après chaque compilation (colonne *Fitter Location*).

| Port VHDL | Broche FPGA | Broche JP1 | Par | Borne VGA | Tension |
| --- | --- | --- | --- | --- | --- |
| CLOCK_50 | PIN_R8 | sur la carte | — | — | 3.3-V LVTTL |
| KEY0 | PIN_J15 | sur la carte | — | — | 3.3-V LVTTL |
| KEY1 | PIN_E1 | sur la carte | — | — | 3.3-V LVTTL |
| HSYNC | PIN_D3 (GPIO_00) | 2 | fil direct | 13 | 3.3-V LVTTL |
| VSYNC | PIN_C3 (GPIO_01) | 4 | fil direct | 14 | 3.3-V LVTTL |
| GREEN | PIN_A2 (GPIO_02) | 5 | résistance 330 Ω | 2 | 3.3-V LVTTL |
| GND | — | 12 | rail GND | 5, 6, 7, 8, 10, GND, 1, 3 | — |

**Ne rien brancher sur :** JP1 broches 11 (5 V) et 29 (3,3 V) ; bornes VGA 4, 9, 11, 12, 15 ; GPIO_0_IN0 et GPIO_0_IN1 (broches 1 et 3, entrée seule).

**Le piège :** une broche fausse ne donne aucune erreur, juste un circuit qui ne fait rien. Une broche non pilotée se reconnaît : environ 3,1 V à vide, quelques mV en charge, 50 Hz en mode fréquence. Chaque nouveau projet Quartus repart sans assignations.

## Pont diviseur vers l’entrée VGA

**Question :** quelle tension arrive réellement au projecteur, et quelle résistance choisir ?

**Quand l’utiliser :** pour tout signal analogique (une couleur) envoyé par une sortie logique. Pas pour HSYNC et VSYNC : ce sont des entrées logiques, 3,3 V leur convient. Jamais de résistance sur la masse.

![Schéma électrique : sortie GREEN, résistance de 330 Ω, entrée 75 Ω du projecteur](schemas/pont-diviseur.svg)

**Comment le lire :** le projecteur contient déjà une résistance de 75 Ω vers la masse. Avec R en série, la tension se partage dans le rapport des résistances :

V vert = V sortie × 75 / (R + 75), d’où R = 75 × (3,3 − 0,7) / 0,7 ≈ 279 Ω pour obtenir 0,7 V.

**Le piège :** supposer une sortie parfaite. Sous 7 mA, la sortie du FPGA tombe d’environ 3,24 V à 2,9 V : le vert reçoit un peu moins que prévu. Viser sous 0,7 V est le bon côté pour se tromper.
