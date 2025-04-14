package ru.optimus.clicker.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.cassandra.repository.config.EnableReactiveCassandraRepositories;
import org.springframework.kafka.annotation.EnableKafka;


@SpringBootApplication
@EnableReactiveCassandraRepositories
@EnableKafka
public class ClickAnalyticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClickAnalyticsApplication.class, args);

    }


}
