# Anima

Jeu de stratégie en 1 contre 1 sur une île hexagonale : faites évoluer vos espèces, contrôlez les régions, marquez 30 points.

Application Angular 22 + Firebase (Auth anonyme ou e-mail, Firestore), empaquetée pour Android et iOS avec Capacitor 8.

## Organisation

| Dossier | Contenu |
| --- | --- |
| `engine/` | Règles du jeu en TypeScript pur, avec leurs tests (voir [engine/README.md](engine/README.md)). |
| `src/app/core/` | Firebase, connexion, accès aux parties, textes FR/EN. |
| `src/app/game/` | Écran de jeu : plateau, actions, menus, animations de fin d'ère. |
| `src/app/home/`, `welcome/`, `rules/` | Accueil, connexion, règles. |
| `public/assets/` | Icônes et images. |
| `tests/` | Règles Firestore et partie complète entre deux clients, sur les émulateurs. |
| `android/`, `ios/` | Projets natifs Capacitor. |

Une partie est un seul document Firestore `matches/{id}` qui contient tout l'état du jeu. Chaque coup est calculé par le moteur dans une transaction : les deux joueurs ne peuvent pas désynchroniser la partie, et les règles Firestore refusent les coups hors tour. Les parties de l'app 1.x (`games/…`) ne sont pas reprises.

## Développement

Prérequis : Node 22.22+ (ou 24), Java 21 pour les émulateurs Firebase et Android.

```bash
npm install
npm install --prefix engine
```

Dans deux terminaux :

```bash
npm run emulators
```

```bash
npm start
```

`ng serve` pointe vers les émulateurs (projet `demo-anima`), jamais vers la production. Pour jouer seul contre un robot, créez une partie puis lancez `BOT_MATCH=<id de la partie> npm run bot` (l'id est dans l'URL).

## Tests

```bash
npm run test:engine
npm run test:rules
npm run test:e2e
```

`test:rules` et `test:e2e` démarrent eux-mêmes les émulateurs.

## Mise en production

- Web : `npm run build` puis `npx firebase deploy --only hosting`.
- Règles et index Firestore : `npx firebase deploy --only firestore`. Elles restent compatibles avec l'app 1.8 encore installée chez les joueurs.
- Mobile : voir [docs/release.md](docs/release.md).
