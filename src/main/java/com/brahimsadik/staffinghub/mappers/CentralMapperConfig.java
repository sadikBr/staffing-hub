package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.MapperConfig;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

/**
 * Shared settings for every mapper. Unmapped targets are ignored because request DTOs never carry ids, timestamps or
 * associations: services set those explicitly.
 */
@MapperConfig(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CentralMapperConfig {
}
