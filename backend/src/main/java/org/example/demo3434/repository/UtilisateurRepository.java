package org.example.demo3434.repository;


import org.example.demo3434.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByLoginAndPwd(String login, String pwd);

    boolean existsByLogin(String login);

}

