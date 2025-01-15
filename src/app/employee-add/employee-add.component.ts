import { Component } from '@angular/core';
import {formatDate} from '@angular/common';
import { EmployeeService } from '../employee.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { style, transition, trigger, animate  } from '@angular/animations';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']

})
export class EmployeeAddComponent  {
  employeeForm!: FormGroup;
  showModal = false;
  roleName!:string;
  showDateModal = false;
  showEndDateModal = false;
  date!: string;
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  currentEndMonth: number = new Date().getMonth();
  currentEndYear: number = new Date().getFullYear();
  selectedDate: Date = new Date();
  selectedEndDate!: any;
  confirmSelectedDate: Date = new Date();
  confirmSelectedEndDate!: any;
  selectedButton: string = 'today';
  selectedEndButton: string = 'no-date';
  todaysdate:string = formatDate(new Date(), 'yyyy-MM-dd', 'en').toString();
  employee:any;
  empId:any;
  alertMessage: string = '';
  showAlert: boolean = false;
  weeks: Date[][] = [];
  endWeeks: Date[][] = [];
  confirmDelete:boolean = false;
  undoClicked: boolean = false;

  constructor(private employeeService: EmployeeService, private fb: FormBuilder,private router: Router
    ,private empService: EmployeeService, private route: ActivatedRoute) {
    this.employeeForm = this.fb.group({
      employeeName: ['', Validators.required] 
    });
  }

  get employeeName() {
    return this.employeeForm.get('employeeName')?.value;
  }


  ngAfterViewInit() {
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  onCloseModal() {
      this.showModal = false; 
      this.showDateModal = false;
      this.showEndDateModal = false;
  }

  selectRole(role: string) {
   this.roleName = role;
   this.showModal = false; 
  }

  toggleDateModal() {
    this.showDateModal = !this.showDateModal;
  }

  toogleEndDateModal() {
    this.showEndDateModal = !this.showEndDateModal;
    this.generateEndCalendar();
  }

  saveDate() {
   this.date = this.selectedDate.toDateString();
   this.confirmSelectedDate = this.selectedDate;
   this.showDateModal = false; 
  }

  saveEndDate() {
    this.showEndDateModal = false; 
    this.confirmSelectedEndDate = this.selectedEndDate;
  }

  jumpToDate(date?: Date) {
    if(!date) {
      date = new Date();
      this.selectedButton = 'today';
    }
    this.currentMonth = date.getMonth();
    this.currentYear = date.getFullYear();
    this.selectedDate = new Date(date);
    console.log('selected date: '+ this.selectedDate);
    this.generateCalendar();
  }
  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    let currentDay = 1;
    const weeks: Date[][] = [];

    // Create an array of weeks, each containing 7 days
    for (let i = 0; i < 6; i++) { 
      const week: any[] = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null); // Add empty cells before the first day of the month
        } else if (currentDay <= daysInMonth) {
          week.push(new Date(this.currentYear, this.currentMonth, currentDay));
          currentDay++;
        } else {
          week.push(null); // Add empty cells after the last day of the month
        }
      }
      weeks.push(week);
    }

    this.weeks = weeks;

  }

  isToday(date: Date | null): boolean {
    if (!date) {
      return false;
    }
    return date.toDateString() === new Date().toDateString();
  }

  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) {
      return false;
    }
    return date.toDateString() === this.selectedDate.toDateString();
  }

  isEndSelected(date: Date | null): boolean {
    if (!date || !this.selectedEndDate) {
      return false;
    }
    return date.toDateString() === this.selectedEndDate.toDateString();
  }

  isDisabled(date: Date | null): boolean {
    if (!date || !this.selectedDate) {
      return false;
    }
    const dateString = date.toISOString().slice(0, 10); 
    const selectedDateString = this.selectedDate.toISOString().slice(0, 10);
  
    return dateString < selectedDateString && dateString != selectedDateString; 
  
  }


  onDateClick(date: Date | null) {
    if (date) {
      this.selectedDate = date;
      // Handle date selection (e.g., display details)
    }
  }
  onEndDateClick(date:Date | null) {
    if(date) {
      this.selectedEndDate = date;
    }
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }


  jumpToNextMonday() {
    const today = new Date();
    const daysUntilMonday = (1 - today.getDay() + 7) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((daysUntilMonday == 0) ? 7 : daysUntilMonday));
    this.jumpToDate(nextMonday);
    this.selectedButton = 'next-monday';
  }

  jumpToNextTuesday() {
    const today = new Date();
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + ((daysUntilTuesday == 0) ? 7 : daysUntilTuesday));
    this.jumpToDate(nextTuesday);
    this.selectedButton = 'next-tuesday';
  }

  jumpToAfterWeek() {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    this.jumpToDate(today);
    this.selectedButton = 'after-week';
  }

  generateEndCalendar() {

    const firstDayOfMonth = new Date(this.currentEndYear, this.currentEndMonth, 1).getDay();
    const daysInMonth = new Date(this.currentEndYear, this.currentEndMonth + 1, 0).getDate();

    let currentDay = 1;
    const weeks: Date[][] = [];

    // Create an array of weeks, each containing 7 days
    for (let i = 0; i < 6; i++) { 
      const week: any[] = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null); // Add empty cells before the first day of the month
        } else if (currentDay <= daysInMonth) {
          week.push(new Date(this.currentEndYear, this.currentEndMonth, currentDay));
          currentDay++;
        } else {
          week.push(null); // Add empty cells after the last day of the month
        }
      }
      weeks.push(week);
    }

    this.endWeeks = weeks;

}

  prevMonthEnd() {
    this.currentEndMonth--;
    if (this.currentEndMonth < 0) {
      this.currentEndMonth = 11;
      this.currentEndYear--;
    }
    this.generateEndCalendar();
  }

  nextMonthEnd() {
    this.currentEndMonth++;
    if (this.currentEndMonth > 11) {
      this.currentEndMonth = 0;
      this.currentEndYear++;
    }
    this.generateEndCalendar();
  }

  jumpToEndDate() {
     let date = new Date();
      this.selectedEndButton = 'today';
    this.currentEndMonth = date.getMonth();
    this.currentEndYear = date.getFullYear();
    this.selectedEndDate = new Date(date);
    this.generateEndCalendar();
  }

  jumpToNoEndDate() {
    this.selectedEndButton = 'no-date';
    this.selectedEndDate = null;
  }

  ngOnInit() {
    //this.generateEndCalendar();
    console.log(this.empService.getSelectedEmployee());
    this.route.queryParams.subscribe(params => {
      this.empId = params['id'] ? params['id'] : null; 
      // Use this.employeeId to fetch employee data from your service 
      if(this.empId) {
        this.empId = this.empService.getSelectedEmployee();
        
        this.empService.getEmployeeById(this.empId).subscribe(
          (employee) => {
            if (employee) {
              // Handle the retrieved employee data (e.g., display in the view)
              this.employee = employee;
              this.employeeForm.get('employeeName')?.setValue(this.employee.name);
              this.roleName = this.employee.role;
              this.confirmSelectedDate = this.employee.startDate;
              this.confirmSelectedEndDate = this.employee.endDate != 'no-date' ? this.employee.endDate : null;
              this.selectedDate = this.confirmSelectedDate;
              this.selectedEndDate = this.confirmSelectedEndDate;
              this.generateCalendar();
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
      else this.generateCalendar();
    });
    
  }

  saveEmployeeDetails() {
    const firstChar = this.employeeName.charAt(0); 
    const now = new Date(); 
    const year = now.getFullYear().toString().substr(-2); 
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const day = now.getDate().toString().padStart(2, '0'); 
    const hours = now.getHours().toString().padStart(2, '0'); 
    const minutes = now.getMinutes().toString().padStart(2, '0'); 
    const seconds = now.getSeconds().toString().padStart(2, '0'); 
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); 

    const generatedId = firstChar + year + month + day + hours + minutes + seconds + milliseconds.substr(0, 3); 

      // Get employee data from your form (e.g., employeeName, role, startDate, endDate)
      const employee = { 
        name: this.employeeName, 
        role: this.roleName, 
        startDate: this.confirmSelectedDate, 
        endDate: this.confirmSelectedEndDate || 'no-date',
        id: this.empId || generatedId
      };
      
    if(this.empId) {
      this.employeeService.updateEmployee(employee).subscribe(
        (updated) => {
          if (updated) {
            // Handle successful update (e.g., show success message)
            console.log('Employee updated successfully:');
            this.showAlertMessage('Employee updated successfully!');

          } else {
            // Handle update error (e.g., show error message)
            console.error('Error updating employee.');
          }
        }
      );
  
    }
    else {
      this.employeeService.saveEmployee(employee).subscribe(
        (result:any) => {
          console.log('Employee saved successfully:', result);
          // Handle success (e.g., show success message, clear form)
          this.showAlertMessage('Employee data created successfully!');

        },
        (error:any) => {
          console.error('Error saving employee:', error);
          // Handle error (e.g., show error message)
        }
      );
    }
  
  }

  deleteEmployee(employeeId: number, event:any) {
    this.alertMessage = 'Employee deleted successfully';
    this.showAlert = true;

    // Hide the alert after 3 seconds
    setTimeout(() => {
      this.showAlert = false;
      if(this.confirmDelete || !this.undoClicked) {
        this.employeeService.deleteEmployee(employeeId)
        .subscribe(isDeleted => {
          if (isDeleted) {
            console.log('Employee data has been deleted!');
            this.router.navigate(['/employees']);
            // Update your employee list in the component
          } else {
            console.error('Error deleting employee');
          }
        });
      }
    }, 2000);
    
    event.stopPropagation();
  }

  showAlertMessage(message: string, empId?:any) {
    this.alertMessage = message;
    this.showAlert = true;

    // Hide the alert after 3 seconds
    setTimeout(() => {
      this.showAlert = false;
      this.router.navigate(['/employees']);
    }, 2000);
  }

  undo() {
    this.confirmDelete = false;
    this.undoClicked = true;
    this.showAlert = false;
  }


  goBack() {
    this.router.navigate(['/employees']); 
  }

}
