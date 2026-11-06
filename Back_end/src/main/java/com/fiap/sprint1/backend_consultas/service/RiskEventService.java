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

    // Método com o nome exato exigido pelo Controller e com ordenação
    public List<RiskEvent> listarAlertasPriorizados() {
        List<RiskEvent> eventos = repository.findAll();
        eventos.sort((e1, e2) -> Integer.compare(e2.getPriorityScore(), e1.getPriorityScore()));
        return eventos;
    }

    // Regista o evento com o cálculo obrigatório do backend
    public RiskEvent registrarEvento(RiskEvent evento) {
        int scoreCalculado = calcularPrioridade(evento);
        evento.setPriorityScore(scoreCalculado);

        return repository.save(evento);
    }

    public void deletarEvento(Long id) {
        repository.deleteById(id);
    }

    // Lógica da Inteligência de Priorização (incluindo VENDAVAL e DEFESA_CIVIL)
    public int calcularPrioridade(RiskEvent evento) {
        int scoreBase = 0;

        if (evento.getType() != null) {
            switch (evento.getType().toUpperCase()) {
                case "INCENDIO":
                case "DESLIZAMENTO":
                    scoreBase = 85;
                    break;
                case "VENDAVAL":
                    scoreBase = 75;
                    break;
                case "ALAGAMENTO":
                    scoreBase = 60;
                    break;
                case "FALTA_ENERGIA":
                    scoreBase = 50;
                    break;
                case "ILHA_DE_CALOR":
                    scoreBase = 40;
                    break;
                case "POLUICAO":
                    scoreBase = 30;
                    break;
                default:
                    scoreBase = 10;
            }
        }

        double scoreCalculado = scoreBase * evento.getConfidenceLevel();

        if (evento.getSource() != null) {
            switch (evento.getSource().toUpperCase()) {
                case "DEFESA_CIVIL":
                    scoreCalculado += 25;
                    break;
                case "SENSOR":
                    scoreCalculado += 15;
                    break;
                case "BASE_PUBLICA":
                    scoreCalculado += 10;
                    break;
                case "COMUNIDADE":
                    scoreCalculado += 5;
                    break;
            }
        }

        return (int) Math.min(scoreCalculado, 100);
    }
}