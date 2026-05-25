package com.plm.service.serviceImpl;

import com.plm.dto.DeviceDTO;
import com.plm.dto.FirmwareDTO;
import com.plm.entity.Device;
import com.plm.entity.FirmwareVersion;
import com.plm.enums.DeviceStatus;
import com.plm.repository.DeviceRepository;
import com.plm.service.ChangeLogService;
import com.plm.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final FirmwareServiceImpl firmwareService;
    private final ChangeLogService changeLogService;

    @Override
    public List<DeviceDTO.Response> getAllDevices() {
        return deviceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<DeviceDTO.Response> getDevicesByStatus(DeviceStatus status) {
        return deviceRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DeviceDTO.Response getDeviceById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public DeviceDTO.Response createDevice(DeviceDTO.Request request) {
        if (deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException("Serial Number '" + request.getSerialNumber() + "' already exists");
        }
        Device device = Device.builder()
                .name(request.getName())
                .serialNumber(request.getSerialNumber())
                .status(request.getStatus() != null ? request.getStatus() : DeviceStatus.ACTIVE)
                .build();

        if (request.getFirmwareVersionId() != null) {
            FirmwareVersion fw = firmwareService.findOrThrow(request.getFirmwareVersionId());
            device.setFirmwareVersion(fw);
        }

        Device saved = deviceRepository.save(device);

        changeLogService.autoLog(saved, "DEVICE_CREATED",
                "Device registered with serial: " + saved.getSerialNumber());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public DeviceDTO.Response updateDevice(Long id, DeviceDTO.Request request) {
        Device device = findOrThrow(id);

        boolean statusChanged = request.getStatus() != null
                && !request.getStatus().equals(device.getStatus());

        boolean firmwareChanged = false;

        device.setName(request.getName());
        device.setSerialNumber(request.getSerialNumber());

        if (request.getStatus() != null) {
            device.setStatus(request.getStatus());
        }

        if (request.getFirmwareVersionId() != null) {
            FirmwareVersion newFw = firmwareService.findOrThrow(request.getFirmwareVersionId());
            Long oldFwId = device.getFirmwareVersion() != null ? device.getFirmwareVersion().getId() : null;
            firmwareChanged = !newFw.getId().equals(oldFwId);
            device.setFirmwareVersion(newFw);
        } else {
            device.setFirmwareVersion(null);
        }

        Device saved = deviceRepository.save(device);

        if (statusChanged) {
            changeLogService.autoLog(saved, "STATUS_CHANGED", "Status changed to: " + saved.getStatus());
        }

        if (firmwareChanged) {
            changeLogService.autoLog(saved, "FIRMWARE_ASSIGNED", "Firmware assigned: " + saved.getFirmwareVersion().getVersion());
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDevice(Long id) {
        Device device = findOrThrow(id);
        deviceRepository.delete(device);
    }

    @Override
    public List<DeviceDTO.Response> getDevicesWithOutdatedFirmware() {
        return deviceRepository.findDevicesWithOutdatedFirmware()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<DeviceDTO.Response> getDevicesWithNoFirmware() {
        return deviceRepository.findDevicesWithNoFirmware()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Map<String, Long> getDeviceCountByStatus() {
        return deviceRepository.countByStatus()
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
    }

    @Override
    public Device findOrThrow(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + id));
    }

    @Override
    public DeviceDTO.Response toResponse(Device d) {
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