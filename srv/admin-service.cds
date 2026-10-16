using { zrk01.training as my } from '../db/schema';

service AdminService @(path: '/admin') @(requires: 'AdminRole') {
  entity Employees as projection on my.Employees;
  entity Courses as projection on my.Courses;
  entity TrainingRequests as projection on my.TrainingRequests;
  entity RequestComments as projection on my.RequestComments;
}