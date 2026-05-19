package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.brahimsadik.staffinghub.models.Customer;

public interface CustomerRepository extends CrudRepository<Customer, UUID> {

}
