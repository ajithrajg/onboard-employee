import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css']
})
export class EmployeeEditComponent {

  employee:any;
  empId:any;

  constructor(private empService: EmployeeService) {
    this.empId = this.empService.getSelectedEmployee();
    this.empService.getEmployeeById(this.empId).subscribe(
      (employee) => {
        if (employee) {
          // Handle the retrieved employee data (e.g., display in the view)
          this.employee = employee
        } else {
          // Handle case where employee not found (e.g., display an error message)
          console.log('Employee Not Found');
        }
      },
      (error) => {
        // Handle error (e.g., display an error message)
        console.error(error);
      }
    );

  }

}
