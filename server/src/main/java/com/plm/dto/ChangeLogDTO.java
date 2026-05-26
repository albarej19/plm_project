package com.plm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class ChangeLogDTO {

    // ── Request ───────────────────────────────────────────────────────────────
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotNull(message = "Device ID is required")
        private Long deviceId;

        @NotBlank(message = "Action is required")
        private String action;

        private String description;
    }

    // ── Response ──────────────────────────────────────────────────────────────
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long deviceId;
        private String deviceName;
        private String action;
        private String description;
        private LocalDateTime ts;
    }

    // ── For "last change per device" query result ─────────────────────────────
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastChangePerDevice {
        private Long deviceId;
        private String deviceName;
        private String lastAction;
        private LocalDateTime lastTs;
    }
}
