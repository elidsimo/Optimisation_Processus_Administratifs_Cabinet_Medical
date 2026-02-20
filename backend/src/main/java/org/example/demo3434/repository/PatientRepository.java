package org.example.demo3434.repository;

import org.example.demo3434.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    // Compter les patients liés à un cabinet spécifique
    long countByCabinet_Id(Integer cabinetId);

    // Récupérer uniquement les patients du cabinet spécifié
    List<Patient> findByCabinet_IdOrderByNomAsc(Integer cabinetId);

    // Vérifier l'unicité du CIN (optionnel mais recommandé)
    boolean existsByCinAndCabinet_Id(String cin, Integer cabinetId);

    // Recherche pour la page 1 (Nom, Prénom ou CIN)
    @Query("SELECT p FROM Patient p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.cin) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Patient> searchPatients(@Param("query") String query);
}