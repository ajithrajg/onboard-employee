import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterEmployees'
})
export class FilterEmployeesPipe implements PipeTransform {

  transform(employees: any[], today: Date, showPrevious: boolean): any[] {
    if (!employees) {
      return [];
    }

    const currentEmployees = employees.filter(employee => this.isCurrentEmployee(employee, today));
    const previousEmployees = employees.filter(employee => this.isPreviousEmployee(employee, today));
    if(showPrevious) return previousEmployees;
    else return currentEmployees;
  }

  private isCurrentEmployee(employee: any, today: Date): boolean {
    return employee.endDate === 'no-date' || new Date(employee.endDate) >= today;
  }

  private isPreviousEmployee(employee: any, today: Date): boolean {
    return employee.endDate !== 'no-date' && new Date(employee.endDate) < today;
  }


}
