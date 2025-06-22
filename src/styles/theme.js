const theme = {
  colors: {
    background: "#0f0e15",
    primary: "#6e44ff",  // Violet
    secondary: "#00e5ff", // Teal
    accent: "#ff2d75",   // Magenta
    textPrimary: "#F0F0F0", // Light gray for primary text
    textSecondary: "#A0A0A0", // Medium light gray for secondary text
    card: "#1C1B2A", // A dark, slightly purplish gray, subtly lighter than background
    surface: "#1C1B2A", // Added surface, same as card for now, can be different
    surfaceVariant: "#232233", // Slightly different for step containers
    border: "#3A3854",  // A border color that fits the scheme
    error: "#FF5252", // Standard error red
    success: "#4CAF50", // Standard success green
    info: "#2196F3", // Standard info blue
  },
  fonts: {
    main: "Open Sans", // Retaining Open Sans for main/body
    title: "Poppins-Bold",
    body: "Open Sans",
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    title: 28,
    subTitle: 22,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  // Define typography styles combining fonts and fontSizes
  typography: {
    h1: {
      fontFamily: "Poppins-Bold", // from theme.fonts.title
      fontSize: 32,             // from theme.fontSizes.xxl
      fontWeight: 'bold',       // Standard bold for h1
      color: "#F0F0F0",          // from theme.colors.textPrimary
    },
    h2: {
      fontFamily: "Poppins-Bold", // from theme.fonts.title
      fontSize: 24,             // from theme.fontSizes.xl
      fontWeight: 'bold',
      color: "#F0F0F0",
    },
    body: {
      fontFamily: "Open Sans",   // from theme.fonts.body
      fontSize: 16,             // from theme.fontSizes.md
      fontWeight: 'normal',
      color: "#F0F0F0",
      lineHeight: 24,           // Common line height for body text
    },
    label: {
      fontFamily: "Open Sans",
      fontSize: 14,             // from theme.fontSizes.sm
      fontWeight: '600',        // Semi-bold for labels
      color: "#A0A0A0",          // from theme.colors.textSecondary
    },
    button: {
      fontFamily: "Open Sans",
      fontSize: 16,             // from theme.fontSizes.md
      fontWeight: 'bold',
      color: "#FFFFFF",          // Default for buttons with solid backgrounds
    },
    caption: {
      fontFamily: "Open Sans",
      fontSize: 12,             // from theme.fontSizes.xs
      fontWeight: 'normal',
      color: "#A0A0A0",          // from theme.colors.textSecondary
    }
    // Add other typography styles as needed (e.g., subtitle, link)
  }
};

export default theme;
