package com.plm.repository;

import com.plm.entity.FirmwareVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FirmwareRepository extends JpaRepository<FirmwareVersion, Long> {

    Optional<FirmwareVersion> findByVersion(String version);

    boolean existsByVersion(String version);

    //All versions ordered by release date descending
    List<FirmwareVersion> findAllByOrderByReleasedAtDesc();

    //get the latest firmware version by releasedAt date
    @Query("SELECT f FROM FirmwareVersion f ORDER BY f.releasedAt DESC LIMIT 1")
    Optional<FirmwareVersion> findLatestFirmware();
}