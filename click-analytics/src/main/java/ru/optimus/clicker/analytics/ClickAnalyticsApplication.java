package ru.optimus.clicker.analytics;

import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.metadata.EndPoint;
import com.datastax.oss.driver.internal.core.metadata.DefaultEndPoint;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.cassandra.repository.config.EnableReactiveCassandraRepositories;

import java.net.InetSocketAddress;

@SpringBootApplication

public class ClickAnalyticsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClickAnalyticsApplication.class, args);
	}



}
