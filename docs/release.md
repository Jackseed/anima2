# Publier Anima 2.0

## 1. Firebase (une fois)

Connectez le CLI avec le compte Google qui possède le projet `anima-f51c8` :

```bash
npx firebase login
```

- **Connexion par e-mail** : dans la console Firebase, Authentication > Sign-in method, activez « Adresse e-mail/Mot de passe ». Sans ça, « Sauvegarder mon compte » échoue (la connexion invitée continue de marcher).
- **Règles et index Firestore** : `npx firebase deploy --only firestore`. Les nouvelles règles ferment la base aux visiteurs non connectés et protègent les parties 2.x ; l'app 1.8 encore installée continue de fonctionner. Les index se construisent en quelques minutes : tant qu'ils ne sont pas prêts, les listes « Rejoindre une partie » et « Mes parties » restent vides.
- **Version web** : `npm run build` puis `npx firebase deploy --only hosting`.

## 2. Android (Google Play)

```bash
npm run build
npx cap sync android
npx cap build android --keystorepass <mot de passe> --keystorealiaspass <mot de passe>
```

Le keystore est lu dans `../deploy/keystores/keystore` (alias `key0`). Le bundle signé sort dans `android/app/build/outputs/bundle/release/`.

Ne lancez pas `cap sync` avec `CAP_EMULATORS=1` pour une version publiée : cette variable autorise le HTTP vers les émulateurs locaux.

Dans la Play Console :

- Nouvelle version 2.0.0 (code 9), API cible 36.
- Mettez à jour la section « Sécurité des données » : e-mail facultatif (compte), pseudonyme, historique de parties ; suppression du compte possible dans l'app.
- Lien vers la politique de confidentialité : `privacy_policy.md` (à republier si elle est hébergée ailleurs).

Les parties en cours dans l'app 1.x ne sont pas reprises dans la 2.0 ; le compte et les statistiques le sont.

## 3. iOS (App Store)

Prérequis : un compte Apple Developer (99 €/an).

1. `npm run build && npx cap sync ios`, puis `npx cap open ios`.
2. Dans Xcode, cible App > Signing & Capabilities : choisissez votre équipe. L'identifiant `com.anima2` doit être libre sur l'App Store ; sinon, changez `appId` dans `capacitor.config.ts` et le Bundle Identifier dans Xcode.
3. Product > Archive, puis Distribute App > App Store Connect.
4. Dans App Store Connect : fiche de l'app, captures d'écran (iPhone 6,9" et 6,5"), étiquettes de confidentialité (mêmes données qu'Android), lien vers la politique de confidentialité.

« Se connecter avec Apple » n'est pas obligatoire : l'app ne propose pas de connexion via un réseau social.

## 4. Vérifications avant publication

```bash
npm run test:engine
npm run test:rules
npm run test:e2e
npm run build
```

Puis une partie complète sur deux téléphones (ou un téléphone et le web) contre un vrai adversaire.
