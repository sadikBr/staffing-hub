package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.dtos.customer.CustomerCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.models.Customer;

@Mapper(config = CentralMapperConfig.class)
public interface CustomerMapper {

    CustomerResponse toCustomerResponse(Customer customer);

    Customer toCustomer(CustomerCreationUpdateRequest request);

    void updateCustomer(CustomerCreationUpdateRequest request, @MappingTarget Customer customer);

}
