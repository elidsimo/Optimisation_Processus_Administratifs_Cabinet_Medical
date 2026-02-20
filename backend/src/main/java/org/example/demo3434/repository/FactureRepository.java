package org.example.demo3434.repository;

import org.example.demo3434.entity.Facture;
import org.example.demo3434.entity.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FactureRepository extends JpaRepository<Facture, Integer> {

    // Compter les factures payées générées par les secrétaires de ce cabinet
    long countBySecretaire_Cabinet_IdAndStatutFacture(Integer cabinetId, StatutFacture statut);

    // Optionnel : Une requête JOIN FETCH pour optimiser les performances (éviter N+1)
    @Query("SELECT f FROM Facture f " +
            "JOIN FETCH f.consultation c " +
            "JOIN FETCH c.dossierMedical dm " +
            "JOIN FETCH dm.patient p")
    List<Facture> findAllWithDetails();
}