package com.brahimsadik.staffinghub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest(properties = SecurityTestConfiguration.TEST_ISSUER_PROPERTY)
@Import(TestcontainersConfiguration.class)
class StaffingHubApplicationTests {

    @Test
    void contextLoads() {
    }

}
