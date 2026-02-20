package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
public class OrdonnanceExamen extends Ordonnance {


    @ElementCollection
    @CollectionTable(name = "examen_item", joinColumns = @JoinColumn(name = "ordonnance_examen_id"))
    @Column(name = "nom_examen")
    private List<String> listeExamens;
}
