import { Component } from '@angular/core';
import { DataShareService } from '../data-share.service';
import { ToastDef } from '../def';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {

  showToast: boolean = false;

  toast!: ToastDef;

  constructor(private service: DataShareService) {
    this.service.toast$.subscribe(data => {
      this.toast = data
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false
      }, 3000);
    })
  }

}
