package com.brahimsadik.staffinghub.models;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.SkillLevel;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@AllArgsConstructor
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
    @Column(name = "level")
    private SkillLevel level;

    @ManyToOne
    @MapsId("employeeId")
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private Skill skill;

}
