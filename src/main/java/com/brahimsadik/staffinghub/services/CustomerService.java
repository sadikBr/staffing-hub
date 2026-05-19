package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.brahimsadik.staffinghub.dtos.customer.CustomerCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.mappers.CustomerMapper;
import com.brahimsadik.staffinghub.models.Customer;
import com.brahimsadik.staffinghub.repositories.CustomerRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerResponse create(CustomerCreationUpdateRequest request) {
        try {
            final var customer = customerMapper.toCustomer(request);

            final var persistedCustomer = customerRepository.save(customer);

            return customerMapper.toCustomerResponse(persistedCustomer);
        } catch (final DataIntegrityViolationException e) {
            throw new RuntimeException(String.format("Customer with label {%s} already exists", request.getLabel()));
        }
    }

    public List<CustomerResponse> findAllCustomers() {
        final var allCustomers = (List<Customer>) customerRepository.findAll();
        return allCustomers.stream().map(customer -> customerMapper.toCustomerResponse(customer)).toList();
    }

    public CustomerResponse findCustomerById(UUID id) {
        final var customer = customerRepository.findById(id).orElse(null);
        if (customer == null) {
            throw new RuntimeException("No customer exists with the id: " + id);
        }

        return customerMapper.toCustomerResponse(customer);
    }

    public CustomerResponse updateCustomerById(UUID id, CustomerCreationUpdateRequest request) {
        final var customer = customerRepository.findById(id).orElse(null);
        if (customer == null) {
            throw new RuntimeException("No customer exists with the id: " + id);
        }

        customer.setLabel(request.getLabel());
        final var persistedCustomer = customerRepository.save(customer);

        return customerMapper.toCustomerResponse(persistedCustomer);
    }

    public void delete(UUID id) {
        final var customer = customerRepository.findById(id).orElse(null);
        if (customer == null) {
            throw new RuntimeException("No customer exists with the id: " + id);
        }

        customerRepository.delete(customer);
    }

}
