import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { Subject } from 'rxjs/Subject';
import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

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
   @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
   })
   getAllColumns(groupId){
        return this._http.get(this.BASE_API_URL + `/columns/all/${groupId}`);
   }

   // get one column
   @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
   })
   getOneColumn(groupId, columnName){
    return this._http.get(this.BASE_API_URL + `/column/${groupId}/${columnName}`);
   }

   // add column
   @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
   addColumn(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.post(this.BASE_API_URL + `/columns/add`, group);
   }

   // edit column name
   @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
   editColumnName(groupId, oldColumnName, newColumnName){
       const group = {
            groupId: groupId,
            oldColumnName: oldColumnName,
            newColumnName: newColumnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/name`, group);
   }

   // edit column number 
   @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
   editColumnNumber(groupId, columnName, numberOfTasks){
        const group = {
            groupId: groupId,
            columnName: columnName,
            numberOfTasks: numberOfTasks
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/number`, group);
   }

   // add task to column
   @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
   addColumnTask(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/inc`, group);
   }

   // remove task from column
   @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
   deleteColumnTask(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/edit/dec`, group);
   }

   // delete column
   @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
   deleteColumn(groupId, columnName){
        const group = {
            groupId: groupId,
            columnName: columnName
        };
        return this._http.put(this.BASE_API_URL + `/columns/delete`, group);
   }

}
