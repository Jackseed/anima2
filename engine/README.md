# Moteur de jeu Anima

Règles du jeu en TypeScript pur, sans Angular ni Firebase. L'app (et plus tard une Cloud Function) appelle :

- `createGame(joueur, rng)` puis `joinGame(state, joueur, rng)` ;
- `applyCommand(state, playerId, commande, rng)`, qui renvoie `{ ok: true, state }` ou `{ ok: false, error }` sans jamais modifier l'état reçu ;
- les requêtes de `queries.ts` (`migrationTargets`, `assimilationTargets`, `actionBlocker`…) pour savoir ce que l'interface peut proposer, et `legalCommands` pour lister tous les coups possibles.

L'état (`GameState`) est un objet JSON unique, stocké tel quel dans Firestore. La position des espèces n'existe qu'à un endroit : `species.positions` (quantité par case).

```bash
npm install
npm test
npm run typecheck
```

Node 22 ou plus.

## Règles

- Plateau hexagonal de 39 cases en 6 régions, avec un pont entre les montagnes et les îles.
- 3 espèces neutres avec une capacité chacune, 4 à 6 individus regroupés.
- Chaque joueur choisit une capacité parmi 2, puis une case de départ (4 individus). Vert joue toujours en premier, avec une seule action à son premier tour.
- Chaque espèce joue 2 actions par tour. Une manche = toutes les espèces de tous les joueurs ; une ère = 3 manches. À la fin de chaque ère, chaque joueur marque les régions dont il occupe toutes les cases.
- Au début de l'ère 2, chaque joueur reçoit une deuxième espèce (même mise en place).
- Fin de partie : 30 points à la fin d'une ère, fin de l'ère 5, ou plus aucune espèce pour un joueur. Égalité : plus de capacités, puis plus d'individus, puis tirage au sort.
- Actions : migration (4 points de déplacement par action, répartissables sur plusieurs mouvements), prolifération, assimilation, adaptation (sacrifie 5 individus, il faut en avoir 7), et les capacités actives intimidation, ralliement, galerie.
- Une espèce qui en élimine une autre récupère ses capacités, dans la limite de 3.

## Différences avec l'app 1.x

Corrections de bugs :

- Le compteur de manches suivait l'ordre d'arrivée dans la partie : un créateur rouge perdait un tour par ère.
- L'adaptation restait proposée quand toutes les capacités étaient prises (trou dans la liste), ce qui ouvrait un menu vide impossible à fermer.
- Instinct de survie et nid ne vérifiaient pas leur condition (virgule à la place d'un test, mauvaise case).
- Une espèce éliminée gardait ses capacités hors du tirage pour toujours ; elles reviennent maintenant dans le tirage si elles ne sont pas récupérées. Une espèce ne peut plus dépasser 3 capacités.
- La deuxième espèce n'arrive qu'au début de l'ère 2 (avant, elle pouvait réapparaître à une ère suivante après la perte d'une espèce).
- Les choix de capacités sont tirés par le moteur et enregistrés, donc un rechargement ne relance pas le tirage.

Choix de règles :

- Pendant la mise en place, chaque joueur avance à son rythme (capacité puis case) ; les espèces sont posées quand les deux joueurs ont choisi leur case.
- Toute action autre qu'une migration est bloquée tant qu'une migration entamée sur la dernière action n'est pas terminée (avant, intimidation et ralliement passaient outre).
- Si le tirage manque de capacités pour une nouvelle espèce, il complète avec des capacités déjà en jeu, pour ne jamais bloquer la partie.
- Les 14 capacités sont actives, y compris galerie, ralliement, nid, hermaphrodite et instinct de survie, qui étaient désactivées.
