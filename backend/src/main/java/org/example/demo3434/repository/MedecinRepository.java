package org.example.demo3434.repository;

import org.example.demo3434.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Integer> {

    // Récupérer tous les médecins d'un cabinet spécifique
    Optional<Medecin> findById(Integer cabinetId);

    // Récupérer les médecins d'un cabinet triés par nom (idéal pour les listes déroulantes dans le React)
    List<Medecin> findByCabinet_IdOrderByNomAsc(Integer cabinetId);

    // Trouver un médecin par son login (utile si tu ajoutes l'auth plus tard)
    Optional<Medecin> findByLogin(String login);
}