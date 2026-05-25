package com.plm.service.serviceImpl;

import com.plm.dto.FirmwareDTO;
import com.plm.entity.FirmwareVersion;
import com.plm.repository.FirmwareRepository;
import com.plm.service.FirmwareService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FirmwareServiceImpl implements FirmwareService {

    private final FirmwareRepository firmwareRepository;

    @Override
    public List<FirmwareDTO.Response> getAllFirmware() {
        return firmwareRepository.findAllByOrderByReleasedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public FirmwareDTO.Response getFirmwareById(Long id) {
        FirmwareVersion fw = findOrThrow(id);
        return toResponse(fw);
    }

    @Override
    public FirmwareDTO.Response createFirmware(FirmwareDTO.Request request) {
        if (firmwareRepository.existsByVersion(request.getVersion())) {
            throw new IllegalArgumentException("Firmware version '" + request.getVersion() + "' already exists.");
        }
        FirmwareVersion fw = FirmwareVersion.builder()
                .version(request.getVersion())
                .notes(request.getNotes())
                .build();
        return toResponse(firmwareRepository.save(fw));
    }

    @Override
    public FirmwareDTO.Response updateFirmware(Long id, FirmwareDTO.Request request) {
        FirmwareVersion fw = findOrThrow(id);

        if (!fw.getVersion().equals(request.getVersion())
                && firmwareRepository.existsByVersion(request.getVersion())) {
            throw new IllegalArgumentException("version '" + request.getVersion() + "' already exists.");
        }
        fw.setVersion(request.getVersion());
        fw.setNotes(request.getNotes());
        return toResponse(firmwareRepository.save(fw));
    }

    @Override
    public void deleteFirmware(Long id) {
        FirmwareVersion fw = findOrThrow(id);
        firmwareRepository.delete(fw);
    }

    //CompareSemVer

    @Override
    public int compareSemVer(String v1, String v2) {
        String[] parts1 = v1.split("\\.");
        String[] parts2 = v2.split("\\.");

        int maxLen = Math.max(parts1.length, parts2.length);

        for (int i = 0; i < maxLen; i++) {
            int segment1 = (i < parts1.length) ? Integer.parseInt(parts1[i].trim()) : 0;
            int segment2 = (i < parts2.length) ? Integer.parseInt(parts2[i].trim()) : 0;

            if (segment1 < segment2) return -1;
            if (segment1 > segment2) return 1;
        }
        return 0;
    }

    @Override
    public String getNewerVersion(String v1, String v2) {
        return compareSemVer(v1, v2) >= 0 ? v1 : v2;
    }

    //Helper Methods

    public FirmwareVersion findOrThrow(Long id) {
        return firmwareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Firmware not found with id: " + id));
    }

    public FirmwareDTO.Response toResponse(FirmwareVersion fw) {
        return FirmwareDTO.Response.builder()
                .id(fw.getId())
                .version(fw.getVersion())
                .notes(fw.getNotes())
                .releasedAt(fw.getReleasedAt())
                .build();
    }
}