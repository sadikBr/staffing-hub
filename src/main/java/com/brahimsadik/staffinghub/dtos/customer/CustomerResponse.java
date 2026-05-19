package com.brahimsadik.staffinghub.dtos.customer;

import java.util.UUID;

import lombok.Data;

@Data
public class CustomerResponse {

    private UUID id;

    private String label;

}
