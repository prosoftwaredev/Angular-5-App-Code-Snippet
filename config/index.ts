import { AppConfig } from './app.config';
import { ChartConfig } from './chart.config';
import { CCR_CONFIG, CCRApp, CCRConfig, CCRPalette } from './config.interface';
import { Colors, Palette } from './palette.config';

export { CCR_CONFIG, CCRApp, CCRConfig, CCRPalette };

export const Config: CCRConfig = {
  app: AppConfig,
  chart: ChartConfig,
  colors: Colors,
  palette: Palette
};
