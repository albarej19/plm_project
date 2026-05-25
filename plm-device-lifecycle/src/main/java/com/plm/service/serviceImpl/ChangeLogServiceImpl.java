package com.plm.service.serviceImpl;

import com.plm.dto.ChangeLogDTO;
import com.plm.entity.ChangeLog;
import com.plm.entity.Device;
import com.plm.repository.ChangeLogRepository;
import com.plm.repository.DeviceRepository;
import com.plm.service.ChangeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChangeLogServiceImpl implements ChangeLogService {

    private final ChangeLogRepository changeLogRepository;
    private final DeviceRepository deviceRepository;

    @Override
    public List<ChangeLogDTO.Response> getAllLogs() {
        return changeLogRepository.findAllByOrderByTsDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ChangeLogDTO.Response> getLogsByDevice(Long deviceId) {
        return changeLogRepository.findByDeviceIdOrderByTsDesc(deviceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
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

    @Override
    public void autoLog(Device device, String action, String description) {
        ChangeLog log = ChangeLog.builder()
                .device(device)
                .action(action)
                .description(description)
                .build();

        changeLogRepository.save(log);
    }

    @Override
    public List<ChangeLogDTO.LastChangePerDevice> getLastChangePerDevice() {
        return changeLogRepository.findLastChangePerDevice()
                .stream()
                .map(cl -> new ChangeLogDTO.LastChangePerDevice(
                        cl.getDevice().getId(),
                        cl.getDevice().getName(),
                        cl.getAction(),
                        cl.getTs()
                ))
                .toList();
    }

    @Override
    public ChangeLogDTO.Response toResponse(ChangeLog cl) {
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