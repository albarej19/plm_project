package com.plm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "firmware_versions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirmwareVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // e.g. "1.0.0", "2.3.1"
    @NotBlank(message = "Version is required")
    @Column(unique = true, nullable = false, length = 20)
    private String version;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime releasedAt;

    // One firmware version can be used by many devices
    @OneToMany(mappedBy = "firmwareVersion", fetch = FetchType.LAZY)
    private List<Device> devices;

    @PrePersist
    public void prePersist() {
        this.releasedAt = LocalDateTime.now();
    }
}
