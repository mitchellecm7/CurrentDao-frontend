import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PriceDataPoint, IndicatorConfig, DrawingTool } from '@/types/charts';

// Chart export utilities
export class ChartExporter {
  // Export chart as PNG
  static async exportAsPNG(
    element: HTMLElement,
    options: {
      filename?: string;
      quality?: number;
      backgroundColor?: string;
      width?: number;
      height?: number;
    } = {}
  ): Promise<void> {
    const {
      filename = `chart-${Date.now()}.png`,
      quality = 1,
      backgroundColor = '#ffffff',
      width,
      height
    } = options;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor,
        scale: 2, // Higher resolution
        width,
        height,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', quality);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      throw new Error('Failed to export chart as PNG');
    }
  }

  // Export chart as SVG
  static exportAsSVG(
    element: HTMLElement,
    options: {
      filename?: string;
      width?: number;
      height?: number;
      includeStyles?: boolean;
    } = {}
  ): void {
    const {
      filename = `chart-${Date.now()}.svg`,
      width,
      height,
      includeStyles = true
    } = options;

    try {
      // Find SVG elements in the chart
      const svgElements = element.querySelectorAll('svg');
      if (svgElements.length === 0) {
        throw new Error('No SVG elements found in chart');
      }

      // Clone the first SVG (main chart)
      const svg = svgElements[0].cloneNode(true) as SVGElement;
      
      // Set dimensions
      if (width) svg.setAttribute('width', width.toString());
      if (height) svg.setAttribute('height', height.toString());
      
      // Add styles if requested
      if (includeStyles) {
        const styleElement = document.createElement('style');
        const computedStyles = window.getComputedStyle(element);
        styleElement.textContent = `
          .chart-container { ${computedStyles.cssText} }
        `;
        svg.insertBefore(styleElement, svg.firstChild);
      }

      // Serialize and download
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      throw new Error('Failed to export chart as SVG');
    }
  }

  // Export chart as PDF
  static async exportAsPDF(
    element: HTMLElement,
    options: {
      filename?: string;
      format?: 'a4' | 'letter' | 'legal';
      orientation?: 'portrait' | 'landscape';
      quality?: number;
    } = {}
  ): Promise<void> {
    const {
      filename = `chart-${Date.now()}.pdf`,
      format = 'a4',
      orientation = 'landscape',
      quality = 1
    } = options;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', quality);
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit page
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 25.4; // Convert to mm
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export chart as PDF');
    }
  }

  // Export data as CSV
  static exportAsCSV(
    data: PriceDataPoint[],
    indicators: IndicatorConfig[],
    drawings: DrawingTool[],
    options: {
      filename?: string;
      includeIndicators?: boolean;
      includeDrawings?: boolean;
      dateFormat?: string;
    } = {}
  ): void {
    const {
      filename = `chart-data-${Date.now()}.csv`,
      includeIndicators = true,
      includeDrawings = true,
      dateFormat = 'ISO'
    } = options;

    try {
      // Format date based on preference
      const formatDate = (timestamp: number | Date) => {
        const date = new Date(timestamp);
        switch (dateFormat) {
          case 'ISO':
            return date.toISOString();
          case 'US':
            return date.toLocaleDateString('en-US');
          case 'EU':
            return date.toLocaleDateString('de-DE');
          default:
            return date.toISOString();
        }
      };

      // Create CSV headers
      const headers = [
        'Timestamp',
        'Open',
        'High',
        'Low',
        'Close',
        'Volume'
      ];

      // Add indicator headers
      if (includeIndicators) {
        indicators.forEach(indicator => {
          headers.push(`${indicator.type}(${indicator.period})`);
        });
      }

      // Create CSV rows
      const rows = data.map((point, index) => {
        const row = [
          formatDate(point.timestamp),
          point.open.toFixed(4),
          point.high.toFixed(4),
          point.low.toFixed(4),
          point.close.toFixed(4),
          point.volume.toString()
        ];

        // Add indicator values (simplified - would need actual calculation)
        if (includeIndicators) {
          indicators.forEach(indicator => {
            // Placeholder for indicator values
            row.push(''); // Would calculate actual indicator values
          });
        }

        return row.join(',');
      });

      // Add drawings metadata
      let csvContent = [headers.join(','), ...rows].join('\n');

      if (includeDrawings && drawings.length > 0) {
        csvContent += '\n\nDrawings\n';
        csvContent += 'Type,Start X,Start Y,End X,End Y,Color,Stroke Width,Visible\n';
        
        drawings.forEach(drawing => {
          const drawingRow = [
            drawing.type,
            drawing.startPoint.x.toString(),
            drawing.startPoint.y.toString(),
            drawing.endPoint?.x.toString() || '',
            drawing.endPoint?.y.toString() || '',
            drawing.color,
            drawing.strokeWidth.toString(),
            drawing.visible.toString()
          ];
          csvContent += drawingRow.join(',') + '\n';
        });
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export chart data as CSV');
    }
  }

  // Export chart configuration as JSON
  static exportConfiguration(
    config: {
      chartType: string;
      indicators: IndicatorConfig[];
      drawings: DrawingTool[];
      timeframe: string;
      settings: any;
    },
    options: {
      filename?: string;
      pretty?: boolean;
    } = {}
  ): void {
    const {
      filename = `chart-config-${Date.now()}.json`,
      pretty = true
    } = options;

    try {
      const configData = {
        ...config,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const jsonString = pretty 
        ? JSON.stringify(configData, null, 2)
        : JSON.stringify(configData);

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting configuration:', error);
      throw new Error('Failed to export chart configuration');
    }
  }

  // Import chart configuration from JSON
  static async importConfiguration(
    file: File
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string);
          resolve(config);
        } catch (error) {
          reject(new Error('Invalid configuration file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Generate shareable link
  static generateShareableLink(
    config: any,
    baseUrl: string = window.location.origin
  ): string {
    try {
      const compressed = btoa(JSON.stringify(config));
      return `${baseUrl}/chart?config=${compressed}`;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error('Failed to generate shareable link');
    }
  }

  // Export chart as image with annotations
  static async exportWithAnnotations(
    chartElement: HTMLElement,
    annotations: Array<{
      type: 'text' | 'arrow' | 'rectangle';
      x: number;
      y: number;
      width?: number;
      height?: number;
      text?: string;
      color?: string;
    }>,
    options: {
      filename?: string;
      format?: 'png' | 'jpeg';
      quality?: number;
    } = {}
  ): Promise<void> {
    const {
      filename = `chart-annotated-${Date.now()}.png`,
      format = 'png',
      quality = 0.9
    } = options;

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Draw annotations
      annotations.forEach(annotation => {
        ctx.save();
        
        if (annotation.color) {
          ctx.strokeStyle = annotation.color;
          ctx.fillStyle = annotation.color;
        }

        switch (annotation.type) {
          case 'text':
            if (annotation.text) {
              ctx.font = '14px Arial';
              ctx.fillText(annotation.text, annotation.x, annotation.y);
            }
            break;
            
          case 'arrow':
            ctx.beginPath();
            ctx.moveTo(annotation.x, annotation.y);
            ctx.lineTo(annotation.x + (annotation.width || 50), annotation.y + (annotation.height || 0));
            ctx.stroke();
            break;
            
          case 'rectangle':
            if (annotation.width && annotation.height) {
              ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
            }
            break;
        }
        
        ctx.restore();
      });

      // Export the annotated canvas
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, `image/${format}`, quality);
    } catch (error) {
      console.error('Error exporting with annotations:', error);
      throw new Error('Failed to export chart with annotations');
    }
  }

  // Print chart
  static printChart(element: HTMLElement, options: {
    title?: string;
    includeMetadata?: boolean;
  } = {}): void {
    const { title = 'Chart', includeMetadata = true } = options;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Failed to open print window');

      const styles = `
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .chart-header { text-align: center; margin-bottom: 20px; }
          .chart-container { max-width: 100%; overflow: hidden; }
          .chart-footer { margin-top: 20px; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      `;

      const metadata = includeMetadata ? `
        <div class="chart-footer">
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>CurrentDao Advanced Charting System</p>
        </div>
      ` : '';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            ${styles}
          </head>
          <body>
            <div class="chart-header">
              <h1>${title}</h1>
            </div>
            <div class="chart-container">
              ${element.outerHTML}
            </div>
            ${metadata}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      console.error('Error printing chart:', error);
      throw new Error('Failed to print chart');
    }
  }

  // Export multiple charts as a single PDF
  static async exportMultipleChartsAsPDF(
    charts: Array<{
      element: HTMLElement;
      title?: string;
    }>,
    options: {
      filename?: string;
      format?: 'a4' | 'letter' | 'legal';
      orientation?: 'portrait' | 'landscape';
    } = {}
  ): Promise<void> {
    const {
      filename = `charts-${Date.now()}.pdf`,
      format = 'a4',
      orientation = 'landscape'
    } = options;

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      for (let i = 0; i < charts.length; i++) {
        const { element, title } = charts[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        // Add title if provided
        if (title) {
          pdf.setFontSize(16);
          pdf.text(title, 20, 20);
        }

        // Capture chart
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth() - 40; // Margins
        const pdfHeight = pdf.internal.pageSize.getHeight() - (title ? 60 : 40); // Margins + title space
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 25.4;
        
        pdf.addImage(
          imgData, 
          'PNG', 
          20, 
          title ? 40 : 20, 
          imgWidth * ratio, 
          imgHeight * ratio
        );
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting multiple charts:', error);
      throw new Error('Failed to export multiple charts as PDF');
    }
  }
}

// Export utility functions
export const exportChart = async (
  element: HTMLElement,
  format: 'png' | 'svg' | 'pdf' | 'csv',
  data?: {
    priceData?: PriceDataPoint[];
    indicators?: IndicatorConfig[];
    drawings?: DrawingTool[];
  },
  options?: any
): Promise<void> => {
  switch (format) {
    case 'png':
      return ChartExporter.exportAsPNG(element, options);
    
    case 'svg':
      return ChartExporter.exportAsSVG(element, options);
    
    case 'pdf':
      return ChartExporter.exportAsPDF(element, options);
    
    case 'csv':
      if (!data?.priceData) {
        throw new Error('Price data required for CSV export');
      }
      return ChartExporter.exportAsCSV(
        data.priceData,
        data.indicators || [],
        data.drawings || [],
        options
      );
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

export const createExportMenu = (
  element: HTMLElement,
  data?: {
    priceData?: PriceDataPoint[];
    indicators?: IndicatorConfig[];
    drawings?: DrawingTool[];
  }
): HTMLElement => {
  const menu = document.createElement('div');
  menu.className = 'export-menu';
  menu.innerHTML = `
    <div class="export-menu-content">
      <h3>Export Chart</h3>
      <div class="export-options">
        <button data-format="png">Export as PNG</button>
        <button data-format="svg">Export as SVG</button>
        <button data-format="pdf">Export as PDF</button>
        <button data-format="csv">Export Data as CSV</button>
        <button data-action="print">Print Chart</button>
        <button data-action="config">Export Configuration</button>
      </div>
    </div>
  `;

  // Add event listeners
  menu.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const target = event.target as HTMLButtonElement;
      const format = target.dataset.format;
      const action = target.dataset.action;

      try {
        if (format) {
          await exportChart(element, format as any, data);
        } else if (action === 'print') {
          ChartExporter.printChart(element);
        } else if (action === 'config') {
          ChartExporter.exportConfiguration({
            chartType: 'advanced',
            indicators: data?.indicators || [],
            drawings: data?.drawings || [],
            timeframe: '1h',
            settings: {}
          });
        }
        
        // Close menu
        menu.remove();
      } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Please try again.');
      }
    });
  });

  return menu;
};
