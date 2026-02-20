package org.example.demo3434.dto;

import lombok.Builder;
import lombok.Data;
import org.example.demo3434.entity.Specialite;

@Data
@Builder
public class CabinetDTO {
    private Integer id;
    private String nom;
    private Specialite specialite;
    private String adresse;
    private String tel;
    private boolean estActif;
    private String logoUrl; // Pour afficher l'image directement: <img src={logoBase64} />
}