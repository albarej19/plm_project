package com.plm.controller;

import com.plm.dto.DeviceDTO;
import com.plm.model.Device.DeviceStatus;
import com.plm.service.DeviceService;
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
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@Tag(name = "Devices", description = "Device registration and lifecycle management")
@SecurityRequirement(name = "bearerAuth")
public class DeviceController {

    private final DeviceService deviceService;

    // ── GET all — USER + ADMIN ────────────────────────────────────────────────
    @GetMapping
    @Operation(summary = "Get all devices (USER, ADMIN)",
               description = "Returns all devices. Filter by ?status=ACTIVE or ?status=INACTIVE")
    public ResponseEntity<List<DeviceDTO.Response>> getAll(
            @RequestParam(required = false) DeviceStatus status) {
        if (status != null) return ResponseEntity.ok(deviceService.getDevicesByStatus(status));
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    // ── GET single — USER + ADMIN ─────────────────────────────────────────────
    @GetMapping("/{id}")
    @Operation(summary = "Get a device by ID (USER, ADMIN)")
    public ResponseEntity<DeviceDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(deviceService.getDeviceById(id));
    }

    // ── GET outdated — USER + ADMIN ───────────────────────────────────────────
    @GetMapping("/outdated-firmware")
    @Operation(summary = "Devices with outdated firmware (USER, ADMIN)")
    public ResponseEntity<List<DeviceDTO.Response>> getOutdated() {
        return ResponseEntity.ok(deviceService.getDevicesWithOutdatedFirmware());
    }

    // ── GET no-firmware — USER + ADMIN ────────────────────────────────────────
    @GetMapping("/no-firmware")
    @Operation(summary = "Devices with no firmware (USER, ADMIN)")
    public ResponseEntity<List<DeviceDTO.Response>> getNoFirmware() {
        return ResponseEntity.ok(deviceService.getDevicesWithNoFirmware());
    }

    // ── GET stats — USER + ADMIN ──────────────────────────────────────────────
    @GetMapping("/stats/by-status")
    @Operation(summary = "Device count by status (USER, ADMIN)")
    public ResponseEntity<Map<String, Long>> statsByStatus() {
        return ResponseEntity.ok(deviceService.getDeviceCountByStatus());
    }

    // ── POST create — ADMIN only ──────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new device (ADMIN only)")
    public ResponseEntity<DeviceDTO.Response> create(@Valid @RequestBody DeviceDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(deviceService.createDevice(request));
    }

    // ── PUT update — ADMIN only ───────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a device (ADMIN only)")
    public ResponseEntity<DeviceDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody DeviceDTO.Request request) {
        return ResponseEntity.ok(deviceService.updateDevice(id, request));
    }

    // ── DELETE — ADMIN only ───────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a device (ADMIN only)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}
