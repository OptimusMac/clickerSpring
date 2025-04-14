package ru.optimus.clicker.analytics.kafka;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import ru.optimus.clicker.analytics.dto.ClickDTO;
import ru.optimus.clicker.analytics.service.ClickService;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaGlobalClickListener {

    private final ClickService clickService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final KafkaTemplate<String, String> kafkaTemplate;


    @SuppressWarnings("unchecked")
    @KafkaListener(topics = "clicker", groupId = "analytics-group")
    public void handleOrderRequest(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);

            ClickDTO clickDTO = objectMapper.convertValue(root.get("object"), ClickDTO.class);

            clickService.processClick(clickDTO);
        } catch (Exception e) {
            log.error("Failed to process Kafka message", e);
        }
    }

    @KafkaListener(
            topics = "clicker-find",
            groupId = "analytics-processor-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleTotalRequest(String message) {
        try {
            log.info("Received message: {}", message);
            JsonNode root = objectMapper.readTree(message);
            String correlationId = root.get("correlationId").asText();

            log.info("Processing total request with correlationId: {}", correlationId);

            long total = clickService.total();
            log.info("Calculated total: {}", total);

            kafkaTemplate.send("clicker-replies", correlationId, String.valueOf(total));
            log.info("Response sent to clicker-replies topic");
        } catch (Exception e) {
            log.error("Failed to process total request", e);
        }
    }
}
