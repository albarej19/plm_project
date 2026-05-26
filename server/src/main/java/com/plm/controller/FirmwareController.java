package com.plm.controller;

import com.plm.dto.FirmwareDTO;
import com.plm.service.FirmwareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/firmware")
@RequiredArgsConstructor
@Tag(name = "Firmware Versions", description = "Manage firmware version catalog")
@SecurityRequirement(name = "bearerAuth")
public class FirmwareController {

    private final FirmwareService firmwareService;

    // ── GET all — USER + ADMIN ────────────────────────────────────────────────
    @GetMapping
    @Operation(summary = "Get all firmware versions (USER, ADMIN)")
    public ResponseEntity<List<FirmwareDTO.Response>> getAll() {
        return ResponseEntity.ok(firmwareService.getAllFirmware());
    }

    // ── GET by id — USER + ADMIN ──────────────────────────────────────────────
    @GetMapping("/{id}")
    @Operation(summary = "Get firmware by ID (USER, ADMIN)")
    public ResponseEntity<FirmwareDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(firmwareService.getFirmwareById(id));
    }

    // ── GET compare — USER + ADMIN ────────────────────────────────────────────
    @GetMapping("/compare")
    @Operation(summary = "Compare two semver strings (USER, ADMIN)",
               description = "Returns -1, 0, or 1. Example: ?v1=1.9.0&v2=1.10.0")
    public ResponseEntity<Map<String, Object>> compare(
            @RequestParam String v1, @RequestParam String v2) {
        int result = firmwareService.compareSemVer(v1, v2);
        String message = switch (result) {
            case -1 -> v1 + " is OLDER than " + v2;
            case  1 -> v1 + " is NEWER than " + v2;
            default -> v1 + " is EQUAL to " + v2;
        };
        return ResponseEntity.ok(Map.of("v1", v1, "v2", v2, "result", result, "message", message));
    }

    // ── POST create — ADMIN only ──────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new firmware version (ADMIN only)")
    public ResponseEntity<FirmwareDTO.Response> create(@Valid @RequestBody FirmwareDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(firmwareService.createFirmware(request));
    }

    // ── PUT update — ADMIN only ───────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a firmware version (ADMIN only)")
    public ResponseEntity<FirmwareDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody FirmwareDTO.Request request) {
        return ResponseEntity.ok(firmwareService.updateFirmware(id, request));
    }

    // ── DELETE — ADMIN only ───────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a firmware version (ADMIN only)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        firmwareService.deleteFirmware(id);
        return ResponseEntity.noContent().build();
    }
}
