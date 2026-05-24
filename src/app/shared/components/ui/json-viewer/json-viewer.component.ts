import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.scss'
})
export class JsonViewerComponent {
  readonly data = input.required<unknown>();
  readonly level = input<number>(0);

  isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  isNull(value: unknown): value is null {
    return value === null;
  }

  isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  isPrimitive(value: unknown): boolean {
    return value === null || typeof value !== 'object';
  }

  getTypeColor(value: unknown): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return '';
  }

  getAsArray(val: unknown): unknown[] {
    return Array.isArray(val) ? val : [];
  }

  getObjectKeys(val: unknown): { key: string; value: unknown }[] {
    if (this.isObject(val)) {
      const obj = val as Record<string, unknown>;
      return Object.keys(obj).map(key => ({
        key,
        value: obj[key]
      }));
    }
    return [];
  }

  isNullOrUndefined(val: unknown): boolean {
    return val === null || val === undefined;
  }
}
