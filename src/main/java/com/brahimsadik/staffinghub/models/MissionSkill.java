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

/** A skill a mission needs. Managed through {@link Mission#getSkills()}. */
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "missions_skills")
public class MissionSkill {

    @Embeddable
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class MissionSkillId implements Serializable {
        @Serial
        private static final long serialVersionUID = -2052326410317592735L;

        @Column(name = "mission_id")
        private UUID missionId;

        @Column(name = "skill_id")
        private UUID skillId;
    }

    @EmbeddedId
    private MissionSkillId id;

    /** Optional and informational only: employees below this level can still be assigned. */
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "required_level")
    private SkillLevel requiredLevel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("missionId")
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private Skill skill;

    public MissionSkill(Mission mission, Skill skill, SkillLevel requiredLevel) {
        this.id = new MissionSkillId(mission.getId(), skill.getId());
        this.mission = mission;
        this.skill = skill;
        this.requiredLevel = requiredLevel;
    }

}
