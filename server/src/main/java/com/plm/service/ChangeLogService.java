package com.plm.service;

import com.plm.dto.ChangeLogDTO;
import com.plm.model.ChangeLog;
import com.plm.model.Device;
import com.plm.repository.ChangeLogRepository;
import com.plm.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChangeLogService {

    private final ChangeLogRepository changeLogRepository;
    private final DeviceRepository deviceRepository;

    // ── Get all logs ───────────────────────────────────────────────────────────
    public List<ChangeLogDTO.Response> getAllLogs() {
        return changeLogRepository.findAllByOrderByTsDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get logs for a specific device ─────────────────────────────────────────
    public List<ChangeLogDTO.Response> getLogsByDevice(Long deviceId) {
        return changeLogRepository.findByDeviceIdOrderByTsDesc(deviceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Append a log entry manually ────────────────────────────────────────────
    public ChangeLogDTO.Response appendLog(ChangeLogDTO.Request request) {
        Device device = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + request.getDeviceId()));

        ChangeLog log = ChangeLog.builder()
                .device(device)
                .action(request.getAction())
                .description(request.getDescription())
                .build();

        return toResponse(changeLogRepository.save(log));
    }

    // ── Internal helper: auto-log when device is changed ──────────────────────
    public void autoLog(Device device, String action, String description) {
        ChangeLog log = ChangeLog.builder()
                .device(device)
                .action(action)
                .description(description)
                .build();
        changeLogRepository.save(log);
    }

    // ── Last change per device (aggregation query) ─────────────────────────────
    public List<ChangeLogDTO.LastChangePerDevice> getLastChangePerDevice() {
        return changeLogRepository.findLastChangePerDevice()
                .stream()
                .map(cl -> new ChangeLogDTO.LastChangePerDevice(
                        cl.getDevice().getId(),
                        cl.getDevice().getName(),
                        cl.getAction(),
                        cl.getTs()
                ))
                .collect(Collectors.toList());
    }

    // ── Mapper ─────────────────────────────────────────────────────────────────
    private ChangeLogDTO.Response toResponse(ChangeLog cl) {
        return ChangeLogDTO.Response.builder()
                .id(cl.getId())
                .deviceId(cl.getDevice().getId())
                .deviceName(cl.getDevice().getName())
                .action(cl.getAction())
                .description(cl.getDescription())
                .ts(cl.getTs())
                .build();
    }
}
