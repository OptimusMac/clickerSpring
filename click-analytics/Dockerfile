# Аналогичная многостадийная сборка
FROM eclipse-temurin:21-jdk-jammy as builder

WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Финальный образ с настройками для Cassandra
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
COPY --from=builder /app/target/click-analytics-*.jar ./app.jar

# Увеличиваем таймауты для Cassandra
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -Dspring.data.cassandra.connection.connect-timeout=10s -Dspring.data.cassandra.connection.init-query-timeout=10s"
EXPOSE 8081

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/app.jar"]