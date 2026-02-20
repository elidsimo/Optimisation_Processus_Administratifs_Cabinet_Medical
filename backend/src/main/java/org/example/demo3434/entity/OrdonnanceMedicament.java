package org.example.demo3434.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
public class OrdonnanceMedicament extends Ordonnance {

    @OneToMany(mappedBy = "ordonnanceMedicament", cascade = CascadeType.ALL)
    private List<LigneOrdonnance> lignes;
}
