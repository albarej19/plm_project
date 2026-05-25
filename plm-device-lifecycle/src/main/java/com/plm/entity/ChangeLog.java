package com.plm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "change_logs")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @NotBlank(message = "Action is required")
    @Column(nullable = false, length = 50)
    private String action;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime ts;

    @PrePersist
    public void prePersist(){
        this.ts = LocalDateTime.now();
    }
}