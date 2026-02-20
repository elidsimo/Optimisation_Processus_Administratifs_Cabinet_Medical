package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
public class Administrateur extends Utilisateur {

    // gestion cabinet, service, medicament...
}