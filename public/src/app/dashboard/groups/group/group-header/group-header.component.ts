import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-group-header',
  templateUrl: './group-header.component.html',
  styleUrls: ['./group-header.component.scss']
})
export class GroupHeaderComponent implements OnInit {
  group_name;
  group_id;
  constructor(private _activedRoute: ActivatedRoute, private _router: Router) { }

  ngOnInit() {

    console.log('Group Heder');

    /* this.group_id = this._activedRoute.snapshot.paramMap.get('id');
    this.group_name = this._activedRoute.snapshot.paramMap.get('groupName');
    /* */
       /*  console.log('group_id: ', this.group_id, 'group_name: ', this.group_name);
        console.log('this._activedRoute.snapshot.paramMap', this._activedRoute.snapshot.paramMap);

        console.log('this._activedRoute.root.firstChild', this._activedRoute.root.firstChild);

 */
    /* console.log('    this.result = router.routerState.snapshot.root.children[0]',
      this._activedRoute.snapshot.root.children
    ); */

    /*
        this._activedRoute.params.subscribe((params) => {
          console.log('params["id"]', params['id']);

        }); */


  }

}
