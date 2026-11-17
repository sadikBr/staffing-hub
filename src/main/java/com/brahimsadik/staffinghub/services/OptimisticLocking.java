package com.brahimsadik.staffinghub.services;

import com.brahimsadik.staffinghub.exceptions.ConflictException;

/**
 * Refuses an update made from stale data. The database only detects two updates running at the same instant; this
 * also catches the common case of someone saving a form they opened before another person changed the same record.
 */
final class OptimisticLocking {

    private OptimisticLocking() {
    }

    /** Does nothing when the client did not send a version. */
    static void checkVersion(String resource, Long currentVersion, Long versionRead) {
        if (versionRead != null && !versionRead.equals(currentVersion)) {
            throw new ConflictException(
                    "The %s was changed by someone else since you loaded it (your version: %d, current version: %d). Reload it and try again."
                            .formatted(resource, versionRead, currentVersion));
        }
    }

}
