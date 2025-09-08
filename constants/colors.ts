// Mauritanian-inspired color palette
const mauritanianColors = {
  // Desert and sand colors
  sand: '#F4E4BC',
  darkSand: '#E6D3A3',
  lightSand: '#FAF0D7',
  
  // Traditional blue (Mauritanian flag)
  mauritanianBlue: '#0F4C75',
  lightBlue: '#3282B8',
  skyBlue: '#BBE1FA',
  
  // Traditional green (Islamic)
  islamicGreen: '#2E8B57',
  lightGreen: '#90EE90',
  darkGreen: '#006400',
  
  // Gold and amber (traditional jewelry)
  gold: '#FFD700',
  amber: '#FFBF00',
  darkGold: '#B8860B',
  
  // Traditional red (henna and textiles)
  hennaRed: '#CD853F',
  traditionalRed: '#DC143C',
  lightRed: '#FFB6C1',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#2C3E50',
  mediumGray: '#7F8C8D',
  lightGray: '#BDC3C7',
  
  // Gradient combinations
  desertGradient: ['#F4E4BC', '#E6D3A3', '#D4AF37'],
  oceanGradient: ['#0F4C75', '#3282B8', '#BBE1FA'],
  sunsetGradient: ['#FFD700', '#FF8C00', '#DC143C'],
};

const tintColorLight = mauritanianColors.mauritanianBlue;

export default {
  light: {
    text: mauritanianColors.darkGray,
    background: mauritanianColors.lightSand,
    tint: tintColorLight,
    tabIconDefault: mauritanianColors.mediumGray,
    tabIconSelected: tintColorLight,
    card: mauritanianColors.white,
    border: mauritanianColors.sand,
    primary: mauritanianColors.mauritanianBlue,
    secondary: mauritanianColors.gold,
    accent: mauritanianColors.islamicGreen,
    surface: mauritanianColors.white,
    onSurface: mauritanianColors.darkGray,
  },
  mauritanian: mauritanianColors,
};
