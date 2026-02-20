package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
public class Medecin extends Utilisateur {
    @Lob
    private byte[] signature;

    @ManyToOne
    @JoinColumn(name = "cabinet_id")
    private Cabinet cabinet;
}

