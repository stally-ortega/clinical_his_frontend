import { Injectable } from '@angular/core';

export interface ExportOptions {
  filename: string;
  mimeType: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportacionService {
  descargarBlob(blob: Blob, options: ExportOptions): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = options.filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  descargarArrayBuffer(buffer: ArrayBuffer, options: ExportOptions): void {
    const blob = new Blob([buffer], { type: options.mimeType });
    this.descargarBlob(blob, options);
  }

  descargarJson(data: unknown, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.descargarBlob(blob, { filename, mimeType: 'application/json' });
  }

  descargarCsv(rows: string[][], filename: string): void {
    const csvContent = rows.map((row) => row.map(this.escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.descargarBlob(blob, { filename, mimeType: 'text/csv' });
  }

  private escapeCsvCell(cell: string): string {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
