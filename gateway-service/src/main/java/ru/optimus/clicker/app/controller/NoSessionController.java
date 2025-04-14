package ru.optimus.clicker.app.controller;


import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import ru.optimus.clicker.app.dto.ClickDTO;
import ru.optimus.clicker.app.service.ClickService;

@RestController
@RequestMapping("/api/v3/")
@AllArgsConstructor
@Slf4j
public class NoSessionController {

    private final ClickService clickService;

    @GetMapping("/total")
    public Mono<Long> findTotal() {
        return Mono.defer(() -> Mono.justOrEmpty(clickService.total()))
                .subscribeOn(Schedulers.boundedElastic())
                .switchIfEmpty(Mono.defer(() -> Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Session data not found"))))
                .doOnError(e -> log.error("Failed to load session data", e))
                .transform(clickService::metricsAndTracing);
    }
}
