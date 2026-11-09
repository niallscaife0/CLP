# Carré mobile VGA sur FPGA

Site du projet : une carte DE0-Nano génère un signal VGA et déplace un carré projeté avec deux boutons.
Une seule page, sept onglets : Projet, Cahier des charges, Simulation, Architecture, Temps, Logique, Matériel.

## Ce que contient le dépôt

| Élément | Rôle | Se modifie avec |
| --- | --- | --- |
| `index.html` | La page : en-tête, onglets, simulation | Éditeur de code |
| `style.css` | L'apparence. Les **tokens de design** (couleurs, police) sont en tête de fichier | Éditeur de code |
| `app.js` | Navigation entre onglets, chargement des textes | Rarement |
| `simulation.js` | Les trois simulations (résultat, mécanisme, signaux) | Pour faire évoluer la simulation |
| `contenu/*.md` | Le texte de chaque onglet, en Markdown | **Obsidian** ou tout éditeur de texte |
| `schemas/*.svg` | Les schémas des onglets | Illustrator, Inkscape, ou éditeur de code |
| `images/` | Photos du projet (à ajouter) | — |
| `lib/marked.min.js` | Bibliothèque qui convertit le Markdown en page (marked 12.0.2, licence MIT) | Ne pas toucher |
| `.nojekyll` | Indique à GitHub Pages de publier les fichiers tels quels | Ne pas toucher |

## Mettre à jour un texte

1. Modifier le fichier `.md` correspondant dans `contenu/` (depuis Obsidian, par exemple).
2. Envoyer le fichier sur GitHub (commit + push, ou glisser-déposer dans l'interface web).
3. La page en ligne se met à jour en une à deux minutes.

| Onglet | Fichier |
| --- | --- |
| Projet | `contenu/projet.md` |
| Cahier des charges | `contenu/cahier-des-charges.md` |
| Architecture | `contenu/architecture.md` |
| Temps | `contenu/temps.md` |
| Logique | `contenu/logique.md` |
| Matériel | `contenu/materiel.md` |

Pour ajouter une photo : la déposer dans `images/`, puis écrire dans le `.md` : `![Description de la photo](images/nom-du-fichier.jpg)`.

## Publier sur GitHub Pages

1. Déposer tout le contenu de ce dossier à la racine du dépôt (y compris le fichier caché `.nojekyll`).
2. Sur GitHub : **Settings → Pages → Build and deployment**, source **Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. L'adresse du site s'affiche en haut de cette page de réglages.

## Voir le site sur son ordinateur avant de publier

Ouvrir `index.html` par un double-clic affiche la simulation, mais **pas les textes** : par sécurité, le navigateur refuse de lire les fichiers `.md` d'un dossier local. Il faut un petit serveur local :

1. Ouvrir un terminal dans le dossier du site.
2. Lancer `python -m http.server 8000`.
3. Ouvrir `http://localhost:8000` dans le navigateur.
4. Arrêter avec `Ctrl + C`.

## Liens entre onglets

Chaque onglet a sa propre adresse : `…/#simulation`, `…/#cahier`, etc. On peut envoyer directement le lien d'un onglet.
