
# Yoga App – Frontend

## Présentation

Yoga App est une application web de gestion de sessions de yoga développée avec Angular et Spring Boot.

Elle permet aux utilisateurs de consulter les sessions disponibles, de créer un compte, de se connecter et de participer aux sessions. Les administrateurs peuvent créer, modifier et supprimer des sessions.

Le dépôt contient le frontend Angular (`front/`) et le backend Spring Boot (`back/`).

## Technologies

- Angular 19, TypeScript, Angular Material et RxJS
- Jest et Angular TestBed pour les tests unitaires et d'intégration
- Cypress pour les tests end-to-end (E2E)
- Istanbul et NYC pour la couverture des tests E2E

## Prérequis

- Node.js et npm
- Git
- Backend Spring Boot démarré pour les fonctionnalités nécessitant l'API

## Installation

Cloner le dépôt et installer les dépendances du frontend :

```bash
git clone git@github.com:Thierno-224/yoga-fullstack-testing.git
cd yoga-fullstack-testing/front
npm install
```

## Démarrage

Démarrer le backend Spring Boot, puis lancer Angular depuis `front/` :

```bash
npm run start
```

L'application est accessible sur :

- Frontend : http://localhost:4200
- Backend : http://localhost:8080

## Tests unitaires et d'intégration

Les tests sont écrits avec Jest et Angular TestBed dans des fichiers `.spec.ts`.

Depuis le dossier `front/` :

```bash
# Exécuter les tests
npm test -- --runInBand

# Exécuter les tests avec couverture
npm test -- --coverage --runInBand
```

### Rapport de couverture Jest

Pour générer les rapports texte, HTML et LCOV :

```bash
npm test -- --coverage --coverageReporters=text --coverageReporters=html --coverageReporters=lcov --runInBand
```

Ouvrir le rapport HTML sur macOS :

```bash
open coverage/jest/index.html
```

## Tests E2E avec Cypress

Les tests Cypress vérifient les principaux parcours utilisateur dans un navigateur.

Les scénarios sont définis dans `front/cypress/e2e/`.

### Exécution des tests et couverture

Démarrer le backend Spring Boot avec le profil `e2e`, puis exécuter depuis `front/` :

```bash
# Exécuter les tests Cypress avec instrumentation Angular
npm run e2e:ci

# Générer le rapport de couverture
npm run e2e:coverage

# Ouvrir le rapport HTML (macOS)
open coverage/lcov-report/index.html
```

La commande `e2e:ci` démarre automatiquement Angular avec la configuration de couverture et exécute Cypress en mode headless.

La commande `e2e:coverage` génère le rapport NYC à partir des données collectées pendant l'exécution des tests.

### Exécution interactive

Pour utiliser l'interface graphique de Cypress :

```bash
# Terminal 1 : démarrer Angular avec instrumentation
npx ng run yoga:serve-coverage
```

```bash
# Terminal 2 : ouvrir Cypress
npx cypress open
```

Le backend Spring Boot doit également être démarré avec le profil `e2e`.

## Dépôt GitHub

Code source : https://github.com/Thierno-224/yoga-fullstack-testing
