using { zrk01.training as my } from '../db/schema';

service ManagerService @(path: '/manager') @(requires: ['ManagerRole', 'AdminRole']) {
  @readonly
  entity PendingRequests as projection on my.TrainingRequests {
    *,
    employee.name as employeeName : String,
    employee.department as department : String,
    course.title as courseTitle : String
  } where status = 'SUBMITTED';

  action approveRequest(requestID: UUID) returns Boolean;
  action rejectRequest(requestID: UUID, reason: String) returns Boolean;
  function getPendingCount() returns Integer;
}