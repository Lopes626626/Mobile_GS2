package com.fiap.sprint1.backend_consultas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class RiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tipo de evento: ALAGAMENTO, ILHA_DE_CALOR, FALTA_ENERGIA
    private String type;

    // Localização do evento
    private String location;

    // Origem do dado: SENSOR, BASE_PUBLICA, COMUNIDADE
    private String source;

    // Nível de confiança: 0.0 a 1.0 (exigência do projeto)
    private Double confidenceLevel;

    // Prioridade calculada pelo sistema para gerar alertas
    private Integer priorityScore;

    // Data e hora do registro
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}
