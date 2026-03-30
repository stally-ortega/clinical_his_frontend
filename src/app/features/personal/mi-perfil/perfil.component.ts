import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';
import { Usuario } from '../../../core/models/auth.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  template: `
    <div class="page-header">
      <h2 class="page-title">Mi Perfil</h2>
      <p class="page-subtitle">Información de tu cuenta y preferencias del sistema</p>
    </div>

    <div class="profile-card grain-overlay">
      @if (usuario) {
        <div class="avatar-section">
          <div class="profile-avatar">{{ usuario.nombres.charAt(0) }}{{ usuario.apellidos.charAt(0) }}</div>
          <div class="profile-info">
            <h3 class="profile-name">{{ usuario.nombres }} {{ usuario.apellidos }}</h3>
            <span class="profile-role">{{ usuario.rol }}</span>
          </div>
        </div>
        <hr class="section-divider">
        <div class="details-grid">
          <div class="detail-item">
            <span class="material-symbols-outlined detail-icon">badge</span>
            <div>
              <p class="detail-label">ID de Usuario</p>
              <p class="detail-value">#{{ usuario.id }}</p>
            </div>
          </div>
          <div class="detail-item">
            <span class="material-symbols-outlined detail-icon">assignment_ind</span>
            <div>
              <p class="detail-label">Rol en el Sistema</p>
              <p class="detail-value">{{ usuario.rol }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }
    .page-title {
      font-family: var(--font-headline);
      font-size: clamp(1.4rem, 4vw, 2rem);
      font-weight: 800;
      color: #164e63;
      letter-spacing: -0.03em;
      margin: 0;
    }
    .page-subtitle {
      color: var(--on-surface-variant);
      font-size: 0.9rem;
      margin: 0.25rem 0 0;
    }
    .profile-card {
      background: rgba(255,255,255,0.70);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(174,179,181,0.12);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      max-width: 640px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .profile-avatar {
      width: 72px; height: 72px;
      border-radius: var(--radius-full);
      background: rgba(135,237,237,0.35);
      color: var(--primary);
      font-family: var(--font-headline);
      font-weight: 800;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 3px solid rgba(0,106,106,0.15);
    }
    .profile-name {
      font-family: var(--font-headline);
      font-size: 1.25rem;
      font-weight: 800;
      color: #164e63;
      margin: 0;
    }
    .profile-role {
      display: inline-block;
      margin-top: 0.25rem;
      font-size: 0.7rem;
      font-weight: 700;
      font-family: var(--font-label);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary);
      background: rgba(135,237,237,0.25);
      padding: 0.2rem 0.75rem;
      border-radius: var(--radius-full);
    }
    .section-divider {
      border: none;
      height: 1px;
      background: rgba(174,179,181,0.15);
      margin: 2rem 0;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .detail-icon {
      font-size: 22px;
      color: var(--primary);
      opacity: 0.7;
      margin-top: 0.1rem;
      flex-shrink: 0;
    }
    .detail-label {
      font-family: var(--font-label);
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 0;
    }
    .detail-value {
      font-family: var(--font-body);
      font-size: 0.925rem;
      font-weight: 600;
      color: var(--on-surface);
      margin: 0.2rem 0 0;
    }
    @media (max-width: 480px) {
      .profile-card { padding: 1.5rem; }
      .details-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PerfilComponent {
  private store = inject(AuthStore);

  /** Signal leído en el componente con tipado explícito para el template */
  get usuario(): Usuario | null {
    return this.store.usuario() as Usuario | null;
  }
}
