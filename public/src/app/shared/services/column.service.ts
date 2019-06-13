import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class ColumnService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) {
    //this.initCalendarClient();
   }

   // init columns
   initColumns(groupId){
       const group = {
           groupId: groupId
       };
       return this._http.post(this.BASE_API_URL + `/columns/init/`, group);
   }

   // get all columns 
   getAllColumns(groupId){
        return this._http.get(this.BASE_API_URL + `/columns/all/${groupId}`);
   }

   // get one column

   // add column
   addColumn(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.post(this.BASE_API_URL + `/columns/add`, group);
   }

   // edit column name
   editColumnName(groupId, oldColumnName, newColumnName){
       const group = {
            groupId: groupId,
            oldColumnName: oldColumnName,
            newColumnName: newColumnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/name`, group);
   }

   // edit column number 
   editColumnNumber(groupId, columnName, numberOfTasks){
        const group = {
            groupId: groupId,
            columnName: columnName,
            numberOfTasks: numberOfTasks
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/number`, group);
   }

   // add task to column
   addColumnTask(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/inc`, group);
   }

   // remove task from column
   deleteColumnTask(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/dec`, group);
   }

   // delete column
   deleteColumn(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/delete`, group);
   }

}
