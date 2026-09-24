# Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies before copying source
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

RUN addgroup -S codestar && adduser -S codestar -G codestar
RUN mkdir -p /app/media && chown -R codestar:codestar /app/media
USER codestar

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
