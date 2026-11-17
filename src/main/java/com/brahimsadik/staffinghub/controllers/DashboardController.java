package com.brahimsadik.staffinghub.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brahimsadik.staffinghub.dtos.dashboard.DashboardResponse;
import com.brahimsadik.staffinghub.services.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Dashboard", description = "The staffing situation at a glance.")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    @Operation(summary = "Key figures for the next 30 days: availability, overbooking, missions, assignments ending")
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }

}
