import { Component, OnInit, OnDestroy } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {

  isLoading: boolean;

  constructor(private utilityService: UtilityService) {
    this.utilityService.isLoading.subscribe((v) => {
      this.isLoading = v;
    });
  }

  ngOnDestroy(): void {
    this.utilityService.isLoading.unsubscribe();
  }

  ngOnInit() {
  }

}
