
# Yoga App !

Backend de l'application Yoga App !.

## Configuration du back

- name: back
- port: 8080
- Spring Boot : 3.5.5
- Java : 21

## Pré-requis pour le bon fonctionnement du back

- JDK 21
- Docker
- Docker Compose
- Maven 3.9.3 ([Télécharger Maven](https://archive.apache.org/dist/maven/maven-3/3.9.3/binaries/)) ou plus

## Démarrage du back

Pour démarrer le backend :

1. Démarrer Docker Desktop sur votre poste de travail local.
2. Ouvrir un terminal et se placer dans le dossier `back`.
3. Exécuter la commande Maven :

```bash
mvn spring-boot:run
```

Cette commande va :

- Initialiser le conteneur Docker contenant la base de données MySQL.
- Démarrer l'application backend.
- Connecter l'application à la base de données.

Les logs devraient notamment afficher :

```text
:: Spring Boot :: (v3.5.5)

Starting SpringBootSecurityJwtApplication using Java 21
No active profile set, falling back to 1 default profile: "default"

Container back_mysql Started
Container back_mysql Healthy

HikariPool-1 - Start completed.

Tomcat started on port 8080 (http) with context path '/'

Started SpringBootSecurityJwtApplication
```

Le backend est accessible sur :

http://localhost:8080

Sur Docker Desktop, vous devriez voir apparaître un conteneur MySQL correspondant au projet.

![1-docker-desktop](pictures/1-docker-desktop.png)

### Vérification de la base de données

Vous pouvez vous connecter à la base de données et vérifier que la table `users` a été créée.

Dans Docker Desktop, sélectionner le conteneur `back_mysql`, puis ouvrir l'onglet `Exec`.

1. Se connecter à MySQL :

```bash
mysql -u user_test -p
```

Le mot de passe est :

```text
test_password
```

2. Sélectionner la base de données :

```sql
USE test;
```

3. Copier le contenu du fichier `src/main/resources/sql/insert_user.sql` et l'exécuter 


4. Vérifier le contenu de la table :

```sql
SELECT * FROM users;
```

Le résultat devrait afficher les informations de l'utilisateur inséré.

Ce script crée l'administrateur par défaut :

- Login : `yoga@studio.com`
- Password : `test!1234`

La capture d'écran ci-dessous résume les étapes précédentes :

![2-docker-desktop-bdd](pictures/2-docker-desktop-bdd.png)

## Configuration des environnements de test

Le backend utilise plusieurs profils Spring Boot pour séparer l'environnement de développement des environnements de test.

| Profil | Base de données | Utilisation |
|---|---|---|
| `default` | MySQL | Développement |
| `test` | H2 | Tests d'intégration backend |
| `e2e` | H2 | Tests end-to-end Cypress |

Les fichiers de configuration sont situés dans :

```text
src/main/resources/
├── application.yml
├── application-test.yml
├── application-e2e.yml
└── sql/
    ├── insert_user.sql
    └── data-e2e.sql
```

Le profil `e2e` utilise la variable d'environnement `E2E_JWT_SECRET` pour la signature des tokens JWT.

Cette variable doit être définie avant de démarrer le backend avec ce profil.

## Tests backend

Le projet utilise JUnit 5, Mockito, Spring Boot Test et Spring Security Test pour tester les différentes couches de l'application.

### Tests unitaires

Mockito est utilisé pour simuler les dépendances, notamment les repositories et les services.

Depuis le dossier `back`, exécuter :

```bash
mvn test
```

Cette commande lance les tests détectés par Maven Surefire.

### Tests d'intégration

Les tests d'intégration permettent de vérifier les interactions entre les composants Spring Boot et la base de données.

Ils utilisent notamment :

- Spring Boot Test
- Spring Security Test
- Spring Data JPA
- H2
- Testcontainers, lorsqu'un test nécessite un conteneur de base de données

Les tests utilisant H2 peuvent activer le profil `test` :

```java
@ActiveProfiles("test")
@SpringBootTest
```

Le profil `test` charge la configuration définie dans `application-test.yml`.

Pour exécuter les tests :

```bash
mvn test
```


## Couverture des tests backend

La couverture du code Java est mesurée avec JaCoCo 0.8.13, configuré dans le fichier `pom.xml`.

### Génération du rapport de couverture

Depuis le dossier `back`, exécuter :

```bash
mvn clean verify
```

### Consultation du rapport

Le rapport HTML est disponible à l'emplacement suivant :

```text
target/site/jacoco/index.html
```

Sur macOS, ouvrir le rapport avec :

```bash
open target/site/jacoco/index.html
```

Le package `dto` est exclu du rapport JaCoCo selon la configuration du `pom.xml`.

## Tests E2E avec Cypress

Les tests end-to-end permettent de vérifier le fonctionnement de l'application complète, depuis l'interface Angular jusqu'à l'API Spring Boot.

Ils utilisent une base de données H2 dédiée, indépendante de MySQL.

### Démarrage du backend en mode E2E

Le profil `e2e` utilise :

- Une base H2 en mémoire.
- Une initialisation automatique du schéma.
- Des données de test prédéfinies.
- Une configuration JWT dédiée.
- Docker Compose désactivé.

Le fichier `src/main/resources/sql/data-e2e.sql` contient les données nécessaires aux scénarios Cypress.

Pour démarrer le backend avec le profil `e2e`, exécuter :

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=e2e
```

La variable `E2E_JWT_SECRET` doit être disponible dans l'environnement du processus Maven.

Il est également possible de démarrer le backend depuis IntelliJ IDEA avec la configuration `SpringBootSecurityJwtApplicationE2E`.

### Comptes de test E2E

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `yoga@studio.com` | `test!1234` |
| Utilisateur standard | `user@yoga.test` | `test!1234` |

La base H2 est recréée au démarrage du backend avec le profil `e2e`.

### Exécution des tests Cypress

Le backend doit être démarré avec le profil `e2e` sur le port `8080`.

Depuis le dossier `front`, démarrer Angular :

```bash
npm run start
```

Dans un second terminal, toujours depuis `front`, ouvrir Cypress :

```bash
npx cypress open
```

## Ressources

### Collection Postman

Importer la collection Postman disponible dans :

```text
postman/yoga.postman_collection.json
```

La documentation Postman se trouve ici :

https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman
