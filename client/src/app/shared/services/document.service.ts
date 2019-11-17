import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as chance from 'chance';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig, Snotify } from 'ng-snotify';
import { Observable, Observer, Subject } from 'rxjs';

// Disabling client side caching
// import { Cacheable, CacheBuster } from 'ngx-cacheable';
// import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

var Delta = Quill.import('delta');

@Injectable()

export class DocumentService {

  authorsList$: Observable<any>;
  private authorsListSubject = new Subject<any>();

  constructor(private _http: HttpClient, private snotifyService: SnotifyService,) { 
    this.authorsList$ = this.authorsListSubject.asObservable();
  }

  user = JSON.parse(localStorage.getItem('user'));

  authorsList(data: any) {
    //console.log(data);
    this.authorsListSubject.next(data);
}

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  addAuthor(authorData: any){
    return this._http.post(environment.BASE_API_URL + `/posts/documents/${authorData._post_id}/addAuthor`, authorData);
  }

  // @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  // })
  getAuthors(documentId: any){
    return this._http.get(environment.BASE_API_URL + `/posts/documents/${documentId}/authors`);
  }

  // @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  // })
  getTableCells(documentId: any){
    return this._http.get(environment.BASE_API_URL + `/posts/table/cells/${documentId}`);
  }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  addTableCells(documentData: any){
    return this._http.post(environment.BASE_API_URL + `/posts/table/cells/${documentData._post_id}/addCell`, documentData);
  }

  removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

  async cursorConnection(name: any, color: any, range) {
    return new Promise((resolve, reject) => {

      const getUserName = new XMLHttpRequest();

      if (this.user != null) {
        getUserName.open('GET', environment.BASE_API_URL + `/users/getOtherUser/` + this.user.user_id, true);
        getUserName.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));

        getUserName.onload = async () => {
          if (getUserName.status === 200) {
            //console.log('User Details', JSON.parse(getUserName.responseText));
            // id being generated on server. Amit
            let cursor_user = await JSON.parse(getUserName.responseText).user;
            name = cursor_user.first_name + " " + cursor_user.last_name;
            color = color;
            let user_id = this.user.user_id; 
            // range = {
            //   index: 0,
            //   length: 0
            // };


            resolve({ name, color, user_id, range});
          }
          else {
            console.log('Error while fetching user details', JSON.parse(getUserName.responseText));
            reject();
          }
        };
        getUserName.send();
      }
      else {
        console.log('You are not authenticated');
        reject();

      }
    })

  }

  async sendCursorData(cursors: any, range: any) {
    console.log('Cursor connection params : ', name,  range);
    return new Promise((resolve, reject)=>{
      try{
        cursors.localConnection.range = range;
        cursors.update();
        resolve();
      }
      catch(err){
        reject(err);
      }
    })
  }

  async updateCursors(source: any, cursors: any, cursorsModule: any) {
  
    return new Promise((resolve, reject)=>{
      try{
        var activeConnections = {},
        updateAll = Object.keys(cursorsModule.cursors).length == 0;
  
      cursors.connections.forEach((connection: any) => {
        // if (connection.id != cursors.localConnection.id) {
        //   if (connection.user_id && connection.color) {
        //     let markColors = JSON.parse(sessionStorage.getItem("markColors"));
        //     markColors[connection.user_id] = connection.color;
        //     sessionStorage.setItem("markColors", JSON.stringify(markColors));
        //   }
        //   // Update cursor that sent the update, source (or update all if we're initting)
        //   if ((connection.id == source.id || updateAll) && connection.range) {
  
        //     // changed by AMit instead of setCursor starts
        //     if(cursorsModule.cursors().find((cursor: any) => cursor.id==connection.id)) {
        //       cursorsModule.moveCursor(
        //         connection.id,
        //         connection.range
        //       );
        //     } else {
        //       cursorsModule.createCursor(
        //         connection.id,
        //         connection.name,
        //         connection.color
        //       );
        //     } //ends
        //   }
  
        //   // Add to active connections hashtable
        //   activeConnections[connection.id] = connection;
        // }
        if (connection.id != cursors.localConnection.id) {
          // Update cursor that sent the update, source (or update all if we're initting)
          if ((connection.id == source.id || updateAll) && connection.range) {
            cursorsModule.setCursor(
              connection.id,
              connection.range,
              connection.name,
              connection.color
            );
          }
  
          // Add to active connections hashtable
          activeConnections[connection.id] = connection;
        }
      });
  
      // Clear 'disconnected' cursors
      Object.keys(cursorsModule.cursors).forEach(function(cursorId) {
        if (!activeConnections[cursorId]) {
          cursorsModule.removeCursor(cursorId);
        }
      });
  
      // Clear 'disconnected' cursors
      Object.keys(cursorsModule.cursors).forEach(function(cursorId) {
        if (!activeConnections[cursorId]) {
          cursorsModule.removeCursor(cursorId);
        }
      });

        resolve(cursorsModule);
      }
      catch(err){
        reject(err);
      }
     
  })

  }
  

  async getDocumentHistory(documentId: any, cursors: any) {
    try {
      return new Promise((resolve, reject) => {
        const getDocDetails = new XMLHttpRequest();

        getDocDetails.open('GET', environment.BASE_API_URL + `/posts/documents/history/` + documentId, true);
        getDocDetails.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));

        let document = new Delta();

        getDocDetails.onload = () => {
          if (getDocDetails.status === 200) {
            let documentHistory = JSON.parse(getDocDetails.responseText).documentHistory;
            // let markColors = JSON.parse(sessionStorage.getItem("markColors") || "{}");

            // documentHistory.forEach((item: any) => {
            //   if (item && item.user_id && item.user_id._id !== this.user.user_id) {

            //     let cursor = cursors.connections.find((el: any) => el.user_id === item.user_id._id);
            //     let color = cursor ? cursor.color : (markColors[item.user_id._id] || new chance().color({ format: 'hex' }))

            //     markColors[item.user_id._id] = color;

            //     item.ops.map((op: any) => {
            //       if (op.insert) {
            //         op.attributes = op.attributes || {};
            //         op.attributes.mark = { id: item.src, style: { color: color }, user: item.user_id.first_name + " " + item.user_id.last_name };
            //       }
            //       return op;
            //     })
            //   }
            //   document = document.compose(new Delta(item.ops));
            // })
            // sessionStorage.setItem("markColors", JSON.stringify(markColors));
            // quill.setContents(document);

            documentHistory.forEach((item: any) => {
              if (item && item.user_id && item.user_id._id !== this.user.user_id) {

                let cursor = cursors.connections.find((el: any) => el.user_id === item.user_id._id);

                item.ops.map((op: any) => {
                  if (op.insert) {
                    op.attributes = op.attributes || {};
                    //op.attributes.mark = { id: item.src, style: { background: cursors.localConnection.color }, user: item.user_id.first_name + " " + item.user_id.last_name };
                  }
                  return op;
                })
              }
              document = document.compose(new Delta(item.ops));
            })
            resolve(document);
          }
          else {
            console.log('Error while fetching document details', JSON.parse(getDocDetails.responseText));
            reject();
          }
        };
        getDocDetails.send();
      })
    }

    catch (err) {
      console.log('Some Error occured', err);
    }
  }

}
