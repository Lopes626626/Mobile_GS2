package com.fiap.sprint1.backend_consultas.service;

import com.fiap.sprint1.backend_consultas.model.RiskEvent;
import com.fiap.sprint1.backend_consultas.repository.RiskEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RiskEventService {

    @Autowired
    private RiskEventRepository repository;

    public RiskEvent registrarEvento(RiskEvent event) {
        // Calcula a prioridade antes de salvar no banco
        event.setPriorityScore(calcularPrioridade(event));
        return repository.save(event);
    }

    public List<RiskEvent> listarAlertasPriorizados() {
        return repository.findAllByOrderByPriorityScoreDesc();
    }

    // Lógica de inteligência para classificar a urgência do alerta
    private Integer calcularPrioridade(RiskEvent event) {
        int baseScore = 0;

        // 1. Peso pelo tipo de risco
        if (event.getType() != null) {
            switch (event.getType().toUpperCase()) {
                case "ALAGAMENTO": baseScore = 60; break;
                case "FALTA_ENERGIA": baseScore = 40; break;
                case "ILHA_DE_CALOR": baseScore = 20; break;
                default: baseScore = 10;
            }
        }

        // 2. Ajuste pelo nível de confiança da informação (0.0 a 1.0)
        double confidence = (event.getConfidenceLevel() != null) ? event.getConfidenceLevel() : 0.5;
        int score = (int) (baseScore * confidence);

        // 3. Bônus por confiabilidade da fonte
        if ("SENSOR".equalsIgnoreCase(event.getSource()) || "BASE_PUBLICA".equalsIgnoreCase(event.getSource())) {
            score += 30; // Dados oficiais ou IOT recebem mais peso
        } else if ("COMUNIDADE".equalsIgnoreCase(event.getSource())) {
            score += 10;
        }

        return Math.min(score, 100); // Trava a pontuação máxima em 100
    }
}