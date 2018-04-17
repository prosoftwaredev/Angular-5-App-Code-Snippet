/**
 * Palette used inside Typescript Code.
 */
import { CCRColors, CCRColorsPalette, CCRPalette } from './config.interface';

export const Palette: CCRPalette = {
  primary: '#f05d5c',
  secondary: '#f8b1b1',
  base: '#504c4a',
  text: '#484848',
  contrast: '#ffffff',
  toolbar: '#ffffff'
};

/**
 * List of colors to be used sequentially
 */
const COLORS: CCRColorsPalette = [
  // default, contrast
  ['#d8d8d8', '#ef9a9a'],
  ['#c9ced0', '#e57373'],
  ['#b9bec7', '#dc4c4c']
  // ['#c9ced0', '#e57373']
];

export const Colors: CCRColors = {
  get(i: number, type?: 'default' | 'contrast') {
    const k = i % COLORS.length;
    type = type ? type : 'default';
    return COLORS[k][type === 'default' ? 0 : 1];
  }
};
