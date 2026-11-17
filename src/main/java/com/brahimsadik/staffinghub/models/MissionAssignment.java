package com.brahimsadik.staffinghub.models;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One employee's assignment to a mission. */
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "mission_assignments")
public class MissionAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    /** Days actually worked: independent of the start/end period, but cannot exceed it. */
    @Column(name = "duration")
    private Integer duration;

    /** Occupation rate, as a percentage (0 excluded, 100 included). */
    @Column(name = "rate", precision = 5, scale = 2)
    private BigDecimal rate;

    @Column(name = "appreciation")
    private String appreciation;

    @Column(name = "comment")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Sets the employee and keeps {@link Employee#getAssignments()} in sync on both the old and new employee. */
    public void assignTo(Employee newEmployee) {
        if (employee != null) {
            employee.getAssignments().remove(this);
        }
        employee = newEmployee;
        newEmployee.getAssignments().add(this);
    }

}
