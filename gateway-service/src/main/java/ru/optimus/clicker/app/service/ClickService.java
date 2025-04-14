package ru.optimus.clicker.app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.support.SendResult;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import ru.optimus.clicker.app.dto.ClickDTO;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

@Service
@AllArgsConstructor
@Slf4j
public class ClickService {

    private final ConcurrentHashMap<String, ClickDTO> sessionClickers = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private KafkaTemplate<String, String> kafkaTemplate;
    private final ConsumerFactory<String, String> consumerFactory;


    public void registerClicker(String sessionId, ClickDTO clicker) {
        sessionClickers.put(sessionId, clicker);
    }

    public void click(ClickDTO clickDTO) {
        String correlationId = UUID.randomUUID().toString();
        String replyTopic = "clicker-" + correlationId;

        try {
            Map<String, Object> request = new HashMap<>();
            request.put("replyTopic", replyTopic);
            request.put("correlationId", correlationId);
            request.put("object", clickDTO);
            log.info("send {}", request);
            kafkaTemplate.send("clicker", 8, correlationId, objectMapper.writeValueAsString(request));
        } catch (Exception e) {
            log.error("Error processing click", e);
        }
    }

    public long total() {
        String correlationId = UUID.randomUUID().toString();
        String replyTopic = "clicker-replies";

        KafkaMessageListenerContainer<String, String> container = null;

        try {
            log.info("Sending total request with correlationId: {}", correlationId);

            Map<String, Object> request = Map.of("correlationId", correlationId);

            CountDownLatch latch = new CountDownLatch(1);
            AtomicReference<Long> response = new AtomicReference<>();

            ContainerProperties containerProps = new ContainerProperties(replyTopic);
            container = new KafkaMessageListenerContainer<>(consumerFactory, containerProps);

            container.setupMessageListener((MessageListener<String, String>) record -> {
                log.info("Received response for correlationId: {}", record.key());
                if (record.key().equals(correlationId)) {
                    response.set(Long.parseLong(record.value()));
                    latch.countDown();
                }
            });
            container.start();

            kafkaTemplate.send("clicker-find", correlationId, objectMapper.writeValueAsString(request));
            log.info("Request sent to clicker-find topic");

            if (!latch.await(10, TimeUnit.SECONDS)) {
                log.error("Timeout waiting for response for correlationId: {}", correlationId);
                throw new RuntimeException("Timeout waiting for response");
            }

            log.info("Successfully received response: {}", response.get());
            return response.get();
        } catch (Exception e) {
            log.error("Error in total request", e);
            throw new RuntimeException("Failed to get total count", e);
        } finally {
            if (container != null) {
                container.stop();
            }
        }
    }

    public  <T> Mono<T> metricsAndTracing(Mono<T> original) {
        return original.name("session.load")
                .metrics()
                .doOnSubscribe(s -> log.debug("Starting session data load"))
                .doOnSuccess(d -> log.debug("Session data loaded successfully"))
                .doOnTerminate(() -> log.debug("Session data load completed"));
    }


    @Scheduled(fixedRate = 5, timeUnit = TimeUnit.SECONDS)
    public void sendAllToKafka() {
        sessionClickers.forEach((sessionId, clicker) -> {
            if (clicker.getValue() > 0) {
                log.info("Processing session {}, with object {}", sessionId, clicker);
                click(clicker);
                clicker.reset();
            }
        });
    }

}
