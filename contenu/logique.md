# Logique

Deux représentations servent à écrire la logique : le tableau de cas pour chaque mémoire, et le plan de l’écran pour placer une forme.

## Tableau de cas

**Question :** pour une mémoire donnée, quelle valeur prendra-t-elle au prochain front d’horloge, et dans quels cas ?

**Quand l’utiliser :** avant d’écrire tout `if` dans un process synchrone, et avant toute ligne `when … else`. Un tableau par mémoire.

**La méthode en 4 gestes :**

1. Nommer la mémoire (par exemple `h_cpt`).
2. Écrire sa règle normale, puis ses exceptions, en français.
3. Remplir le tableau, sans oublier la ligne « garde sa valeur ».
4. Factoriser : les conditions communes deviennent les `if` extérieurs.

**Compteur horizontal `h_cpt` :**

| Cas | Valeur au prochain front |
| --- | --- |
| pixel = 0 | garde sa valeur |
| pixel = 1 et h_cpt = 799 | 0 |
| pixel = 1 et h_cpt ≠ 799 | h_cpt + 1 |

**Position du carré `x_pos` (en fin d’image) :**

| Cas | Valeur au prochain front |
| --- | --- |
| KEY0 appuyé (= '0') et x_pos ≥ 4 | x_pos − 4 |
| KEY1 appuyé (= '0') et x_pos ≤ 596 | x_pos + 4 |
| tous les autres cas | garde sa valeur |

**Comment le lire :** chaque ligne devient une branche du `if`. La ligne « garde sa valeur » ne s’écrit pas : dans un process synchrone, un signal non affecté garde sa valeur (c’est la bascule).

**Le piège :** l’ordre des lignes ne dit rien de l’ordre dans le temps. Tout est décidé au même front. L’ordre ne compte que dans une chaîne `if … elsif`, où la première condition vraie l’emporte.

## Plan de l’écran

**Question :** où est la forme, quelles valeurs de compteurs la dessinent, et jusqu’où peut-elle aller ?

**Quand l’utiliser :** pour toute forme à dessiner ou à déplacer. Les coordonnées de l’écran sont les valeurs des compteurs : x = h_cpt, y = v_cpt.

![Plan de l’écran 640 × 480 avec le carré et sa course](schemas/plan-ecran.svg)

**Comment le lire :** l’origine (0, 0) est en haut à gauche, et **y augmente vers le bas**. Le carré occupe les colonnes X à X + S − 1 et les lignes Y à Y + S − 1. Pour le centrer : X = (640 − S) / 2 = 300, Y = (480 − S) / 2 = 220.

```vhdl
GREEN <= '1' when (h_cpt >= x_pos and h_cpt < x_pos + S and
                   v_cpt >= Y     and v_cpt < Y + S) else '0';
```

**Le piège :** X et Y désignent le **coin**, pas le centre. Agrandir S sans changer X déplace le centre. Et un `unsigned` qui descend sous 0 repart à 1023 : les bornes se vérifient avant de bouger.
