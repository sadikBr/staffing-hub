package com.brahimsadik.staffinghub.models;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.brahimsadik.staffinghub.enums.SkillLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** The level of expertise an employee has in a given skill. Managed through {@link Employee#getSkills()}. */
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "employees_skills")
public class EmployeeSkill {

    @Embeddable
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class EmployeeSkillId implements Serializable {
        @Serial
        private static final long serialVersionUID = 3613207323256425655L;

        @Column(name = "employee_id")
        private UUID employeeId;

        @Column(name = "skill_id")
        private UUID skillId;
    }

    @EmbeddedId
    private EmployeeSkillId id;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private SkillLevel level;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("employeeId")
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private Skill skill;

    public EmployeeSkill(Employee employee, Skill skill, SkillLevel level) {
        this.id = new EmployeeSkillId(employee.getId(), skill.getId());
        this.employee = employee;
        this.skill = skill;
        this.level = level;
    }

}
