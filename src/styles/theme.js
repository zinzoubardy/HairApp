const theme = {
  colors: {
    // Primary Colors
    primary: "#6D8B74",        // Sage Green – for key CTAs, buttons
    accent: "#F4A261",         // Clay Peach – for highlights, active tabs, labels
    accentGlow: "#E9C46A",     // Golden Honey – subtle glow, outlines, visual draws
    
    // Background Colors
    background: "#1A1C1D",     // Futuristic soft black – page & app background
    surface: "#2A2E2D",        // Deep charcoal – used in cards and modals
    card: "#2A2E2D",           // Deep charcoal – cards and modals
    
    // Text Colors
    textPrimary: "#FAF9F6",    // Soft Ivory – for all readable text
    textSecondary: "#B4B8B5",  // For placeholders, hints, captions
    textMuted: "#B4B8B5",      // For placeholders, hints, captions
    
    // Status Colors
    success: "#A3C9A8",        // Herbal Mint – success states, progress trackers
    info: "#A3C9A8",           // Herbal Mint – info tags, success badges
    error: "#E9C46A",          // Golden Honey for errors (soft approach)
    warning: "#F4A261",        // Clay Peach for warnings
    
    // Legacy support (mapped to new colors)
    secondary: "#F4A261",      // Clay Peach
    border: "#B4B8B5",         // Muted text color for borders
    surfaceVariant: "#2A2E2D", // Same as surface
  },
  
  fonts: {
    main: "Open Sans",         // Body text
    title: "Poppins-Bold",     // Headers
    body: "Open Sans",         // Body text
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
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  
  // Shadows and effects
  shadows: {
    soft: {
      shadowColor: "#E9C46A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: "#E9C46A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    glow: {
      shadowColor: "#E9C46A",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    }
  },
  
  // Gradients
  gradients: {
    primary: ["#6D8B74", "#5A7A61"],
    accent: ["#F4A261", "#E9C46A"],
    background: ["#1A1C1D", "#2A2E2D"],
    card: ["#2A2E2D", "#1A1C1D"],
    success: ["#A3C9A8", "#8BB894"],
  },
  
  // Typography styles combining fonts and fontSizes
  typography: {
    h1: {
      fontFamily: "Poppins-Bold",
      fontSize: 32,
      fontWeight: 'bold',
      color: "#FAF9F6",
    },
    h2: {
      fontFamily: "Poppins-Bold",
      fontSize: 24,
      fontWeight: 'bold',
      color: "#FAF9F6",
    },
    body: {
      fontFamily: "Open Sans",
      fontSize: 16,
      fontWeight: 'normal',
      color: "#FAF9F6",
      lineHeight: 24,
    },
    label: {
      fontFamily: "Open Sans",
      fontSize: 14,
      fontWeight: '600',
      color: "#B4B8B5",
    },
    button: {
      fontFamily: "Open Sans",
      fontSize: 16,
      fontWeight: 'bold',
      color: "#FAF9F6",
    },
    caption: {
      fontFamily: "Open Sans",
      fontSize: 12,
      fontWeight: 'normal',
      color: "#B4B8B5",
    }
  }
};

export default theme;
