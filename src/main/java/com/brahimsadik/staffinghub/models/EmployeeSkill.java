package com.brahimsadik.staffinghub.models;

import java.io.Serializable;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.SkillLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @EqualsAndHashCode
    public static class EmployeeSkillId implements Serializable {
        private static final long serialVersionUID = 3613207323256425655L;

        private UUID employeeId;
        private UUID skillId;
    }

    @EmbeddedId
    private EmployeeSkillId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private SkillLevel level;

    @ManyToOne
    @MapsId("employeeId")
    private Employee employee;

    @ManyToOne
    @MapsId("skillId")
    private Skill skill;

}
