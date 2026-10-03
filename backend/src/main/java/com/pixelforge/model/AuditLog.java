package com.pixelforge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String action;
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(String action, String details, User user) {
        this.action = action;
        this.details = details;
        this.user = user;
        this.timestamp = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public String getAction() { return action; }
    public String getDetails() { return details; }
    public User getUser() { return user; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
