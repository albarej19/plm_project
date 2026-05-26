package com.plm.simulator;

import com.plm.model.ChangeLog;
import com.plm.model.Device;
import com.plm.model.Device.DeviceStatus;
import com.plm.model.FirmwareVersion;
import com.plm.repository.ChangeLogRepository;
import com.plm.repository.DeviceRepository;
import com.plm.repository.FirmwareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FirmwareRepository firmwareRepo;
    private final DeviceRepository deviceRepo;
    private final ChangeLogRepository changeLogRepo;

    @Override
    public void run(String... args) {
        // Only seed if DB is empty
        if (firmwareRepo.count() > 0) {
            log.info("Seed data already present — skipping.");
            return;
        }

        log.info("Seeding initial data...");

        // ── Firmware versions ─────────────────────────────────────────────────
        FirmwareVersion fw1 = firmwareRepo.save(FirmwareVersion.builder()
                .version("1.0.0").notes("Initial release").build());
        FirmwareVersion fw2 = firmwareRepo.save(FirmwareVersion.builder()
                .version("1.1.0").notes("Bug fixes and stability improvements").build());
        FirmwareVersion fw3 = firmwareRepo.save(FirmwareVersion.builder()
                .version("1.2.0").notes("Added OTA update support").build());
        FirmwareVersion fw4 = firmwareRepo.save(FirmwareVersion.builder()
                .version("2.0.0").notes("Major release — new sensor protocol").build());

        // ── Devices (25 devices) ──────────────────────────────────────────────
        String[][] deviceData = {
            {"Temperature Sensor A1",  "SN-TS-001", "ACTIVE",   "2"},
            {"Temperature Sensor A2",  "SN-TS-002", "ACTIVE",   "2"},
            {"Temperature Sensor A3",  "SN-TS-003", "INACTIVE", "1"},
            {"Pressure Gauge B1",      "SN-PG-001", "ACTIVE",   "4"},
            {"Pressure Gauge B2",      "SN-PG-002", "ACTIVE",   "3"},
            {"Pressure Gauge B3",      "SN-PG-003", "INACTIVE", "1"},
            {"Humidity Sensor C1",     "SN-HM-001", "ACTIVE",   "4"},
            {"Humidity Sensor C2",     "SN-HM-002", "ACTIVE",   "2"},
            {"Humidity Sensor C3",     "SN-HM-003", "ACTIVE",   "null"},
            {"Flow Meter D1",          "SN-FM-001", "ACTIVE",   "4"},
            {"Flow Meter D2",          "SN-FM-002", "INACTIVE", "2"},
            {"Flow Meter D3",          "SN-FM-003", "ACTIVE",   "null"},
            {"Vibration Sensor E1",    "SN-VS-001", "ACTIVE",   "3"},
            {"Vibration Sensor E2",    "SN-VS-002", "ACTIVE",   "4"},
            {"Vibration Sensor E3",    "SN-VS-003", "INACTIVE", "1"},
            {"Level Sensor F1",        "SN-LS-001", "ACTIVE",   "4"},
            {"Level Sensor F2",        "SN-LS-002", "ACTIVE",   "3"},
            {"Level Sensor F3",        "SN-LS-003", "ACTIVE",   "null"},
            {"Gas Detector G1",        "SN-GD-001", "ACTIVE",   "4"},
            {"Gas Detector G2",        "SN-GD-002", "INACTIVE", "2"},
            {"Gas Detector G3",        "SN-GD-003", "ACTIVE",   "4"},
            {"Motion Sensor H1",       "SN-MS-001", "ACTIVE",   "4"},
            {"Motion Sensor H2",       "SN-MS-002", "ACTIVE",   "1"},
            {"Power Monitor I1",       "SN-PM-001", "ACTIVE",   "null"},
            {"Power Monitor I2",       "SN-PM-002", "INACTIVE", "2"},
        };

        FirmwareVersion[] fwMap = { null, fw1, fw2, fw3, fw4 };

        for (String[] row : deviceData) {
            FirmwareVersion fw = row[3].equals("null") ? null : fwMap[Integer.parseInt(row[3])];

            Device device = deviceRepo.save(Device.builder()
                    .name(row[0])
                    .serialNumber(row[1])
                    .status(DeviceStatus.valueOf(row[2]))
                    .firmwareVersion(fw)
                    .build());

            // Auto-log creation
            changeLogRepo.save(ChangeLog.builder()
                    .device(device)
                    .action("DEVICE_CREATED")
                    .description("Device registered: " + device.getSerialNumber())
                    .build());

            // Some devices get additional logs
            if (fw != null && !fw.getVersion().equals("1.0.0")) {
                changeLogRepo.save(ChangeLog.builder()
                        .device(device)
                        .action("FIRMWARE_ASSIGNED")
                        .description("Firmware assigned: " + fw.getVersion())
                        .build());
            }
            if (row[2].equals("INACTIVE")) {
                changeLogRepo.save(ChangeLog.builder()
                        .device(device)
                        .action("STATUS_UPDATED")
                        .description("Device marked INACTIVE")
                        .build());
            }
        }

        log.info("Seeding complete: {} firmware versions, {} devices, {} logs",
                firmwareRepo.count(), deviceRepo.count(), changeLogRepo.count());
    }
}
