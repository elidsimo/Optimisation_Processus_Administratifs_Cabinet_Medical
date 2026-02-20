package org.example.demo3434.repository;

import org.example.demo3434.entity.Consultation;
import org.example.demo3434.entity.TypeConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Integer> {

    // Recherche par mot clé dans le nom ou prénom du patient associé
    @Query("SELECT c FROM Consultation c " +
            "JOIN c.dossierMedical d " +
            "JOIN d.patient p " +
            "WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.prenom) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Consultation> searchByPatientName(@Param("query") String query);



    long countByRendezVousMedecinIdAndDateConsultation(Long id, LocalDate date);
    List<Consultation> findTop5ByRendezVousMedecinIdOrderByDateConsultationDesc(Long id);

    List<Consultation> findByDossierMedicalIdDossierOrderByDateConsultationDesc(Integer dossierId);
}