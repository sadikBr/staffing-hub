# Build: docker build -t staffing-hub .
# Run:   docker run -p 8000:8000 -e DB_URL=... -e DB_USERNAME=... -e DB_PASSWORD=... -e OIDC_ISSUER_URI=... staffing-hub

FROM eclipse-temurin:25-jdk AS build
WORKDIR /build
# Dependencies first, so they stay cached as long as pom.xml does not change.
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw --batch-mode --quiet dependency:go-offline
COPY src src
# Tests run in CI (they need Docker for Testcontainers), not during the image build.
RUN ./mvnw --batch-mode --quiet -DskipTests package && cp target/staffing-hub-*.jar app.jar

FROM eclipse-temurin:25-jre
RUN useradd --system --uid 10001 staffing
WORKDIR /app
COPY --from=build /build/app.jar app.jar
USER staffing
EXPOSE 8000
# Health probes for the hosting platform: /actuator/health/liveness and /actuator/health/readiness.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
