package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String message;
    private LocalDateTime dateTimeEnvoi;
    private boolean lu;

    @ManyToOne
    private Secretaire secretaire; // Relation via "Envoie (Patient en cours)"
}
