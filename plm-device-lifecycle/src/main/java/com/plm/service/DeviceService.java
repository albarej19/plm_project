package com.plm.service;

import com.plm.dto.DeviceDTO;
import com.plm.entity.Device;
import com.plm.enums.DeviceStatus;

import java.util.List;
import java.util.Map;

public interface DeviceService {

    List<DeviceDTO.Response> getAllDevices();

    List<DeviceDTO.Response> getDevicesByStatus(DeviceStatus status);

    DeviceDTO.Response getDeviceById(Long id);

    DeviceDTO.Response createDevice(DeviceDTO.Request request);

    DeviceDTO.Response updateDevice(Long id, DeviceDTO.Request request);

    void deleteDevice(Long id);

    List<DeviceDTO.Response> getDevicesWithOutdatedFirmware();

    List<DeviceDTO.Response> getDevicesWithNoFirmware();

    Map<String, Long> getDeviceCountByStatus();

    Device findOrThrow(Long id);

    DeviceDTO.Response toResponse(Device d);
}