package ru.optimus.clicker.analytics.config;

import com.datastax.oss.driver.api.core.CqlSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.net.InetSocketAddress;
import java.util.UUID;

@Configuration
public class CassandraWebConfig implements WebMvcConfigurer {

    @Bean
    public CqlSession cqlSession(){
        return CqlSession.builder()
                .addContactPoint(new InetSocketAddress("cassandra", 9042))
                .withLocalDatacenter("datacenter1")
                .withKeyspace("clicker")
                .withClientId(UUID.randomUUID())
                .build();
    }
}
