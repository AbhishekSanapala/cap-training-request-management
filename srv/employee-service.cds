using { zrk01.training as my } from '../db/schema';

service EmployeeService @(path: '/employee') @(requires: ['EmployeeRole', 'AdminRole']) {
  @odata.draft.enabled
  entity TrainingRequests as projection on my.TrainingRequests {
    *,
    course.title as courseTitle : String,
    employee.name as employeeName : String
  } where createdBy = $user;

  @readonly
  entity Courses as projection on my.Courses;
}

// Fiori UI Annotations for Employee Service
annotate EmployeeService.TrainingRequests with @(
  UI.HeaderInfo: {
    TypeName: 'Training Request',
    TypeNamePlural: 'Training Requests',
    Title: { $Type: 'UI.DataField', Value: ID },
    Description: { $Type: 'UI.DataField', Value: status }
  },
  UI.SelectionFields: [ status, startDate, course_ID ],
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: ID },
    { $Type: 'UI.DataField', Value: courseTitle, Label: 'Course' },
    { $Type: 'UI.DataField', Value: startDate },
    { $Type: 'UI.DataField', Value: endDate },
    { $Type: 'UI.DataField', Value: estimatedCost },
    { $Type: 'UI.DataField', Value: currency_code },
    { 
      $Type: 'UI.DataField', 
      Value: status, 
      Criticality: #Information 
    },
    { $Type: 'UI.DataField', Value: daysUntilStart, Label: 'Days Until Start' }
  ],
  UI.Facets: [
    {
      $Type: 'UI.ReferenceFacet',
      Label: 'General Information',
      Target: '@UI.FieldGroup#General'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Label: 'Comments',
      Target: 'comments/@UI.LineItem'
    }
  ],
  UI.FieldGroup #General: {
    Data: [
      { $Type: 'UI.DataField', Value: employee_ID, Label: 'Employee ID' },
      { $Type: 'UI.DataField', Value: course_ID, Label: 'Course' },
      { $Type: 'UI.DataField', Value: startDate },
      { $Type: 'UI.DataField', Value: endDate },
      { $Type: 'UI.DataField', Value: estimatedCost },
      { $Type: 'UI.DataField', Value: currency_code },
      { $Type: 'UI.DataField', Value: justification },
      { $Type: 'UI.DataField', Value: rejectionReason }
    ]
  }
);

annotate EmployeeService.TrainingRequests with {
  course @(
    Common.ValueList: {
      CollectionPath: 'Courses',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: course_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'title' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'cost' }
      ]
    }
  );
};

annotate EmployeeService.RequestComments with @(
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: createdAt, Label: 'Date' },
    { $Type: 'UI.DataField', Value: author, Label: 'Author' },
    { $Type: 'UI.DataField', Value: commentText, Label: 'Comment' }
  ]
);