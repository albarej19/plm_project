package com.plm.repository;

import com.plm.model.ChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {

    // All logs for a specific device, newest first
    List<ChangeLog> findByDeviceIdOrderByTsDesc(Long deviceId);

    // All logs ordered by timestamp descending
    List<ChangeLog> findAllByOrderByTsDesc();

    // ── Query: Last change log entry per device (aggregation) ─────────────────
    // Uses GROUP BY + MAX to get the most recent log per device
    @Query("""
        SELECT c FROM ChangeLog c
        WHERE c.ts = (
            SELECT MAX(c2.ts) FROM ChangeLog c2
            WHERE c2.device.id = c.device.id
        )
        ORDER BY c.ts DESC
    """)
    List<ChangeLog> findLastChangePerDevice();

    // Count how many times each action type was used
    @Query("SELECT c.action, COUNT(c) FROM ChangeLog c GROUP BY c.action ORDER BY COUNT(c) DESC")
    List<Object[]> countByAction();
}
