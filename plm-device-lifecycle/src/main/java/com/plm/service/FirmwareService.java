package com.plm.service;

import com.plm.dto.FirmwareDTO;
import java.util.List;

public interface FirmwareService {

    List<FirmwareDTO.Response> getAllFirmware();

    FirmwareDTO.Response getFirmwareById(Long id);

    FirmwareDTO.Response createFirmware(FirmwareDTO.Request request);

    FirmwareDTO.Response updateFirmware(Long id, FirmwareDTO.Request request);

    void deleteFirmware(Long id);

    int compareSemVer(String v1, String v2);

    String getNewerVersion(String v1, String v2);
}