package com.brahimsadik.staffinghub.exceptions;

/**
 * The request is well-formed but breaks a business rule, or references something that does not exist (e.g. an
 * unknown manager id in the body). Mapped to HTTP 422.
 */
public class BusinessRuleViolationException extends RuntimeException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }

}
