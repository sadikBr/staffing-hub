package com.brahimsadik.staffinghub.repositories;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeSearchCriteria;
import com.brahimsadik.staffinghub.enums.SkillLevel;
import com.brahimsadik.staffinghub.models.Employee;

import jakarta.persistence.criteria.Predicate;

/** Builds the database query for {@link EmployeeSearchCriteria}. */
public final class EmployeeSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private EmployeeSpecifications() {
    }

    public static Specification<Employee> matching(EmployeeSearchCriteria criteria, LocalDate today) {
        return matching(criteria, today, null);
    }

    /**
     * @param team with {@link EmployeeSearchCriteria#wholeTeam()}: everyone under the manager, at any depth (see
     *             {@link EmployeeRepository#findTeamIds}). Ignored otherwise.
     */
    public static Specification<Employee> matching(EmployeeSearchCriteria criteria, LocalDate today,
            Collection<UUID> team) {
        return (root, query, cb) -> {
            final var predicates = new ArrayList<Predicate>();

            if (criteria.search() != null && !criteria.search().isBlank()) {
                final var pattern = "%" + escapeLike(criteria.search().trim().toLowerCase(Locale.ROOT)) + "%";
                final var firstLast = cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName")));
                final var lastFirst = cb.lower(cb.concat(cb.concat(root.get("lastName"), " "), root.get("firstName")));
                predicates.add(cb.or(cb.like(firstLast, pattern, LIKE_ESCAPE), cb.like(lastFirst, pattern, LIKE_ESCAPE)));
            }
            if (criteria.seniority() != null) {
                predicates.add(cb.equal(root.get("seniority"), criteria.seniority()));
            }
            if (criteria.community() != null) {
                predicates.add(cb.equal(root.get("community"), criteria.community()));
            }
            if (criteria.wholeTeam() && team != null) {
                predicates.add(team.isEmpty() ? cb.disjunction() : root.get("id").in(team));
            } else if (criteria.managerId() != null) {
                predicates.add(cb.equal(root.get("manager").get("id"), criteria.managerId()));
            }
            // Each join below is restricted to a single id, so it never duplicates an employee.
            if (criteria.roleId() != null) {
                predicates.add(cb.equal(root.join("roles").get("id"), criteria.roleId()));
            }
            if (criteria.technologyId() != null) {
                predicates.add(cb.equal(root.join("technologies").get("id"), criteria.technologyId()));
            }
            if (criteria.skillId() != null) {
                final var skill = root.join("skills");
                predicates.add(cb.equal(skill.get("skill").get("id"), criteria.skillId()));
                if (criteria.minSkillLevel() != null) {
                    predicates.add(skill.get("level").in(Arrays.stream(SkillLevel.values())
                            .filter(level -> level.isAtLeast(criteria.minSkillLevel())).toList()));
                }
            }
            if (!criteria.includeFormerEmployees()) {
                predicates.add(cb.or(cb.isNull(root.get("departureDate")),
                        cb.greaterThan(root.get("departureDate"), today)));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

}
