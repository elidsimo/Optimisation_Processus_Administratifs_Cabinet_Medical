package org.example.demo3434.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.CabinetUserDTO;
import org.example.demo3434.dto.UtilisateurDTO;
import org.example.demo3434.entity.*;
import org.example.demo3434.repository.CabinetRepository;
import org.example.demo3434.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final CabinetRepository cabinetRepository;

    public List<UtilisateurDTO> getAllUtilisateurs() {
        return utilisateurRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CabinetUserDTO> getAllCabinets() {
        return cabinetRepository.findAll().stream().map(c -> {
            CabinetUserDTO dto = new CabinetUserDTO();
            dto.setId(c.getId());
            dto.setNom(c.getNom());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public UtilisateurDTO createUtilisateur(UtilisateurDTO dto) {
        if (utilisateurRepository.existsByLogin(dto.getLogin())) {
            throw new RuntimeException("Ce login existe déjà");
        }

        Utilisateur utilisateur;

        switch (dto.getRole()) {
            case MEDECIN:
                Medecin medecin = new Medecin();
                medecin.setCabinet(getCabinetById(dto.getCabinetId()));
                utilisateur = medecin;
                break;
            case SECRETAIRE:
                Secretaire secretaire = new Secretaire();
                secretaire.setCabinet(getCabinetById(dto.getCabinetId()));
                utilisateur = secretaire;
                break;
            case ADMIN: // Attention: ton enum est ADMI (sans N à la fin selon ton code)
                utilisateur = new Administrateur();
                break;
            default:
                throw new IllegalArgumentException("Rôle non supporté");
        }

        // Champs communs
        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        utilisateur.setLogin(dto.getLogin());
        utilisateur.setPwd(dto.getPassword()); // Pas de hachage comme demandé
        utilisateur.setNumTel(dto.getNumTel());
        utilisateur.setRole(dto.getRole());

        return mapToDTO(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurDTO updateUtilisateur(Long id, UtilisateurDTO dto) {
        Utilisateur existingUser = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Mise à jour des champs simples
        existingUser.setNom(dto.getNom());
        existingUser.setPrenom(dto.getPrenom());
        existingUser.setNumTel(dto.getNumTel());
        existingUser.setLogin(dto.getLogin());

        // Mise à jour mot de passe seulement si fourni
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            existingUser.setPwd(dto.getPassword());
        }

        // Gestion spécifique des relations (Si on change de cabinet)
        if (existingUser instanceof Medecin && dto.getCabinetId() != null) {
            ((Medecin) existingUser).setCabinet(getCabinetById(dto.getCabinetId()));
        } else if (existingUser instanceof Secretaire && dto.getCabinetId() != null) {
            ((Secretaire) existingUser).setCabinet(getCabinetById(dto.getCabinetId()));
        }

        return mapToDTO(utilisateurRepository.save(existingUser));
    }

    public void deleteUtilisateur(Long id) {
        utilisateurRepository.deleteById(id);
    }

    // --- Helpers ---

    private Cabinet getCabinetById(Integer id) {
        if (id == null) return null;
        return cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet introuvable"));
    }

    private UtilisateurDTO mapToDTO(Utilisateur u) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(u.getId());
        dto.setNom(u.getNom());
        dto.setPrenom(u.getPrenom());
        dto.setLogin(u.getLogin());
        dto.setNumTel(u.getNumTel());
        dto.setRole(u.getRole());

        // Mapping spécifique pour récupérer l'ID cabinet
        if (u instanceof Medecin) {
            Cabinet c = ((Medecin) u).getCabinet();
            if (c != null) {
                dto.setCabinetId(c.getId());
                dto.setCabinetNom(c.getNom());
            }
        } else if (u instanceof Secretaire) {
            Cabinet c = ((Secretaire) u).getCabinet();
            if (c != null) {
                dto.setCabinetId(c.getId());
                dto.setCabinetNom(c.getNom());
            }
        }
        return dto;
    }
}