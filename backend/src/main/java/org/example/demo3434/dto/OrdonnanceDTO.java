package org.example.demo3434.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class OrdonnanceDTO {
    private Integer id;
    private LocalDate dateCreation;
    private String nomMedecin;
    private PatientDTOMed patient;
    private List<LigneOrdonnanceDTO> prescriptions;
}