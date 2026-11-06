package com.fiap.sprint1.backend_consultas.repository;

import com.fiap.sprint1.backend_consultas.model.RiskEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {
    // Retorna a lista já ordenada da maior prioridade para a menor
    List<RiskEvent> findAllByOrderByPriorityScoreDesc();
}