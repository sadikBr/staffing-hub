package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.dtos.customer.CustomerCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.models.Customer;

@Mapper(config = CentralMapperConfig.class)
public interface CustomerMapper {

    CustomerResponse toCustomerResponse(Customer customer);

    @Mapping(target = "version", ignore = true)
    Customer toCustomer(CustomerCreationUpdateRequest request);

    @Mapping(target = "version", ignore = true)
    void updateCustomer(CustomerCreationUpdateRequest request, @MappingTarget Customer customer);

}
