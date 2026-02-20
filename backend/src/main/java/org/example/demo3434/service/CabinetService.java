package org.example.demo3434.service;

import org.example.demo3434.dto.CabinetDTO;
import org.example.demo3434.entity.Cabinet;
import org.example.demo3434.entity.Specialite;
import org.example.demo3434.repository.CabinetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CabinetService {

    private final CabinetRepository cabinetRepository;
    private final FileStorageService fileStorageService;

    public CabinetService(CabinetRepository cabinetRepository,
                          FileStorageService fileStorageService) {
        this.cabinetRepository = cabinetRepository;
        this.fileStorageService = fileStorageService;
    }

    // LISTE
    public List<CabinetDTO> getAllCabinets() {
        return cabinetRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // CREATION
    public CabinetDTO createCabinet(String nom, String specialite,
                                    String adresse, String tel,
                                    MultipartFile logo) throws IOException {

        Cabinet cabinet = new Cabinet();
        cabinet.setNom(nom);
        cabinet.setSpecialite(Specialite.valueOf(specialite));
        cabinet.setAdresse(adresse);
        cabinet.setTel(tel);
        cabinet.setEstActif(true);

        if (logo != null && !logo.isEmpty()) {
            String filename = fileStorageService.saveFile(logo);
            cabinet.setLogo(filename);
        }

        return mapToDTO(cabinetRepository.save(cabinet));
    }


    // MODIFICATION
    public CabinetDTO updateCabinet(Integer id, String nom, String specialite,
                                    String adresse, String tel,
                                    MultipartFile logo) throws IOException {

        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));

        cabinet.setNom(nom);
        cabinet.setSpecialite(Specialite.valueOf(specialite));
        cabinet.setAdresse(adresse);
        cabinet.setTel(tel);

        if (logo != null && !logo.isEmpty()) {
            String filename = fileStorageService.saveFile(logo);
            cabinet.setLogo(filename);
        }

        return mapToDTO(cabinetRepository.save(cabinet));
    }


    // TOGGLE STATUS (Activer/Désactiver)
    public CabinetDTO toggleStatus(Integer id) {
        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        cabinet.setEstActif(!cabinet.isEstActif());
        return mapToDTO(cabinetRepository.save(cabinet));
    }

    // SUPPRESSION
    public void deleteCabinet(Integer id) {
        cabinetRepository.deleteById(id);
    }

    // --- Mapper Utilitaire ---
    private CabinetDTO mapToDTO(Cabinet cabinet) {

        String logoUrl = null;
        if (cabinet.getLogo() != null) {
            logoUrl = "http://localhost:8080/api/admin/cabinets/logos/" + cabinet.getLogo();
        }

        return CabinetDTO.builder()
                .id(cabinet.getId())
                .nom(cabinet.getNom())
                .specialite(cabinet.getSpecialite())
                .adresse(cabinet.getAdresse())
                .tel(cabinet.getTel())
                .estActif(cabinet.isEstActif())
                .logoUrl(logoUrl)
                .build();
    }

}