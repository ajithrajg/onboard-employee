import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, catchError, from, map, mergeMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class EmployeeService {

  selectedEmployee: WritableSignal<any> = signal<any>(''); 

  setSelectedEmployee(employee: any) {
    this.selectedEmployee.set(employee);
  }

  getSelectedEmployee():any {
    return this.selectedEmployee();
  }

  constructor() { }

  saveEmployee(employee: any): Observable<any> {
    return from(this.connectToIndexedDB('employeeDB')) 
      .pipe(
        mergeMap(db => {
          const transaction = db.transaction('employees', 'readwrite');
          const objectStore = transaction.objectStore('employees');
          return from(new Promise<number>((resolve, reject) => { 
            const request = objectStore.add(employee); 
            //@ts-ignore
            request.onsuccess = (event) => resolve(event.target.result); 
            //@ts-ignore
            request.onerror = (event) => reject(event.target.error); 
          })); 
        }),
        catchError(error => {
          console.error('Error saving employee:', error);
          return of(null); // Or handle the error differently
        })
      );
  }

  updateEmployee(employee: any): Observable<boolean> {
    return from(this.connectToIndexedDB('employeeDB'))
      .pipe(
        mergeMap(db => {
          const transaction = db.transaction('employees', 'readwrite');
          const objectStore = transaction.objectStore('employees');
          return from(new Promise<boolean>((resolve, reject) => {
            const request = objectStore.put(employee);
            // @ts-ignore
            request.onsuccess = () => resolve(true);
            // @ts-ignore
            request.onerror = (event) => reject(event.target.error);
          }));
        }),
        map(() => true), // Emit true on successful update
        catchError(error => {
          console.error('Error updating employee:', error);
          return of(false); // Emit false on error
        })
      );
  }


  getAllEmployees(): Observable<any[]> {
    return from(this.connectToIndexedDB('employeeDB'))
      .pipe(
        mergeMap(db => {
          const transaction = db.transaction('employees', 'readonly');
          const objectStore = transaction.objectStore('employees');
          return from(new Promise<any>((resolve, reject) => {
            const request = objectStore.getAll();
              //@ts-ignore
              request.onsuccess = (event) => resolve(event.target.result); 
              //@ts-ignore
              request.onerror = (event) => reject(event.target.error);             
          }));
        }),
        map(employees => employees as any[]), // Type cast to any[] if needed
        catchError(error => {
          console.error('Error retrieving employees:', error);
          return of([]); // Or return an empty array or handle the error differently
        })
      );
  }

  getEmployeeById(id: number): Observable<any> {
    return from(this.connectToIndexedDB('employeeDB'))
      .pipe(
        mergeMap(db => {
          const transaction = db.transaction('employees', 'readonly');
          const objectStore = transaction.objectStore('employees');
          return from(new Promise<any>((resolve, reject) => {
            const request = objectStore.get(id);
              //@ts-ignore
              request.onsuccess = (event) => resolve(event.target.result); 
              //@ts-ignore
              request.onerror = (event) => reject(event.target.error);             
          })); 
        }),
        map(employee => employee || null), // Handle case where employee with given ID doesn't exist
        catchError(error => {
          console.error('Error getting employee:', error);
          return of(null); 
        })
      );
  }


  deleteEmployee(employeeId: number): Observable<boolean> {
    return from(this.connectToIndexedDB('employeeDB'))
      .pipe(
        mergeMap(db => {
          const transaction = db.transaction('employees', 'readwrite');
          const objectStore = transaction.objectStore('employees');
          return from(new Promise<boolean>((resolve, reject) => {
            const request = objectStore.delete(employeeId);
            // @ts-ignore
            request.onsuccess = () => resolve(true);
            // @ts-ignore
            request.onerror = (event) => reject(event.target.error);
          }));
        }),
        map(() => true), // Emit true on successful deletion
        catchError(error => {
          console.error('Error deleting employee:', error);
          return of(false); // Emit false on error
        })
      );
  }


  private connectToIndexedDB(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      const indexedDB =    window.indexedDB || window.mozIndexedDB ||window.webkitIndexedDB || window.msIndexedDB ||  window.shimIndexedDB;

      if (!indexedDB) {
        console.log("IndexedDB could not be found in this browser.");
      }

      // 2

      const request = indexedDB.open(dbName, 1); 

      request.onupgradeneeded = (event) => {
        //@ts-ignore
        const db = event.target.result;

        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id', autoIncrement: true }); 
        }
      };

      request.onsuccess = (event) => {
        //@ts-ignore
        resolve(event.target.result); 
      };

      request.onerror = (event) => {
        //@ts-ignore
        reject('Error opening database:', event.target.error);
      };
    });
  }
}