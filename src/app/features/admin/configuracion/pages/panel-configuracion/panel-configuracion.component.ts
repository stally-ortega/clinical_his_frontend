import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionService } from '../../../../../core/services/configuracion.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';

@Component({
  selector: 'app-panel-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent],
  templateUrl: './panel-configuracion.component.html',
  styleUrl: './panel-configuracion.component.scss'
})
export class PanelConfiguracionComponent implements OnInit {
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly fb = inject(FormBuilder);

  readonly formConfig: FormGroup = this.fb.group({
    timeout_inactividad_minutos: [15, [Validators.required, Validators.min(1), Validators.max(1440)]]
  });

  isLoading = true;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    this.configuracionService.getConfiguracion().subscribe({
      next: (config) => {
        if (config) {
          this.formConfig.patchValue({
            timeout_inactividad_minutos: config.timeout_inactividad_minutos || 15
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la configuración actual.';
        this.isLoading = false;
      }
    });
  }

  onGuardar() {
    if (this.formConfig.valid) {
      this.isSaving = true;
      this.error = null;
      this.successMessage = null;

      const val = this.formConfig.value.timeout_inactividad_minutos;

      this.configuracionService.actualizarConfiguracion(val).subscribe({
        next: () => {
          this.successMessage = 'Configuración guardada correctamente.';
          this.isSaving = false;
        },
        error: () => {
          this.error = 'Ocurrió un error al guardar la configuración.';
          this.isSaving = false;
        }
      });
    } else {
      this.formConfig.markAllAsTouched();
    }
  }
}
