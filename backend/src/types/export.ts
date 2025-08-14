// Export types for PowerPoint generation

export interface ThemeConfig {
  name: string;
  background: string;
  primaryFont: string;
  secondaryFont?: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
}

export interface BulletPoint {
  text: string;
  level: number;          // 0 = main point, 1 = sub-point
  bulletStyle?: 'dot' | 'dash' | 'number' | 'arrow';
}

export interface ExportSlide {
  slideNumber: number;        // 1-indexed for export
  type: 'title' | 'content';  // Title slide vs. content slide
  
  title: {
    text: string;
    fontSize?: number;     // Default: 32 for title, 24 for content
    fontWeight?: 'bold' | 'normal';
    alignment?: 'left' | 'center' | 'right';
  };
  
  content: {
    bulletPoints: BulletPoint[];
    fontSize?: number;     // Default: 18
    lineSpacing?: number;  // Default: 1.2
  };
  
  layout?: {
    titleHeight?: number;  // Percentage of slide height
    contentMargin?: number; // Margin from edges
  };
}

export interface PresentationExport {
  // Presentation Metadata
  metadata: {
    title: string;
    author: string;
    createdDate: string;
    slideCount: number;
    originalTranscription?: string; // Optional reference
  };
  
  // Theme Configuration
  theme: ThemeConfig;
  
  // Slides Array (ordered)
  slides: ExportSlide[];
}

// Predefined themes
export const THEMES: Record<string, ThemeConfig> = {
  professional: {
    name: "Professional Blue",
    background: "#FFFFFF",
    primaryFont: "Segoe UI",
    secondaryFont: "Segoe UI Light", 
    titleColor: "#1E3A8A",      // Deep blue
    textColor: "#374151",       // Dark gray
    accentColor: "#3B82F6"      // Bright blue
  },
  
  modern: {
    name: "Modern Dark",
    background: "#0F172A",      // Very dark blue
    primaryFont: "Inter",
    secondaryFont: "Inter Light",
    titleColor: "#F8FAFC",      // Almost white
    textColor: "#CBD5E1",       // Light gray
    accentColor: "#06B6D4"      // Cyan accent
  },
  
  academic: {
    name: "Warm Academic",
    background: "#FFFBF5",      // Warm white
    primaryFont: "Georgia",
    secondaryFont: "Georgia",
    titleColor: "#7C2D12",      // Deep brown
    textColor: "#44403C",       // Warm dark gray
    accentColor: "#EA580C"      // Orange accent
  }
};

export type ThemeName = keyof typeof THEMES;