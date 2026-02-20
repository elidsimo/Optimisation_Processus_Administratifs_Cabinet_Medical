package org.example.demo3434.service;

import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.LigneOrdonnanceDTO;
import org.example.demo3434.dto.OrdonnanceDTO;
import org.example.demo3434.dto.PatientDTOMed;
import org.example.demo3434.entity.*;
import org.example.demo3434.repository.OrdonnanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Injection de dépendance automatique
public class OrdonnanceServiceImpl implements OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getAllOrdonnances() {
        return ordonnanceRepository.findAllWithDetails().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrdonnanceDTO getOrdonnanceById(Integer id) {
        return ordonnanceRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Ordonnance non trouvée"));
    }

    // Mapper manuel (ou utiliser MapStruct pour les gros projets)
    private OrdonnanceDTO convertToDTO(OrdonnanceMedicament entity) {
        OrdonnanceDTO dto = new OrdonnanceDTO();
        dto.setId(entity.getId());
        dto.setDateCreation(entity.getDate());

        // Récupération Patient via la chaine de relations
        if (entity.getConsultation() != null &&
                entity.getConsultation().getDossierMedical() != null &&
                entity.getConsultation().getDossierMedical().getPatient() != null) {

            Patient p = entity.getConsultation().getDossierMedical().getPatient();
            PatientDTOMed pDto = new PatientDTOMed();
            pDto.setId(p.getId());
            pDto.setNom(p.getNom());
            pDto.setPrenom(p.getPrenom());
            pDto.setCin(p.getCin());
            pDto.setTel(p.getNumTel());
            dto.setPatient(pDto);
        }

        // Récupération Prescriptions
        if (entity.getLignes() != null) {
            List<LigneOrdonnanceDTO> lignes = entity.getLignes().stream().map(l -> {
                LigneOrdonnanceDTO lDto = new LigneOrdonnanceDTO();
                lDto.setPosologie(l.getPosologie());
                lDto.setDuree(l.getDuree());
                if (l.getMedicament() != null) {
                    lDto.setMedicamentNom(l.getMedicament().getNomCommercial());
                    lDto.setMedicamentDosage(l.getMedicament().getDosage());
                    lDto.setMedicamentForme(l.getMedicament().getForme());
                }
                return lDto;
            }).collect(Collectors.toList());
            dto.setPrescriptions(lignes);
        }

        return dto;
    }
}