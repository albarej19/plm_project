package com.plm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class FirmwareDTO {

    // ── Request (what client sends) ───────────────────────────────────────────
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotBlank(message = "Version string is required (e.g. 1.0.0)")
        private String version;

        private String notes;
    }

    // ── Response (what server returns) ────────────────────────────────────────
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String version;
        private String notes;
        private LocalDateTime releasedAt;
    }
}
