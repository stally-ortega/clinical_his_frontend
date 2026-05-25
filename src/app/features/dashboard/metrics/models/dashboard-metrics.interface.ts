export interface KpiMetric {
  icon: string;
  titulo: string;
  valor: string | number;
  subtitulo: string;
  colorClass: string;
  tendencia?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface KpiDashboard {
  metricas: KpiMetric[];
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}
