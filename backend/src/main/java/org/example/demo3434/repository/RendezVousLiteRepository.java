package org.example.demo3434.repository;

import org.example.demo3434.entity.RendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RendezVousLiteRepository extends JpaRepository<RendezVous, Integer> {

    // Trouver les RDV d'un cabinet pour une plage de date donnée (ex: journée entière)
    @Query("SELECT r FROM RendezVous r " +
            "WHERE r.medecin.cabinet.id = :cabinetId " +
            "AND r.dateRdv BETWEEN :start AND :end " +
            "ORDER BY r.dateRdv ASC")
    List<RendezVous> findByCabinetAndDateRange(
            @Param("cabinetId") Integer cabinetId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}