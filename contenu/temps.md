# Temps

## Chronogramme de fin de ligne

**Question :** que se passe-t-il exactement à chaque front d’horloge, et dans quel ordre ?

**Quand l’utiliser :** avant d’écrire des compteurs imbriqués, et chaque fois qu’on hésite sur « ça change avant ou après ? ». On zoome sur le moment délicat (ici, la fin de ligne), jamais sur toute une ligne.

![Chronogramme : CLOCK_50, pixel, h_cpt et v_cpt autour de la fin de ligne](schemas/chronogramme.svg)

**Comment le lire :** les fils à un bit (horloge, pixel) sont des créneaux. Les compteurs sont des **bus** : une bande avec la valeur écrite dedans, et un croisement à chaque changement. Chaque changement se fait juste après un front montant. Une valeur de h_cpt dure deux fronts, soit 40 ns : c’est un pixel.

Pourquoi h_cpt et v_cpt changent au même front : dans le code, les deux changements sont dans la même branche du même `if`. Au front montant, le circuit lit les valeurs d’avant (h_cpt = 799, pixel = 1), décide, et toutes les bascules se mettent à jour en même temps.

**Le piège :** mélanger deux échelles sur la même feuille (20 ns et 32 µs). Une feuille, une échelle : le zoom ici, la vue d’ensemble (dents de scie de h_cpt, escalier de v_cpt) sur une autre.

## Les durées du système

| Grandeur | Calcul | Valeur |
| --- | --- | --- |
| Période d’horloge | 1 / 50 MHz | 20 ns |
| Durée d’un pixel | 1 / 25 MHz | 40 ns |
| Durée d’une ligne | 800 × 40 ns | 32 µs, soit 31,25 kHz |
| Durée d’une image | 525 × 32 µs | 16,8 ms, soit 59,52 Hz |
| Impulsion HSYNC | 96 × 40 ns | 3,84 µs |
| Impulsion VSYNC | 2 × 32 µs | 64 µs |
