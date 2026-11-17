package com.brahimsadik.staffinghub.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.brahimsadik.staffinghub.dtos.absence.AbsenceRequest;
import com.brahimsadik.staffinghub.dtos.absence.AbsenceResponse;
import com.brahimsadik.staffinghub.services.AbsenceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Absences", description = "Time employees are away: holidays, sick leave, training. Absences reduce availability.")
@RequiredArgsConstructor
@RequestMapping("/employees/{employeeId}/absences")
public class AbsenceController {

    private final AbsenceService absenceService;

    @GetMapping
    @Operation(summary = "List an employee's absences, most recent first")
    public List<AbsenceResponse> findAbsences(@PathVariable UUID employeeId) {
        return absenceService.findAbsences(employeeId);
    }

    @PostMapping
    @Operation(summary = "Record an absence (refused if it overlaps another one of the same employee)")
    public ResponseEntity<AbsenceResponse> create(@PathVariable UUID employeeId,
            @Validated @RequestBody AbsenceRequest request, UriComponentsBuilder uriBuilder) {
        final var response = absenceService.create(employeeId, request);
        final var location = uriBuilder.path("/api/employees/{employeeId}/absences/{id}")
                .buildAndExpand(employeeId, response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{absenceId}")
    @Operation(summary = "Replace an absence's details")
    public AbsenceResponse update(@PathVariable UUID employeeId, @PathVariable UUID absenceId,
            @Validated @RequestBody AbsenceRequest request) {
        return absenceService.update(employeeId, absenceId, request);
    }

    @DeleteMapping("/{absenceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an absence")
    public void delete(@PathVariable UUID employeeId, @PathVariable UUID absenceId) {
        absenceService.delete(employeeId, absenceId);
    }

}
