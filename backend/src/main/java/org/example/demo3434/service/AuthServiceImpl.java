package org.example.demo3434.service;

import org.example.demo3434.dto.LoginRequest;
import org.example.demo3434.dto.LoginResponse;
import org.example.demo3434.entity.Medecin;
import org.example.demo3434.entity.Role; // Assurez-vous d'importer votre Enum
import org.example.demo3434.entity.Secretaire;
import org.example.demo3434.entity.Utilisateur;
import org.example.demo3434.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public LoginResponse login(LoginRequest request) {

        Utilisateur user = utilisateurRepository
                .findByLoginAndPwd(request.getUsername(), request.getPassword())
                .orElseThrow(() ->
                        new RuntimeException("Identifiant ou mot de passe incorrect"));

        // ✅ ADMIN → toujours autorisé (Correction: ADMINISTRATEUR selon votre Enum)
        if (user.getRole() == Role.ADMIN) {
            return buildResponse(user);
        }

        // ✅ MEDECIN
        if (user instanceof Medecin medecin) {
            // Vérification null safety pour le cabinet
            if (medecin.getCabinet() == null || !medecin.getCabinet().isEstActif()) {
                throw new RuntimeException("Cabinet inactif ou non assigné. Connexion refusée.");
            }
        }

        // ✅ SECRETAIRE
        if (user instanceof Secretaire secretaire) {
            // Vérification null safety pour le cabinet
            if (secretaire.getCabinet() == null || !secretaire.getCabinet().isEstActif()) {
                throw new RuntimeException("Cabinet inactif ou non assigné. Connexion refusée.");
            }
        }

        return buildResponse(user);
    }

    private LoginResponse buildResponse(Utilisateur user) {

        String logoUrl = null;
        String nom_cabinet = null;
        String adresse = null;
        String tel = null;


        if (user instanceof Medecin medecin && medecin.getCabinet() != null) {
            logoUrl = buildLogoUrl(medecin.getCabinet().getLogo());
            nom_cabinet = medecin.getCabinet().getNom();
            adresse = medecin.getCabinet().getAdresse();
            tel = medecin.getCabinet().getTel();

        }
        else if (user instanceof Secretaire secretaire && secretaire.getCabinet() != null) {
            logoUrl = buildLogoUrl(secretaire.getCabinet().getLogo());
            nom_cabinet = secretaire.getCabinet().getNom();
            adresse = secretaire.getCabinet().getAdresse();
            tel = secretaire.getCabinet().getTel();
        }

        return new LoginResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getRole().name(),
                logoUrl,
                nom_cabinet,
                adresse,
                tel
        );
    }

    private String buildLogoUrl(String logo) {
        if (logo == null) return null;
        return "http://localhost:8080/api/admin/cabinets/logos/" + logo;
    }

}