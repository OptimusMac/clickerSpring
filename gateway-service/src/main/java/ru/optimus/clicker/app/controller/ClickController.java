package ru.optimus.clicker.app.controller;


import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import ru.optimus.clicker.app.dto.ClickDTO;
import ru.optimus.clicker.app.service.ClickService;

@RestController
@RequestMapping("/api/v2")
@RequiredArgsConstructor
@Slf4j
@SessionAttributes("click_session")
public class ClickController {

    private final ClickService clickService;


    @ModelAttribute("click_session")
    public ClickDTO clickDTO() {
        return new ClickDTO();
    }


    @PostMapping("/click")
    public void sendClick(HttpSession session) {
        ClickDTO clickDTO = loadObjectInSession("clicker", ClickDTO.class, session);
        ClickDTO sessionDTO = loadObjectInSession("click_session", ClickDTO.class, session);
        clickDTO.increment();
        sessionDTO.increment();
        clickService.registerClicker(session.getId(), clickDTO);
        log.info("click {}", clickDTO);
    }

    @SuppressWarnings("unchecked")
    @SneakyThrows
    private <T> T loadObjectInSession(String id, Class<T> clazz, HttpSession session) {
        T object = (T) session.getAttribute(id);
        if (object == null) {
            session.setAttribute(id, clazz.newInstance());
            return loadObjectInSession(id, clazz, session);
        }
        return clazz.cast(object);

    }


    @GetMapping("/find")
    public Mono<ClickDTO> findSessionDTO(HttpSession session) {
        return Mono.defer(() -> Mono.justOrEmpty(loadObjectInSession("click_session", ClickDTO.class, session)))
                .subscribeOn(Schedulers.boundedElastic())
                .switchIfEmpty(Mono.defer(() -> Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Session data not found"))))
                .doOnError(e -> log.error("Failed to load session data", e))
                .transform(clickService::metricsAndTracing);
    }

}
