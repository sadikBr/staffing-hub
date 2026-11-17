package com.brahimsadik.staffinghub.exceptions;

import java.util.UUID;

/** The resource identified in the request path does not exist. Mapped to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, UUID id) {
        super("No %s exists with the id %s".formatted(resource, id));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }

}
