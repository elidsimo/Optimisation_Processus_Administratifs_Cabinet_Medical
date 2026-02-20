package org.example.demo3434.dto;

import lombok.Data;
import org.example.demo3434.entity.TypeConsultation;
import java.util.List;

@Data
public class ConsultationCreateDTO {
    private Integer patientId;
    private TypeConsultation typeConsultation;
    private String examenClinique;
    private String diagnostic;
    private String observations;
    private List<PrescriptionDTO> prescriptions;
}
