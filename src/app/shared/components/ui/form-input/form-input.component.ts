import { Component, Input, OnInit, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, ReactiveFormsModule, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (container: ControlContainer) => container,
      deps: [[new SkipSelf(), ControlContainer]],
    }
  ]
})
export class FormInputComponent implements OnInit {
  @Input({ required: true }) controlName!: string;
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  /** Si true, bloquea caracteres no numéricos en el input (para documentos) */
  @Input() onlyNumbers = false;

  control!: AbstractControl | null;

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit(): void {
    if (this.controlContainer && this.controlContainer.control) {
      this.control = this.controlContainer.control.get(this.controlName);
    }
  }

  get isInvalidAndTouched(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  /** Bloquea teclas no numéricas cuando onlyNumbers es true */
  onKeydown(event: KeyboardEvent): void {
    if (!this.onlyNumbers) return;
    const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','Home','End'];
    if (allowed.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return; // allow Ctrl+C, Ctrl+V, etc.
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  /** Filtra pegado de texto que contenga no-dígitos cuando onlyNumbers es true */
  onPaste(event: ClipboardEvent): void {
    if (!this.onlyNumbers) return;
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pasted)) {
      event.preventDefault();
    }
  }
}
