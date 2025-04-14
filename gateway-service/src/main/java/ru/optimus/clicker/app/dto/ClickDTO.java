package ru.optimus.clicker.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ClickDTO {

    private long value;

    public void increment() {
        this.value++;
    }

    public void reset() {
        this.value = 0;
    }

}
