package org.example.demo3434.dto;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class PatientLiteDTO {
    private Integer id;
    private String nom;
    private String prenom;
    private String cin;
    private String numTel;
}