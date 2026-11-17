import type { components } from './schema';

type Schemas = components['schemas'];

export type AppConfig = Schemas['AppConfigResponse'];

export type Customer = Schemas['CustomerResponse'];
export type CustomerRequest = Schemas['CustomerCreationUpdateRequest'];
export type Role = Schemas['RoleResponse'];
export type RoleRequest = Schemas['RoleCreationUpdateRequest'];
export type Technology = Schemas['TechnologyResponse'];
export type TechnologyWithSkills = Schemas['TechnologyWithSkillsResponse'];
export type TechnologyRequest = Schemas['TechnologyCreationUpdateRequest'];
export type Skill = Schemas['SkillResponse'];
export type SkillRequest = Schemas['SkillCreationUpdateRequest'];

export type Employee = Schemas['EmployeeResponse'];
export type EmployeeSummary = Schemas['EmployeeSummary'];
export type EmployeeRequest = Schemas['EmployeeCreationUpdateRequest'];
export type EmployeeSkill = Schemas['EmployeeSkillResponse'];
export type EmployeePage = Schemas['PagedModelEmployeeResponse'];
export type EmployeeAssignment = Schemas['EmployeeAssignmentResponse'];
export type EmployeeAvailability = Schemas['EmployeeAvailabilityResponse'];
export type AvailabilityPage = Schemas['PagedModelEmployeeAvailabilityResponse'];
export type OverlappingAssignment = Schemas['OverlappingAssignment'];

export type Mission = Schemas['MissionResponse'];
export type MissionSummary = Schemas['MissionSummary'];
export type MissionRequest = Schemas['MissionCreationUpdateRequest'];
export type MissionPage = Schemas['PagedModelMissionResponse'];
export type MissionSkill = Schemas['MissionSkillResponse'];
export type MissionAssignment = Schemas['MissionAssignmentResponse'];
export type MissionAssignmentRequest = Schemas['MissionAssignmentRequest'];
export type RequiredSkillMatch = Schemas['RequiredSkillMatch'];
export type AssignmentOccupation = Schemas['AssignmentOccupation'];

export type Absence = Schemas['AbsenceResponse'];
export type AbsenceRequest = Schemas['AbsenceRequest'];
export type AbsenceSummary = Schemas['AbsenceSummary'];
export type AbsenceType = Absence['type'];

export type MissionNeed = Schemas['MissionNeedResponse'];
export type MissionNeedRequest = Schemas['MissionNeedRequest'];
export type NeedCandidate = Schemas['NeedCandidateResponse'];
export type OpenNeed = Schemas['OpenNeed'];

export type Me = Schemas['MeResponse'];

export type Dashboard = Schemas['DashboardResponse'];
export type EndingAssignment = Schemas['EndingAssignment'];
export type PageMetadata = Schemas['PageMetadata'];

export type Seniority = Employee['seniority'];
export type Community = Employee['community'];
export type SkillLevel = EmployeeSkill['level'];
export type MissionStatus = Mission['status'];
export type BusinessUnit = NonNullable<Mission['businessUnit']>;
