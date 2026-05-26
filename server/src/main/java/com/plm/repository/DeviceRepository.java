package com.plm.repository;

import com.plm.model.Device;
import com.plm.model.Device.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    Optional<Device> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);

    // ── Query 1: Filter devices by status ─────────────────────────────────────
    List<Device> findByStatus(DeviceStatus status);

    // ── Query 2: Devices with no firmware assigned ─────────────────────────────
    @Query("SELECT d FROM Device d WHERE d.firmwareVersion IS NULL")
    List<Device> findDevicesWithNoFirmware();

    // ── Query 3: Devices on outdated firmware (not the latest released) ─────────
    // Finds all devices whose firmware is NOT the most recently released one
    @Query("""
        SELECT d FROM Device d
        WHERE d.firmwareVersion IS NOT NULL
        AND d.firmwareVersion.id != (
            SELECT f.id FROM FirmwareVersion f
            ORDER BY f.releasedAt DESC
            LIMIT 1
        )
    """)
    List<Device> findDevicesWithOutdatedFirmware();

    // Count by status – used for the bar chart data
    @Query("SELECT d.status, COUNT(d) FROM Device d GROUP BY d.status")
    List<Object[]> countByStatus();
}
