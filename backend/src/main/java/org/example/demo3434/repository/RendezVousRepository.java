package org.example.demo3434.repository;

import org.example.demo3434.entity.RendezVous;
import org.example.demo3434.entity.StatutRdv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RendezVousRepository extends JpaRepository<RendezVous, Integer> {

    // Compter les RDV d'un cabinet (via le médecin du cabinet) ayant un certain statut
    long countByMedecin_Cabinet_IdAndStatutRdv(Integer cabinetId, StatutRdv statut);

    // Compter tous les RDV du cabinet
    long countByMedecin_Cabinet_Id(Integer cabinetId);

    // Récupérer les RDV du jour pour un cabinet spécifique
    @Query("SELECT r FROM RendezVous r WHERE r.medecin.cabinet.id = :cabinetId AND r.dateRdv BETWEEN :start AND :end ORDER BY r.dateRdv ASC")
    List<RendezVous> findRdvTodayByCabinet(@Param("cabinetId") Integer cabinetId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Liste des patients en attente pour le dashboard
    List<RendezVous> findByMedecinIdAndStatutRdvOrderByDateRdvAsc(Long id, StatutRdv statut);


    long countByMedecinIdAndStatutRdvAndDateRdvAfter(Long id, StatutRdv statut, LocalDateTime date);
}