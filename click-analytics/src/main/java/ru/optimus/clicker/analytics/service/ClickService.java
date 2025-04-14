package ru.optimus.clicker.analytics.service;


import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.optimus.clicker.analytics.dto.ClickDTO;
import ru.optimus.clicker.analytics.model.GlobalClickModal;
import ru.optimus.clicker.analytics.repository.ClickRepository;

import java.math.BigInteger;

@Service
@Data
@AllArgsConstructor
public class ClickService {

    private final ClickRepository repository;
    private final KafkaTemplate<String, String> kafkaTemplate;



    public void processClick(ClickDTO clickDTO){
        GlobalClickModal clickRepository = findOnlyFirst();
        clickRepository.insert(BigInteger.valueOf(clickDTO.getValue()));
        repository.save(clickRepository);
    }

    GlobalClickModal findOnlyFirst(){
        return repository.findAll().stream().findFirst().orElseGet(() -> repository.save(new GlobalClickModal()));
    }

    public long total( ) {
        return findOnlyFirst().getValue().longValue();
    }

}
