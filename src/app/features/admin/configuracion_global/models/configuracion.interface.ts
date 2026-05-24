export interface ConfiguracionGlobal {
  id: number;
  grupo: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo?: 'boolean' | 'time' | 'number' | 'text';
}

export interface ActualizarConfiguracionDto {
  clave: string;
  valor: string;
}
