# Codestar

Open-source &amp; self-hosted e-learning platform

## Backend 

Command to execute the back : `.\mvnw.cmd spring-boot:run` 
Make sure you up your bdd on docker (docker compose up -d)

## Frontend



## Docker 

Claude :

```
- Deux Dockerfiles séparés dans le front-end et le back-end :
Chacun build dans son application et tourne indépendamment. Le docker-compose.yml à la racine les orchestre ensemble avec PostgreSQL.

- docker-compose.dev.yml : 
En dev vous ne voulez pas rebuilder l'image à chaque changement. Ce fichier surcharge le principal pour monter les sources en volume et activer le hot-reload.

- .env.example : 
Ce fichier documente toutes les variables nécessaires (DB_PASSWORD, JWT_SECRET, etc.), chaque organisation copie-colle et remplit ses valeurs.

- docker/postgres/init.sql :
Le schéma initial de la base, exécuté automatiquement au premier lancement du container PostgreSQL.
```
