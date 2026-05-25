package com.plm.dto;

import com.plm.enums.DeviceStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class DeviceDTO {

    //Request
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Serial number is required")
        private String serialNumber;

        private DeviceStatus status;

        private Long firmwareVersionId;
    }

    //Response
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String serialNumber;
        private DeviceStatus status;
        private FirmwareDTO.Response firmware;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}