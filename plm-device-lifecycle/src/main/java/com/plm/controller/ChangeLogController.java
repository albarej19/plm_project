package com.plm.controller;

import com.plm.dto.ChangeLogDTO;
import com.plm.service.ChangeLogService;
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

@RestController
@RequestMapping("/api/changelogs")
@RequiredArgsConstructor
@Tag(name = "Change Logs", description = "Device change audit trail")
@SecurityRequirement(name = "bearerAuth")
public class ChangeLogController {

    private final ChangeLogService changeLogService;

    // GET all / by device - USER + ADMIN
    @GetMapping
    @Operation(summary = "Get change logs (USER, ADMIN)",
            description = "Returns all logs. Filter by ?deviceId=1")
    public ResponseEntity<List<ChangeLogDTO.Response>> getLogs(
            @RequestParam(required = false) Long deviceId) {
        if (deviceId != null) return ResponseEntity.ok(changeLogService.getLogsByDevice(deviceId));
        return ResponseEntity.ok(changeLogService.getAllLogs());
    }

    // GET last per device - USER + ADMIN
    @GetMapping("/last-per-device")
    @Operation(summary = "Last change log per device (USER, ADMIN)")
    public ResponseEntity<List<ChangeLogDTO.LastChangePerDevice>> getLastPerDevice() {
        return ResponseEntity.ok(changeLogService.getLastChangePerDevice());
    }

    // POST append - ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually append a log entry (ADMIN only)")
    public ResponseEntity<ChangeLogDTO.Response> appendLog(
            @Valid @RequestBody ChangeLogDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(changeLogService.appendLog(request));
    }
}