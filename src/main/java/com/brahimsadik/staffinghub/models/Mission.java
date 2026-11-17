package com.brahimsadik.staffinghub.models;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.brahimsadik.staffinghub.enums.BusinessUnit;
import com.brahimsadik.staffinghub.enums.MissionStatus;
import com.brahimsadik.staffinghub.enums.SkillLevel;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A piece of work for a customer, which one or more employees are assigned to. */
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "missions")
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "description")
    private String description;

    @Column(name = "comment")
    private String comment;

    @Column(name = "star_url", length = 500)
    private String starUrl;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "business_unit")
    private BusinessUnit businessUnit;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MissionStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id")
    private Employee projectManager;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MissionSkill> skills = new HashSet<>();

    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MissionAssignment> assignments = new HashSet<>();

    /** Adds the skill to the mission's requirements, or changes its required level (null means any level). */
    public void requireSkill(Skill skill, SkillLevel requiredLevel) {
        skills.stream().filter(missionSkill -> missionSkill.getSkill().getId().equals(skill.getId())).findFirst()
                .ifPresentOrElse(
                        missionSkill -> missionSkill.setRequiredLevel(requiredLevel),
                        () -> skills.add(new MissionSkill(this, skill, requiredLevel)));
    }

    /** Returns false when the mission did not require the skill. */
    public boolean removeSkill(UUID skillId) {
        return skills.removeIf(missionSkill -> missionSkill.getSkill().getId().equals(skillId));
    }

    public Optional<MissionAssignment> findAssignment(UUID assignmentId) {
        return assignments.stream().filter(assignment -> assignment.getId().equals(assignmentId)).findFirst();
    }

}
