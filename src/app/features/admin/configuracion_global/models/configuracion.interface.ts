export interface ConfiguracionGlobal {
  id: number;
  grupo: string;
  clave: string;
  valor: string;
  descripcion?: string;
}

export interface ActualizarConfiguracionDto {
  clave: string;
  valor: string;
}
