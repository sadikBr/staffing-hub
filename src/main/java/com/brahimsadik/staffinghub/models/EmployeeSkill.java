package com.brahimsadik.staffinghub.models;

import com.brahimsadik.staffinghub.enums.SkillLevel;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

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
