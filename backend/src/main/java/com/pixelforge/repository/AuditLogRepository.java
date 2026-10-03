package com.pixelforge.repository;

import com.pixelforge.model.AuditLog;
import com.pixelforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByUserOrderByTimestampDesc(User user);
}
