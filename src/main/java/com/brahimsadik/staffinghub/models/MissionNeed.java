package com.brahimsadik.staffinghub.models;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.brahimsadik.staffinghub.enums.Seniority;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * An open position on a mission, e.g. "a senior developer at 80% from March". Filled by an assignment; open again
 * when that assignment is removed. Managed through {@link Mission#getNeeds()}.
 */
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "mission_needs")
public class MissionNeed {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    /** Optional: the role wanted. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    /** Optional: the seniority wanted. */
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "seniority")
    private Seniority seniority;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    /** Occupation rate wanted, as a percentage (100 when null). */
    @Column(name = "rate", precision = 5, scale = 2)
    private BigDecimal rate;

    @Column(name = "comment")
    private String comment;

    /** The assignment that filled the need; null while the need is open. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filled_by_assignment_id")
    private MissionAssignment filledBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public boolean isOpen() {
        return filledBy == null;
    }

}
