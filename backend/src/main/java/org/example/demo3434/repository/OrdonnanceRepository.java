package org.example.demo3434.repository;

import org.example.demo3434.entity.OrdonnanceMedicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrdonnanceRepository extends JpaRepository<OrdonnanceMedicament, Integer> {

    // Récupérer les ordonnances triées par date décroissante
    // On utilise un JOIN FETCH pour optimiser les performances (éviter le N+1 select)
    @Query("SELECT o FROM OrdonnanceMedicament o " +
            "JOIN FETCH o.consultation c " +
            "JOIN FETCH c.dossierMedical d " +
            "JOIN FETCH d.patient p " +
            "LEFT JOIN FETCH o.lignes l " +
            "LEFT JOIN FETCH l.medicament m " +
            "ORDER BY o.date DESC")
    List<OrdonnanceMedicament> findAllWithDetails();


    long countByConsultationRendezVousMedecinIdAndDate(Long id, LocalDate date);
}