'use client';

import React, { useState } from 'react';
import { Download, Settings, Check } from 'lucide-react';
import { Button } from './Button';
import { slidesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Theme {
  key: string;
  name: string;
  preview: {
    name: string;
    background: string;
    titleColor: string;
    textColor: string;
    accentColor: string;
  };
}

interface ExportButtonProps {
  presentationId: string;
  presentationTitle: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  presentationId,
  presentationTitle,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('professional');
  const [authorName, setAuthorName] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);

  // Load themes when options are shown
  const handleShowOptions = async () => {
    if (!showOptions && themes.length === 0) {
      try {
        const response = await slidesApi.getThemes();
        setThemes(response.themes);
      } catch (error) {
        console.error('Failed to load themes:', error);
        toast.error('Failed to load themes');
      }
    }
    setShowOptions(!showOptions);
  };

  const handleExport = async (useQuickExport = false) => {
    setIsExporting(true);
    
    try {
      const exportOptions = useQuickExport 
        ? { theme: 'professional' }
        : { theme: selectedTheme, author: authorName.trim() || undefined };

      console.log('Starting export with options:', exportOptions);
      const blob = await slidesApi.exportToPptx(presentationId, exportOptions);
      console.log('Export completed, blob size:', blob.size);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const sanitizedTitle = presentationTitle
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 50);
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${sanitizedTitle}_${timestamp}.pptx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      toast.success('Presentation exported successfully!');
      setShowOptions(false);
      
    } catch (error: unknown) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 'data' in error.response &&
        typeof error.response.data === 'object' && error.response.data && 
        (('details' in error.response.data && typeof error.response.data.details === 'string') ||
         ('error' in error.response.data && typeof error.response.data.error === 'string'))
        ? ((error.response.data as { details?: string; error?: string }).details || 
           (error.response.data as { details?: string; error?: string }).error)
        : 'Export failed';
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Quick Export Button */}
      <div className="flex gap-2">
        <Button
          onClick={() => handleExport(true)}
          disabled={isExporting}
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export PPTX'}</span>
        </Button>
        
        <Button
          onClick={handleShowOptions}
          variant="outline"
          className="flex items-center space-x-2"
          disabled={isExporting}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Export Options Modal */}
      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-80 glass rounded-lg p-4 shadow-lg border border-border z-50">
          <h3 className="text-lg font-semibold text-foreground mb-4">Export Options</h3>
          
          {/* Author Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Author Name (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Theme Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Choose Theme
            </label>
            <div className="space-y-2">
              {themes.map((theme) => (
                <div
                  key={theme.key}
                  onClick={() => setSelectedTheme(theme.key)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTheme === theme.key
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{theme.preview.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: theme.preview.background }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.preview.titleColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.preview.accentColor }}
                        />
                      </div>
                    </div>
                    {selectedTheme === theme.key && (
                      <Check className="w-5 h-5 text-accent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport(false)}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </Button>
            <Button
              onClick={() => setShowOptions(false)}
              variant="outline"
              disabled={isExporting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};