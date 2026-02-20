package org.example.demo3434.repository;

import org.example.demo3434.entity.Cabinet;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CabinetRepository extends JpaRepository<Cabinet, Integer> {
    long countByEstActifTrue();
    long countByEstActifFalse();

    // Pour récupérer les derniers cabinets (triés par ID décroissant)
    List<Cabinet> findAllByOrderByIdDesc(Pageable pageable);

    List<Cabinet> findAllByOrderByIdDesc();
}