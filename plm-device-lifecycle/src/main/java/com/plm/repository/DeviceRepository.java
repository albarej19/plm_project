package com.plm.repository;

import com.plm.entity.Device;
import com.plm.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    //    @Query("select d from devices d where d.serialNumber=serialNumber")
    Optional<Device> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);

    //filter devices by status
    //@Query("SELECT d FROM Device d WHERE d.Status = status")
    List<Device> findByStatus(DeviceStatus status);

    //Devices with no firmware assigned
    @Query("SELECT d FROM Device d WHERE d.firmwareVersion IS NULL")
    List<Device> findDevicesWithNoFirmware();

    //Devices on outdated firmware
    //finds all devices whose firmware is not the most recently released one
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

    //count by status
    @Query("SELECT d.status, COUNT(d) FROM Device d GROUP BY d.status")
    List<Object[]> countByStatus();

}