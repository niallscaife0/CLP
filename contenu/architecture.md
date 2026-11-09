# Architecture

Deux représentations décrivent la structure du circuit : qui fait avancer qui, et ce que chaque sortie lit.

## Schéma-bloc en cascade

**Question :** qui fait avancer qui ? Chaque étage avance quand celui du dessous fait un tour complet, comme les secondes, les minutes et les heures d’une horloge murale.

**Quand l’utiliser :** dès qu’un compteur en commande un autre, ou qu’un événement doit se produire « une fois par ligne » ou « une fois par image » (par exemple la mise à jour de `x_pos`).

![Schéma-bloc : horloge, pixel, compteur horizontal, compteur vertical, sorties](schemas/cascade.svg)

**Comment le lire :** de haut en bas, chaque flèche porte la condition qui fait avancer l’étage suivant. L’influence va dans un seul sens : le vertical ne fait jamais revenir l’horizontal à 0. Les sorties ne sont pas des étages : elles lisent les compteurs.

**Le piège :** croire qu’il faut plusieurs horloges à synchroniser. Tout bat sur le même front de CLOCK_50 ; `pixel` n’est pas une horloge, c’est une autorisation.

## Carte d’une ligne et d’une image

**Question :** pour chaque position des compteurs, que doit valoir chaque sortie ?

**Quand l’utiliser :** avant d’écrire HSYNC, VSYNC ou GREEN. Les nombres ne se calculent pas : ils viennent de la norme VGA 640 × 480 à 60 Hz.

![Carte VGA : zones visibles, marges et impulsions, et les sorties qui les lisent](schemas/carte-vga.svg)

**Comment la lire :** chaque bande est un tour de compteur, découpé en quatre zones. HSYNC et VSYNC descendent à 0 uniquement dans la zone « Impulsion » ; GREEN vaut 1 uniquement dans la zone « Visible », horizontale **et** verticale.

```vhdl
HSYNC <= '0' when (h_cpt >= 656 and h_cpt <= 751) else '1';
VSYNC <= '0' when (v_cpt >= 490 and v_cpt <= 491) else '1';
GREEN <= '1' when (h_cpt < 640 and v_cpt < 480) else '0';
```

**Le piège :** reprendre la plage d’une sortie pour une autre. Chaque sortie a sa zone. La couleur doit être à 0 dans les marges : le projecteur s’en sert comme référence du noir.
