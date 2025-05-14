import { EventEmitter, Injectable } from '@angular/core';
import { ToastDef, ToastType } from './def';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {

  private toastSubject: EventEmitter<ToastDef> = new EventEmitter();
  public toast$ = this.toastSubject.asObservable();

  private isAliveSubject: EventEmitter<boolean> = new EventEmitter();
  public isAlive$ = this.isAliveSubject.asObservable();

  private urlSubject: EventEmitter<string> = new EventEmitter();
  public url$ = this.urlSubject.asObservable();

  constructor() { }

  showSuccessToast(title: string, message: string, subTitle?: string) {
    let toast: ToastDef = { message: message, title: title, subTitle: subTitle, type: ToastType.SUCCESS }
    this.toastSubject.emit(toast);
  }

  showWarningToast(title: string, message: string, subTitle?: string) {
    let toast: ToastDef = { message: message, title: title, subTitle: subTitle, type: ToastType.WARNING }
    this.toastSubject.emit(toast);
  }

  showDangerToast(title: string, message: string, subTitle?: string) {
    let toast: ToastDef = { message: message, title: title, subTitle: subTitle, type: ToastType.DANGER }
    this.toastSubject.emit(toast);
  }

  notifyChipCondition(isAlive: boolean) {
    this.isAliveSubject.next(isAlive)
  }

  notifyUrlChange(url: string) {
    this.urlSubject.next(url)
  }

}
