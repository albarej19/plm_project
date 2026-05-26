package com.plm.service;

import com.plm.dto.DeviceDTO;
import com.plm.dto.FirmwareDTO;
import com.plm.model.Device;
import com.plm.model.Device.DeviceStatus;
import com.plm.model.FirmwareVersion;
import com.plm.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final FirmwareService firmwareService;
    private final ChangeLogService changeLogService;

    // ── Get all devices ────────────────────────────────────────────────────────
    public List<DeviceDTO.Response> getAllDevices() {
        return deviceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get devices filtered by status ────────────────────────────────────────
    public List<DeviceDTO.Response> getDevicesByStatus(DeviceStatus status) {
        return deviceRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get single device ─────────────────────────────────────────────────────
    public DeviceDTO.Response getDeviceById(Long id) {
        return toResponse(findOrThrow(id));
    }

    // ── Create device ─────────────────────────────────────────────────────────
    @Transactional
    public DeviceDTO.Response createDevice(DeviceDTO.Request request) {
        if (deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException(
                    "Serial number '" + request.getSerialNumber() + "' already exists.");
        }

        Device device = Device.builder()
                .name(request.getName())
                .serialNumber(request.getSerialNumber())
                .status(request.getStatus() != null ? request.getStatus() : DeviceStatus.ACTIVE)
                .build();

        // Assign firmware if provided
        if (request.getFirmwareVersionId() != null) {
            FirmwareVersion fw = firmwareService.findOrThrow(request.getFirmwareVersionId());
            device.setFirmwareVersion(fw);
        }

        Device saved = deviceRepository.save(device);

        // Auto-log creation
        changeLogService.autoLog(saved, "DEVICE_CREATED",
                "Device registered with serial: " + saved.getSerialNumber());

        return toResponse(saved);
    }

    // ── Update device (status, firmware, name) ────────────────────────────────
    @Transactional
    public DeviceDTO.Response updateDevice(Long id, DeviceDTO.Request request) {
        Device device = findOrThrow(id);

        boolean statusChanged = request.getStatus() != null
                && !request.getStatus().equals(device.getStatus());
        boolean firmwareChanged = false;

        device.setName(request.getName());
        device.setSerialNumber(request.getSerialNumber());

        // Update status if provided
        if (request.getStatus() != null) {
            device.setStatus(request.getStatus());
        }

        // Update firmware if provided
        if (request.getFirmwareVersionId() != null) {
            FirmwareVersion newFw = firmwareService.findOrThrow(request.getFirmwareVersionId());
            Long oldFwId = device.getFirmwareVersion() != null ? device.getFirmwareVersion().getId() : null;
            firmwareChanged = !newFw.getId().equals(oldFwId);
            device.setFirmwareVersion(newFw);
        } else {
            device.setFirmwareVersion(null);
        }

        Device saved = deviceRepository.save(device);

        // Auto-log changes
        if (statusChanged) {
            changeLogService.autoLog(saved, "STATUS_UPDATED",
                    "Status changed to: " + saved.getStatus());
        }
        if (firmwareChanged) {
            changeLogService.autoLog(saved, "FIRMWARE_ASSIGNED",
                    "Firmware assigned: " + saved.getFirmwareVersion().getVersion());
        }

        return toResponse(saved);
    }

    // ── Delete device ─────────────────────────────────────────────────────────
    @Transactional
    public void deleteDevice(Long id) {
        Device device = findOrThrow(id);
        deviceRepository.delete(device);
    }

    // ── Devices with outdated firmware ─────────────────────────────────────────
    public List<DeviceDTO.Response> getDevicesWithOutdatedFirmware() {
        return deviceRepository.findDevicesWithOutdatedFirmware()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Devices with no firmware ───────────────────────────────────────────────
    public List<DeviceDTO.Response> getDevicesWithNoFirmware() {
        return deviceRepository.findDevicesWithNoFirmware()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Device count by status (for chart) ────────────────────────────────────
    public Map<String, Long> getDeviceCountByStatus() {
        return deviceRepository.countByStatus()
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    public Device findOrThrow(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + id));
    }

    private DeviceDTO.Response toResponse(Device d) {
        FirmwareDTO.Response fwResponse = null;
        if (d.getFirmwareVersion() != null) {
            fwResponse = firmwareService.toResponse(d.getFirmwareVersion());
        }
        return DeviceDTO.Response.builder()
                .id(d.getId())
                .name(d.getName())
                .serialNumber(d.getSerialNumber())
                .status(d.getStatus())
                .firmware(fwResponse)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
