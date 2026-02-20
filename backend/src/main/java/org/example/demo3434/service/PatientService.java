package org.example.demo3434.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.PatientDTO;
import org.example.demo3434.entity.Cabinet;
import org.example.demo3434.entity.Patient;
import org.example.demo3434.entity.Secretaire;
import org.example.demo3434.repository.PatientRepository;
import org.example.demo3434.repository.SecretaireRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final SecretaireRepository secretaireRepository;

    // Récupérer le cabinet de la secrétaire connectée
    private Cabinet getCabinetFromSecretaire(Long secretaireId) {
        Secretaire sec = secretaireRepository.findById(secretaireId)
                .orElseThrow(() -> new EntityNotFoundException("Secrétaire introuvable"));
        if (sec.getCabinet() == null) {
            throw new IllegalStateException("Cette secrétaire n'est rattachée à aucun cabinet");
        }
        return sec.getCabinet();
    }

    // LISTER
    public List<PatientDTO> getAllPatients(Long secretaireId) {
        Integer cabinetId = getCabinetFromSecretaire(secretaireId).getId();
        return patientRepository.findByCabinet_IdOrderByNomAsc(cabinetId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // CREER
    @Transactional
    public PatientDTO createPatient(Long secretaireId, PatientDTO dto) {
        Cabinet cabinet = getCabinetFromSecretaire(secretaireId);

        // Vérif doublon CIN (optionnel)
        if(patientRepository.existsByCinAndCabinet_Id(dto.getCin(), cabinet.getId())){
            throw new IllegalArgumentException("Un patient avec ce CIN existe déjà dans ce cabinet.");
        }

        Patient patient = new Patient();
        mapToEntity(patient, dto);
        patient.setCabinet(cabinet); // Liaison automatique

        Patient saved = patientRepository.save(patient);
        return mapToDTO(saved);
    }

    // MODIFIER
    @Transactional
    public PatientDTO updatePatient(Integer id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));

        mapToEntity(patient, dto);
        Patient updated = patientRepository.save(patient);
        return mapToDTO(updated);
    }

    // SUPPRIMER
    public void deletePatient(Integer id) {
        if (!patientRepository.existsById(id)) {
            throw new EntityNotFoundException("Patient introuvable");
        }
        patientRepository.deleteById(id);
    }

    // --- Mappers ---
    private PatientDTO mapToDTO(Patient p) {
        return PatientDTO.builder()
                .id(p.getId())
                .cin(p.getCin())
                .nom(p.getNom())
                .prenom(p.getPrenom())
                .dateNaissance(p.getDateNaissance())
                .sexe(p.getSexe())
                .numTel(p.getNumTel())
                .typeMutuelle(p.getTypeMutuelle())
                .build();
    }

    private void mapToEntity(Patient p, PatientDTO dto) {
        p.setCin(dto.getCin());
        p.setNom(dto.getNom());
        p.setPrenom(dto.getPrenom());
        p.setDateNaissance(dto.getDateNaissance());
        p.setSexe(dto.getSexe());
        p.setNumTel(dto.getNumTel());
        p.setTypeMutuelle(dto.getTypeMutuelle());
    }
}