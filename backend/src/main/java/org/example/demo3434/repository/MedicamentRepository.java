package org.example.demo3434.repository;

import org.example.demo3434.entity.Medicament;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicamentRepository extends JpaRepository<Medicament, Integer> {
    List<Medicament> findAllByOrderByIdDesc(Pageable pageable);
    List<Medicament> findByNomCommercialContainingIgnoreCase(String nom);

}