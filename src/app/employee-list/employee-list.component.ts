import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent {
  employeeList:any[] | undefined;
  showDeleteIcon: number | null = null; // Track currently swiped employee ID
  swipeCoord!: [number, number];
  swipeTime!: number;
  today: Date = new Date(); 
  showOptions!: boolean;
  alertMessage: string = '';
  showAlert: boolean = false;
  confirmDelete:boolean = false;
  undoClicked: boolean = false;

  constructor(private employeeService: EmployeeService, private router: Router) {
    this.getAllEmployees();
  }

  ngOnInit() {
  }

  getAllEmployees() {
    this.employeeService.getAllEmployees()
      .subscribe(employees => {
        console.log('Employees:', employees);
        this.employeeList = employees;
        // Use the retrieved employees for display or further processing
      });
  }
  onPanLeft(empId:any) {
    console.log('Swiped Left!');
    this.showOptions = true;
  }

  onPanRight(empId:any) {
    console.log('Swiped Right!');
    this.showOptions = true;
  }

  onPanEnd(employeeId: number, event: any) {
    const deltaX = event.deltaX || 0; // Handle potential undefined deltaX
    if (Math.abs(deltaX) < 5) {
      // Minimal swipe (deltaX close to zero) and icon is visible
      this.showOptions = true;
    }
    this.showDeleteIcon = employeeId;
  }
  
  close(empId:any, event:any) {
    this.showDeleteIcon = null;
    event.stopPropagation();
  }

  deleteEmployee(employeeId: number, event:any) {
    this.showAlertMessage('Employee deleted successfully', employeeId);
    event.stopPropagation();

  }
  
  manageEmployee(employeeId: number, event:any) {
    if (this.isClick(event)) {
      this.employeeService.setSelectedEmployee(employeeId);
      this.router.navigate(['/employees/add'], { 
        queryParams: { id: employeeId } 
      });
    }
    
  }

  isClick(event: any) {
    // Check for the presence of certain properties/attributes in the event object
    // that indicate a click event and absence of properties indicating a swipe.
    // Here are some common checks you can use:
    return !event.deltaX && !event.deltaY; // No swipe movement
    // You can add more checks based on your specific requirements,
    // like checking for touch phase (event.changedTouches[0].phase === 'end')
    // or presence of mouse events (event.buttons !== undefined).
  }
  
  showAlertMessage(message: string, empId:any) {
    this.alertMessage = message;
    this.showAlert = true;

    // Hide the alert after 3 seconds
    setTimeout(() => {
      this.showAlert = false;
      if(this.confirmDelete || !this.undoClicked) {
        this.employeeService.deleteEmployee(empId)
        .subscribe(isDeleted => {
          if (isDeleted) {
            console.log('Employee data has been deleted!');
            this.getAllEmployees();
            // Update your employee list in the component
          } else {
            console.error('Error deleting employee');
          }
        });
      }
    }, 2000);
  }

  undo() {
    this.confirmDelete = false;
    this.undoClicked = true;
    this.showAlert = false;
    this.showDeleteIcon = null;
  }

  addEmp() {
    this.router.navigate(['employees/add']);
  }
}
