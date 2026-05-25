package com.plm.service;

import com.plm.dto.ChangeLogDTO;
import com.plm.entity.Device;

import java.util.List;

public interface ChangeLogService {

    List<ChangeLogDTO.Response> getAllLogs();

    List<ChangeLogDTO.Response> getLogsByDevice(Long deviceId);

    ChangeLogDTO.Response appendLog(ChangeLogDTO.Request request);

    void autoLog(Device device, String action, String description);

    List<ChangeLogDTO.LastChangePerDevice> getLastChangePerDevice();

    ChangeLogDTO.Response toResponse(com.plm.entity.ChangeLog cl);
}