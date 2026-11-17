package com.brahimsadik.staffinghub.dtos.availability;

/** A situation to look for over the period. */
public enum AvailabilitySituation {
    /** No mission at all during the period. */
    ON_BENCH,
    /** Above 100% on at least one day. */
    OVERBOOKED,
    /** Away (holiday, sick leave, training...) at least one working day. */
    AWAY
}
