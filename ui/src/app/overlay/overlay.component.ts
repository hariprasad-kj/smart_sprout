import { Component, Input } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent {

  @Input("message") message: string = "";
  faSyncAlt = faSyncAlt;

}
