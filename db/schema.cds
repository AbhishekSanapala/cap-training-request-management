namespace zrk01.training;

using {
  cuid,
  managed,
  Currency,
  sap.common.CodeList
} from '@sap/cds/common';

type RequestStatus : String enum {
  NEW       = 'NEW';
  SUBMITTED = 'SUBMITTED';
  APPROVED  = 'APPROVED';
  REJECTED  = 'REJECTED';
  CANCELLED = 'CANCELLED';
}

entity Employees : managed {
  key ID            : String(20);
      name          : String(100);
      email         : String(100);
      department    : String(50);
      annualBudget  : Decimal(10, 2);
      spentBudget   : Decimal(10, 2);
      currency      : Currency;
      manager       : Association to Employees;
      requests      : Association to many TrainingRequests
                        on requests.employee = $self;
}

entity Courses : managed {
  key ID          : UUID;
      code        : String(20);
      title       : String(100);
      description : String(500);
      cost        : Decimal(10, 2);
      currency    : Currency;
      durationDays: Integer;
      vendor      : String(100);
}

entity TrainingRequests : cuid, managed {
  employee        : Association to Employees;
  course          : Association to Courses;
  startDate       : Date;
  endDate         : Date;
  estimatedCost   : Decimal(10, 2);
  currency        : Currency;
  status          : RequestStatus default 'NEW';
  justification   : String(1000);
  rejectionReason : String(500);
  comments        : Composition of many RequestComments
                      on comments.parent = $self;
  virtual daysUntilStart : Integer;
}

entity RequestComments : cuid, managed {
  parent          : Association to TrainingRequests;
  author          : String(100);
  commentText     : String(1000);
}