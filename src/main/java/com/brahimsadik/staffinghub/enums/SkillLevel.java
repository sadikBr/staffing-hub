package com.brahimsadik.staffinghub.enums;

/** Declared from lowest to highest: the order is used to compare levels. */
public enum SkillLevel {
    NOVICE, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT;

    public boolean isAtLeast(SkillLevel other) {
        return compareTo(other) >= 0;
    }
}
