import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() text = '';
  @Input() icon = '';
  @Input() isLoading = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'outline' = 'primary';
  @Input() disabled = false;

  @Output() onClick = new EventEmitter<Event>();

  handleClick(event: Event) {
    if (!this.disabled && !this.isLoading) {
      this.onClick.emit(event);
    }
  }
}
