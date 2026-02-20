
package org.example.demo3434.service;

import org.example.demo3434.dto.ConsultationDTO;
import org.example.demo3434.entity.Consultation;
import org.example.demo3434.repository.ConsultationRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedecinConsultationService {

    private final ConsultationRepository consultationRepository;

    public List<ConsultationDTO> getAllConsultations() {
        return consultationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ConsultationDTO> searchConsultations(String query) {
        return consultationRepository.searchByPatientName(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Conversion Entity vers DTO pour le frontend
    private ConsultationDTO convertToDTO(Consultation consultation) {
        ConsultationDTO dto = new ConsultationDTO();
        dto.setId(consultation.getIdConsultation());
        dto.setDateConsultation(consultation.getDateConsultation());
        dto.setTypeConsultation(consultation.getTypeConsultation());
        dto.setDiagnostic(consultation.getDiagnostic());
        dto.setExamenClinique(consultation.getExamenClinique());
        dto.setObservations(consultation.getObservations());

        if (consultation.getDossierMedical() != null) {
            var dossier = consultation.getDossierMedical();
            dto.setDossierId(dossier.getIdDossier());
            dto.setAntMedicaux(dossier.getAntMedicaux());
            dto.setAntChirurg(dossier.getAntChirug());
            dto.setAllergies(dossier.getAllergies());

            if (dossier.getPatient() != null) {
                var patient = dossier.getPatient();
                dto.setPatientId(patient.getId());
                dto.setPatientNom(patient.getNom());
                dto.setPatientPrenom(patient.getPrenom());
                dto.setPatientCin(patient.getCin());
            }
        }
        return dto;
    }
}