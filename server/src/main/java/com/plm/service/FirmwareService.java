package com.plm.service;

import com.plm.dto.FirmwareDTO;
import com.plm.model.FirmwareVersion;
import com.plm.repository.FirmwareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FirmwareService {

    private final FirmwareRepository firmwareRepository;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public List<FirmwareDTO.Response> getAllFirmware() {
        return firmwareRepository.findAllByOrderByReleasedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FirmwareDTO.Response getFirmwareById(Long id) {
        FirmwareVersion fw = findOrThrow(id);
        return toResponse(fw);
    }

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

    public FirmwareDTO.Response updateFirmware(Long id, FirmwareDTO.Request request) {
        FirmwareVersion fw = findOrThrow(id);

        // If version string changed, ensure no duplicate
        if (!fw.getVersion().equals(request.getVersion())
                && firmwareRepository.existsByVersion(request.getVersion())) {
            throw new IllegalArgumentException("Version '" + request.getVersion() + "' already exists.");
        }
        fw.setVersion(request.getVersion());
        fw.setNotes(request.getNotes());
        return toResponse(firmwareRepository.save(fw));
    }

    public void deleteFirmware(Long id) {
        FirmwareVersion fw = findOrThrow(id);
        firmwareRepository.delete(fw);
    }

    // ── OOP Method: CompareSemVer ─────────────────────────────────────────────
    /**
     * Compares two semantic version strings (e.g. "1.2.0" vs "1.10.3").
     *
     * Plain string comparison fails because "1.10.0" < "1.9.0" lexicographically.
     * This splits on "." and compares each numeric segment.
     *
     * Returns:
     *   -1  if v1 < v2
     *    0  if v1 == v2
     *    1  if v1 > v2
     */
    public int compareSemVer(String v1, String v2) {
        String[] parts1 = v1.split("\\.");
        String[] parts2 = v2.split("\\.");

        int maxLen = Math.max(parts1.length, parts2.length);

        for (int i = 0; i < maxLen; i++) {
            // Treat missing segments as 0 (e.g. "1.2" vs "1.2.0")
            int segment1 = (i < parts1.length) ? Integer.parseInt(parts1[i].trim()) : 0;
            int segment2 = (i < parts2.length) ? Integer.parseInt(parts2[i].trim()) : 0;

            if (segment1 < segment2) return -1;
            if (segment1 > segment2) return  1;
        }
        return 0; // equal
    }

    /**
     * Returns the newer of two firmware versions, or v1 if equal.
     */
    public String getNewerVersion(String v1, String v2) {
        return compareSemVer(v1, v2) >= 0 ? v1 : v2;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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
