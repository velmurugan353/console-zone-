import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemePalette {
  bg: string;
  card: string;
  accent: string;
  secondary: string;
  text: string;
  muted: string;
  border: string;
  headingFont: string;
  bodyFont: string;
}

export interface LayoutSettings {
  maxWidth: string;
  borderRadius: string;
  gridGap: string;
  fullWidthNavbar: boolean;
  glassmorphismBlur: string;
  shadowIntensity: string;
  animationSpeed: string;
  customCSS: string;
}

export interface SiteContent {
  [key: string]: any;
}

interface CustomizerContextType {
  theme: ThemePalette;
  layout: LayoutSettings;
  content: SiteContent;
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
  updateTheme: (newTheme: Partial<ThemePalette>) => void;
  updateLayout: (newLayout: Partial<LayoutSettings>) => void;
  updateContent: (pageKey: string, key: string, value: any) => void;
  resetToDefault: () => void;
  exportConfig: () => void;
  importConfig: (jsonString: string) => boolean;
}

const DEFAULT_THEME: ThemePalette = {
  bg: '#080112',
  card: '#0c021a',
  accent: '#D866FF',
  secondary: '#4D008C',
  text: '#FFFFFF',
  muted: '#8a8a8a',
  border: '#4D008C',
  headingFont: 'Inter',
  bodyFont: 'Inter',
};

const DEFAULT_LAYOUT: LayoutSettings = {
  maxWidth: '1280px',
  borderRadius: '1rem',
  gridGap: '2rem',
  fullWidthNavbar: true,
  glassmorphismBlur: '12px',
  shadowIntensity: '0.1',
  animationSpeed: '0.3s',
  customCSS: '',
};

const CustomizerContext = createContext<CustomizerContextType | undefined>(undefined);

export const CustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('gv_custom_theme');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_THEME, ...parsed };
        }
      } catch (e) {
        console.error("Failed to parse theme:", e);
      }
    }
    return DEFAULT_THEME;
  });

  const [layout, setLayout] = useState<LayoutSettings>(() => {
    const saved = localStorage.getItem('gv_custom_layout');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_LAYOUT, ...parsed };
        }
      } catch (e) {
        console.error("Failed to parse layout:", e);
      }
    }
    return DEFAULT_LAYOUT;
  });

  const [content, setContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem('gv_custom_content');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse content:", e);
      }
    }
    return {};
  });

  const [isEditMode, setEditMode] = useState(false);

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'headingFont' && key !== 'bodyFont') {
        root.style.setProperty(`--${key}`, value);
      }
    });
    
    // Apply typography
    root.style.setProperty('--font-heading', `"${theme.headingFont}", sans-serif`);
    root.style.setProperty('--font-body', `"${theme.bodyFont}", sans-serif`);
    
    localStorage.setItem('gv_custom_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--layout-max-width', layout.maxWidth);
    root.style.setProperty('--layout-border-radius', layout.borderRadius);
    root.style.setProperty('--layout-grid-gap', layout.gridGap);
    root.style.setProperty('--layout-blur', layout.glassmorphismBlur);
    root.style.setProperty('--layout-shadow-intensity', layout.shadowIntensity);
    root.style.setProperty('--layout-transition', layout.animationSpeed);
    
    // Inject Custom CSS
    let styleEl = document.getElementById('gv-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'gv-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = layout.customCSS || '';

    localStorage.setItem('gv_custom_layout', JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem('gv_custom_content', JSON.stringify(content));
  }, [content]);

  const updateTheme = (newTheme: Partial<ThemePalette>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const updateLayout = (newLayout: Partial<LayoutSettings>) => {
    setLayout(prev => ({ ...prev, ...newLayout }));
  };

  const updateContent = (pageKey: string, key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] || {}),
        [key]: value
      }
    }));
  };

  const resetToDefault = () => {
    setTheme(DEFAULT_THEME);
    setLayout(DEFAULT_LAYOUT);
    setContent({});
    localStorage.removeItem('gv_custom_theme');
    localStorage.removeItem('gv_custom_layout');
    localStorage.removeItem('gv_custom_content');
  };

  const exportConfig = () => {
    const config = { theme, layout, content };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "consolezone-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importConfig = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.theme) setTheme({ ...DEFAULT_THEME, ...parsed.theme });
      if (parsed.layout) setLayout({ ...DEFAULT_LAYOUT, ...parsed.layout });
      if (parsed.content) setContent(parsed.content);
      return true;
    } catch (e) {
      console.error("Failed to parse config:", e);
      return false;
    }
  };

  return (
    <CustomizerContext.Provider value={{
      theme,
      layout,
      content,
      isEditMode,
      setEditMode,
      updateTheme,
      updateLayout,
      updateContent,
      resetToDefault,
      exportConfig,
      importConfig
    }}>
      {children}
    </CustomizerContext.Provider>
  );
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error('useCustomizer must be used within a CustomizerProvider');
  }
  return context;
};
