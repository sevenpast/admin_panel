import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  small: 375,
  medium: 414,
  large: 768,
} as const;

// Screen size detection
export const isSmallScreen = width < BREAKPOINTS.small;
export const isMediumScreen = width >= BREAKPOINTS.small && width < BREAKPOINTS.medium;
export const isLargeScreen = width >= BREAKPOINTS.medium;
export const isTablet = width >= BREAKPOINTS.large;

// Responsive values
export const getResponsiveValue = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
}): T => {
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isLargeScreen && values.large !== undefined) return values.large;
  if (isMediumScreen && values.medium !== undefined) return values.medium;
  if (isSmallScreen && values.small !== undefined) return values.small;
  
  // Fallback to the first available value
  return values.large || values.medium || values.small || values.tablet as T;
};

// Responsive dimensions
export const responsive = {
  // Padding
  padding: {
    small: getResponsiveValue({ small: 12, medium: 16, large: 20, tablet: 24 }),
    medium: getResponsiveValue({ small: 16, medium: 20, large: 24, tablet: 28 }),
    large: getResponsiveValue({ small: 20, medium: 24, large: 28, tablet: 32 }),
  },
  
  // Font sizes
  fontSize: {
    small: getResponsiveValue({ small: 12, medium: 14, large: 16, tablet: 18 }),
    medium: getResponsiveValue({ small: 14, medium: 16, large: 18, tablet: 20 }),
    large: getResponsiveValue({ small: 16, medium: 18, large: 20, tablet: 22 }),
    xlarge: getResponsiveValue({ small: 18, medium: 20, large: 24, tablet: 28 }),
    xxlarge: getResponsiveValue({ small: 20, medium: 24, large: 28, tablet: 32 }),
  },
  
  // Button sizes
  button: {
    small: getResponsiveValue({ small: 28, medium: 32, large: 36, tablet: 40 }),
    medium: getResponsiveValue({ small: 36, medium: 40, large: 44, tablet: 48 }),
    large: getResponsiveValue({ small: 44, medium: 48, large: 52, tablet: 56 }),
  },
  
  // Icon sizes
  icon: {
    small: getResponsiveValue({ small: 16, medium: 18, large: 20, tablet: 22 }),
    medium: getResponsiveValue({ small: 20, medium: 22, large: 24, tablet: 26 }),
    large: getResponsiveValue({ small: 24, medium: 26, large: 28, tablet: 30 }),
  },
  
  // Border radius
  borderRadius: {
    small: getResponsiveValue({ small: 8, medium: 10, large: 12, tablet: 14 }),
    medium: getResponsiveValue({ small: 12, medium: 14, large: 16, tablet: 18 }),
    large: getResponsiveValue({ small: 16, medium: 18, large: 20, tablet: 22 }),
    xlarge: getResponsiveValue({ small: 20, medium: 22, large: 24, tablet: 26 }),
  },
  
  // Spacing
  spacing: {
    xs: getResponsiveValue({ small: 4, medium: 6, large: 8, tablet: 10 }),
    sm: getResponsiveValue({ small: 8, medium: 10, large: 12, tablet: 14 }),
    md: getResponsiveValue({ small: 12, medium: 14, large: 16, tablet: 18 }),
    lg: getResponsiveValue({ small: 16, medium: 18, large: 20, tablet: 24 }),
    xl: getResponsiveValue({ small: 20, medium: 24, large: 28, tablet: 32 }),
  },
};

// Layout helpers
export const getTileDimensions = () => {
  if (isTablet) {
    return {
      width: '30%',
      height: '22%',
      columns: 3,
    };
  }
  
  return {
    width: '47%',
    height: '25%',
    columns: 2,
  };
};

export const getCardPadding = () => {
  return getResponsiveValue({
    small: 16,
    medium: 18,
    large: 20,
    tablet: 24,
  });
};

export const getActionButtonSize = () => {
  return getResponsiveValue({
    small: 28,
    medium: 32,
    large: 36,
    tablet: 40,
  });
};
