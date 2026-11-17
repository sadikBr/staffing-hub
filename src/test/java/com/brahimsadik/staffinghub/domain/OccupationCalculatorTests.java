package com.brahimsadik.staffinghub.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.brahimsadik.staffinghub.models.MissionAssignment;

class OccupationCalculatorTests {

    private static final LocalDate JAN_1 = LocalDate.of(2026, 1, 1);
    private static final LocalDate JAN_31 = LocalDate.of(2026, 1, 31);

    @Test
    void noAssignmentsMeansZero() {
        assertThat(OccupationCalculator.peakRate(List.of(), JAN_1, JAN_31)).isEqualByComparingTo("0");
    }

    @Test
    void overlappingAssignmentsAddUp() {
        final var peak = OccupationCalculator.peakRate(List.of(
                assignment("2026-01-01", "2026-01-20", "50"),
                assignment("2026-01-15", "2026-02-15", "30")), JAN_1, JAN_31);

        assertThat(peak).isEqualByComparingTo("80");
    }

    @Test
    void consecutiveAssignmentsDoNotAddUp() {
        final var peak = OccupationCalculator.peakRate(List.of(
                assignment("2026-01-01", "2026-01-15", "60"),
                assignment("2026-01-16", "2026-01-31", "70")), JAN_1, JAN_31);

        assertThat(peak).isEqualByComparingTo("70");
    }

    @Test
    void assignmentsOutsideThePeriodAreIgnored() {
        final var peak = OccupationCalculator.peakRate(List.of(
                assignment("2025-12-01", "2025-12-31", "100"),
                assignment("2026-02-01", "2026-02-28", "100")), JAN_1, JAN_31);

        assertThat(peak).isEqualByComparingTo("0");
    }

    @Test
    void ongoingAssignmentsWithoutEndDateLastIndefinitely() {
        final var ongoing = assignment("2025-06-01", null, "40");

        assertThat(OccupationCalculator.peakRate(List.of(ongoing), JAN_1, JAN_31)).isEqualByComparingTo("40");
        assertThat(OccupationCalculator.peakRate(List.of(ongoing), JAN_1, null)).isEqualByComparingTo("40");
    }

    @Test
    void openEndedPeriodIncludesEverythingAfterTheStart() {
        final var peak = OccupationCalculator.peakRate(List.of(
                assignment("2026-01-01", "2026-01-31", "50"),
                assignment("2027-01-01", "2027-01-31", "90")), JAN_1, null);

        assertThat(peak).isEqualByComparingTo("90");
    }

    @Test
    void missingRateCountsAsFullTimeAndMissingStartIsIgnored() {
        assertThat(OccupationCalculator.peakRate(List.of(assignment("2026-01-10", "2026-01-12", null)), JAN_1, JAN_31))
                .isEqualByComparingTo("100");
        assertThat(OccupationCalculator.peakRate(List.of(assignment(null, "2026-01-12", "50")), JAN_1, JAN_31))
                .isEqualByComparingTo("0");
    }

    @Test
    void availabilityNeverGoesBelowZero() {
        assertThat(OccupationCalculator.availability(new BigDecimal("30"))).isEqualByComparingTo("70");
        assertThat(OccupationCalculator.availability(new BigDecimal("130"))).isEqualByComparingTo("0");
    }

    private static MissionAssignment assignment(String start, String end, String rate) {
        final var assignment = new MissionAssignment();
        assignment.setStartDate(start == null ? null : LocalDate.parse(start));
        assignment.setEndDate(end == null ? null : LocalDate.parse(end));
        assignment.setRate(rate == null ? null : new BigDecimal(rate));
        return assignment;
    }

    @Test
    void absencesReduceAvailabilityInProportionOfWorkingDays() {
        assertThat(OccupationCalculator.availability(new BigDecimal("50"), 5, 20)).isEqualByComparingTo("37.5");
        assertThat(OccupationCalculator.availability(new BigDecimal("0"), 0, 20)).isEqualByComparingTo("100");
        assertThat(OccupationCalculator.availability(new BigDecimal("0"), 5, 0)).isEqualByComparingTo("100");
        assertThat(OccupationCalculator.availability(new BigDecimal("0"), 20, 20)).isEqualByComparingTo("0");
    }

}
