import { Component, OnInit, OnDestroy, Output, Input, Injector, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Component({
  selector: 'app-lounge-new-element',
  templateUrl: './lounge-new-element.component.html',
  styleUrls: ['./lounge-new-element.component.scss']
})
export class LoungeNewElementComponent implements OnInit, OnDestroy {

  @Input() canCreateCategory: boolean = true;

  // Output story event emitter
  @Output() storyEmitter = new EventEmitter();

  // Output event event emitter
  @Output() eventEmitter = new EventEmitter();

  // Output lounge event emitter
  @Output() loungeEmitter = new EventEmitter();

  // Output category event emitter
  @Output() categoryEmitter = new EventEmitter();

  // User Data Variable
  userData: any;

  // workspaceData Variable
  workspaceData: any;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions Instance
  public publicFunctions = this.Injector.get(PublicFunctions);

  // Element Data variable
  elementData: any = {
    _posted_by: '',
    _workspace: ''
  }

  constructor(
    public Injector: Injector,
    private loungeService: LoungeService
  ) { }

  async ngOnInit() {

    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  ngOnDestroy() {
    this.isLoading$.complete()
  }

  async createStory() {
    await this.initElement();


    this.elementData.name = $localize`:@@loungeNewElement.newStory:New Story`;
    this.elementData.type = 'story';
  }

  async createEvent() {
    await this.initElement();


    this.elementData.name = $localize`:@@loungeNewElement.newEvent:New Event`;
    this.elementData.type = 'event';
  }

  async createLounge() {
    await this.initElement();

    this.elementData.name = $localize`:@@loungeNewElement.newLounge:New Lounge`;
    this.elementData.type = 'lounge';

    this.loungeEmitter.emit(this.elementData);
    this.initElement();
  }

  async createCategory() {
    await this.initElement();

    this.elementData.name = $localize`:@@loungeNewElement.newCategory:New Category`;
    this.elementData.type = 'category';

    this.loungeService.addLounge(this.elementData).then(res => {
      this.categoryEmitter.emit(res['lounge']);
      this.initElement();
    });
  }

  initElement() {
    // Set the File Credentials after view initialization
    this.elementData = {
      _posted_by: this.userData?._id,
      _workspace: this.workspaceData?._id,
      type: '',
      name: ''
    }
  }
}
