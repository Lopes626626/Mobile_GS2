package com.fiap.sprint1.backend_consultas.controller;

import com.fiap.sprint1.backend_consultas.model.RiskEvent;
import com.fiap.sprint1.backend_consultas.service.RiskEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class RiskEventController {

    @Autowired
    private RiskEventService service;

    @PostMapping
    public ResponseEntity<RiskEvent> criarEvento(@RequestBody RiskEvent event) {
        return ResponseEntity.ok(service.registrarEvento(event));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<RiskEvent>> buscarAlertas() {
        // O nome aqui agora bate exatamente com o do Service
        return ResponseEntity.ok(service.listarAlertasPriorizados());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEvento(@PathVariable Long id) {
        service.deletarEvento(id);
        return ResponseEntity.noContent().build();
    }
}