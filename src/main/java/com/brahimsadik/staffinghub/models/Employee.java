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

import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "comment")
    private String comment;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "seniority", nullable = false)
    private Seniority seniority;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "community", nullable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Read-only view of the employees this one manages. No cascade on purpose: deleting a manager must never delete
     * their staff (the database sets their manager_id to NULL instead).
     */
    @OneToMany(mappedBy = "manager")
    private Set<Employee> staff = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "employees_roles", joinColumns = @JoinColumn(name = "employee_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "employees_technologies", joinColumns = @JoinColumn(name = "employee_id"), inverseJoinColumns = @JoinColumn(name = "technology_id"))
    private Set<Technology> technologies = new HashSet<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EmployeeSkill> skills = new HashSet<>();

    public boolean hasTechnology(UUID technologyId) {
        return technologies.stream().anyMatch(technology -> technology.getId().equals(technologyId));
    }

    /**
     * Whether {@code candidate} is this employee's manager, their manager's manager, and so on up the hierarchy.
     */
    public boolean isManagedBy(Employee candidate) {
        for (var current = manager; current != null; current = current.getManager()) {
            if (current.getId().equals(candidate.getId())) {
                return true;
            }
        }
        return false;
    }

    public Optional<EmployeeSkill> findSkill(UUID skillId) {
        return skills.stream().filter(employeeSkill -> employeeSkill.getSkill().getId().equals(skillId)).findFirst();
    }

    /** Sets the employee's level in the skill, adding the skill if they do not have it yet. */
    public void setSkillLevel(Skill skill, SkillLevel level) {
        findSkill(skill.getId()).ifPresentOrElse(
                employeeSkill -> employeeSkill.setLevel(level),
                () -> skills.add(new EmployeeSkill(this, skill, level)));
    }

    /** Returns false when the employee did not have the skill. */
    public boolean removeSkill(UUID skillId) {
        return skills.removeIf(employeeSkill -> employeeSkill.getSkill().getId().equals(skillId));
    }

    /** Removes every skill whose technology is no longer one of the employee's technologies. */
    public void removeSkillsOutsideTechnologies() {
        skills.removeIf(employeeSkill -> !hasTechnology(employeeSkill.getSkill().getTechnology().getId()));
    }

}
