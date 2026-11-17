package com.brahimsadik.staffinghub.exceptions;

/** The request conflicts with the current state of the data (e.g. a duplicate label). Mapped to HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

}
