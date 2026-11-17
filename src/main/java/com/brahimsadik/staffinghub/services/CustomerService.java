package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.customer.CustomerCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.exceptions.ConflictException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.CustomerMapper;
import com.brahimsadik.staffinghub.models.Customer;
import com.brahimsadik.staffinghub.repositories.CustomerRepository;
import com.brahimsadik.staffinghub.repositories.MissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final MissionRepository missionRepository;

    public CustomerResponse create(CustomerCreationUpdateRequest request) {
        if (customerRepository.existsByLabel(request.label())) {
            throw duplicateLabel(request.label());
        }

        final var customer = customerRepository.save(customerMapper.toCustomer(request));
        return customerMapper.toCustomerResponse(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAllCustomers() {
        return customerRepository.findAll(Sort.by("label")).stream().map(customerMapper::toCustomerResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findCustomerById(UUID id) {
        return customerMapper.toCustomerResponse(getCustomer(id));
    }

    public CustomerResponse updateCustomerById(UUID id, CustomerCreationUpdateRequest request) {
        final var customer = getCustomer(id);
        if (customerRepository.existsByLabelAndIdNot(request.label(), id)) {
            throw duplicateLabel(request.label());
        }

        OptimisticLocking.checkVersion("customer", customer.getVersion(), request.version());
        customerMapper.updateCustomer(request, customer);
        return customerMapper.toCustomerResponse(customerRepository.saveAndFlush(customer));
    }

    /** A customer with missions cannot be deleted. */
    public void delete(UUID id) {
        final var customer = getCustomer(id);
        if (missionRepository.existsByCustomerId(id)) {
            throw new ConflictException("The customer has missions: delete them before deleting the customer");
        }
        customerRepository.delete(customer);
    }

    private Customer getCustomer(UUID id) {
        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("customer", id));
    }

    private static ConflictException duplicateLabel(String label) {
        return new ConflictException("A customer with the label '%s' already exists".formatted(label));
    }

}
