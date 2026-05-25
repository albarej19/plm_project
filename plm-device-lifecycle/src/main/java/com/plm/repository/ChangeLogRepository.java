package com.plm.repository;

import com.plm.entity.ChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {


    //All logs for a specific device, newest first
    List<ChangeLog> findByDeviceIdOrderByTsDesc(Long deviceId);

    //All logs order by timeStamp desc
    List<ChangeLog> findAllByOrderByTsDesc();

    //Last change log entry per device
    @Query("""
            SELECT c FROM ChangeLog c
            WHERE c.ts = (
                SELECT MAX(c2.ts) FROM ChangeLog c2
                WHERE c2.device.id = c.device.id
            )
            ORDER BY c.ts DESC
     """)
    List<ChangeLog> findLastChangePerDevice();

    //count how many times each action type was used
    @Query("SELECT c.action, COUNT(c) FROM ChangeLog c GROUP BY c.action ORDER BY COUNT(c) DESC")
    List<Object[]> countByAction();
}