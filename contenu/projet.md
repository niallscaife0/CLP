# Un carré vert, projeté par un FPGA

Une carte FPGA génère elle-même un signal vidéo VGA et l’envoie à un projecteur. Deux boutons de la carte déplacent un carré vert sur le mur. Aucun ordinateur n’est branché au projecteur.

Projet réalisé dans le cadre du cours de circuits logiques programmables (CLP), ISIB, Master 1, 2026.

## État

| Version | Ce qu’elle apporte | Statut |
| --- | --- | --- |
| V1 | Une image verte stable, générée par la carte | Validée le 29/10/2026 |
| V2 | Un carré dessiné par coordonnées | Validée |
| V2b | Le carré piloté par les boutons KEY0 et KEY1 | À confirmer |

## Le système en une phrase

Une horloge de 50 MHz fait avancer deux compteurs qui parcourent l’écran ligne par ligne ; trois sorties (HSYNC, VSYNC, GREEN) sont de simples comparaisons sur ces compteurs, et une résistance de 330 Ω adapte la tension du vert à l’entrée du projecteur.

## La trajectoire

Chaque étape n’ajoutait qu’une seule inconnue, et chacune a été validée par une mesure ou une observation avant de passer à la suivante.

| Étape | Inconnue isolée | Preuve |
| --- | --- | --- |
| Chaîne d’outils | Le PC programme la carte | KEY0 allume une LED |
| Base de temps | Horloge et compteur | LED à 1 Hz, 10 clignotements en 10 s |
| Synchronisation | Compteurs horizontal et vertical | 31,24 kHz et 59,51 Hz mesurés (31,25 kHz et 59,52 Hz prédits) |
| Interface électrique | Tension adaptée au projecteur | 0,39 V moyen sur charge de 75 Ω |
| Image | Le projecteur affiche | Surface verte stable |
| Dessin | Une forme par coordonnées | Carré fixe au centre |
| Mouvement | Une position qui change | Carré piloté par les boutons |

## Comment lire cette page

- **Cahier des charges** : ce que le système doit faire, ses contraintes, ses interfaces.
- **Simulation** : le résultat à essayer, le balayage au ralenti, les signaux.
- **Architecture, Temps, Logique, Matériel** : les représentations qui ont servi à concevoir le circuit.

<!-- Photos : dépose tes images dans le dossier images/ puis ajoute par exemple :
![Le carré projeté sur le mur](images/projection.jpg)
-->
