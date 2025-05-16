import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
//import html2pdf from 'html2pdf.js';
import { ActivatedRoute } from '@angular/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export interface AnalysisView {
  name: string;
  createdAt: string;
  size: number;
  fileURL: string;
  result: {
    breach: string;
    title: string;
    result: {
      respond: {
        nivel: number;
        cumple: number;
        description: string;
        noCumple: number;
        parcial: number;
      };
      protect: {
        noCumple: number;
        description: string;
        cumple: number;
        parcial: number;
        nivel: number;
      };
      estadoGeneral: {
        noCumple: number;
        cumple: number;
        parcial: number;
        generalDescription: string;
      };
      alertasYRecomendaciones: {
        alertas: string[];
        recomendaciones: string[];
      };
      detect: {
        noCumple: number;
        nivel: number;
        parcial: number;
        description: string;
        cumple: number;
      };
      recover: {
        parcial: number;
        noCumple: number;
        nivel: number;
        description: string;
        cumple: number;
      };
      identify: {
        noCumple: number;
        nivel: number;
        parcial: number;
        cumple: number;
        description: string;
      };
    };
    executiveSummary: string;
  };
  id: string;
}

@Component({
  selector: 'app-visualizacion',
  templateUrl: './visualizacion.component.html',
  styleUrls: ['./visualizacion.component.scss']
})
export class VisualizacionComponent implements OnInit {
  id: string = '';
  analysis!: AnalysisView;

  fileInfo = {
    name: 'reporte_seguridad.json',
    date: '2025-02-10',
    size: '2.3 MB',
    status: 'Análisis completado'
  };

  summary = `El análisis del archivo muestra un 70% de cumplimiento con los estándares de ciberseguridad del NIST. Se identificaron algunas áreas de mejora, especialmente en la segmentación de red y en la protección contra accesos no autorizados.`;

  alerts = [
    { type: 'Alto', message: 'Se detectó una vulnerabilidad crítica en los permisos de acceso.', date: 'Hoy' },
    { type: 'Medio', message: 'Faltan controles en el cifrado de datos sensibles.', date: 'Hoy' },
    { type: 'Bajo', message: 'Algunos logs no cumplen con las normas recomendadas.', date: 'Ayer' }
  ];

  @ViewChild('barChart', { static: true }) barChart!: ElementRef;
  @ViewChild('pieChart', { static: true }) pieChart!: ElementRef;
  @ViewChild('reportContent') reportContent!: ElementRef;

  constructor(
    private _route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.id = this._route.snapshot.paramMap.get('id')!;

    const docRef = doc(db, 'analysis', this.id);
    getDoc(docRef).then(doc => {
      if (doc.exists()) {
        console.log(doc.data());
        this.analysis = doc.data() as any;
        //this.loadBarChart();
        this.loadPieChart();
        this.loadStackedBarChart();

      }
    })
  }

  loadBarChart() {
    const identify = this.analysis.result.result.identify.nivel * 100;    
    const protect = this.analysis.result.result.protect.nivel * 100;
    const detect = this.analysis.result.result.detect.nivel * 100;
    const respond = this.analysis.result.result.respond.nivel * 100;
    const recover = this.analysis.result.result.recover.nivel * 100;

    new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
      labels: ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Recuperar'],
      datasets: [
        {
        label: 'Cumplimiento (%)',
        data: [identify, protect, detect, respond, recover],
        backgroundColor: ['#28a745', '#ffc107', '#007bff', '#dc3545', '#17a2b8']
        }
      ]
      },
      options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#000', // Color de los números
        formatter: (value) => `${value}%`, // Formato del número
        font: {
          weight: 'bold',
          size: 12
        }
        }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
      },
      plugins: [ChartDataLabels] // Agregar el plugin para mostrar los valores
    });
  }
loadStackedBarChart() {
type CategoryKey = 'identify' | 'protect' | 'detect' | 'respond' | 'recover';
const categories: CategoryKey[] = ['identify', 'protect', 'detect', 'respond', 'recover'];
const labels = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Recuperar'];

// Obtener datos por nivel de cumplimiento
const cumple = categories.map(cat => this.analysis.result.result[cat].cumple * 100);
const parcial = categories.map(cat => this.analysis.result.result[cat].parcial * 100);
const noCumple = categories.map(cat => this.analysis.result.result[cat].noCumple * 100);

  new Chart(this.barChart.nativeElement, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cumple',
          data: cumple,
          backgroundColor: '#28a745'
        },
        {
          label: 'Parcial',
          data: parcial,
          backgroundColor: '#ffc107'
        },
        {
          label: 'No Cumple',
          data: noCumple,
          backgroundColor: '#dc3545'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        datalabels: {
          color: '#fff',
          anchor: 'center',
          align: 'center',
          font: {
            weight: 'bold'
          },
          formatter: (value) => `${value.toFixed(0)}%`
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.parsed.toFixed(0)}%`
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}




  loadPieChart() {
    const cumple = this.analysis.result.result.estadoGeneral.cumple * 100;
    const parcial = this.analysis.result.result.estadoGeneral.parcial * 100;
    const noCumple = this.analysis.result.result.estadoGeneral.noCumple * 100;
    const generalDescription = this.analysis.result.result.estadoGeneral.generalDescription;

    new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Cumple', 'Parcial', 'No Cumple'],
        datasets: [
          {
            data: [cumple, parcial, noCumple],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) =>{
                const label = context.label || '';
                const value = Math.round(context.parsed);
                return `${label}: ${value}%`;

              }
             // afterBody: () => [`Descripción: ${generalDescription}`]
            }
          },
          datalabels: {
            color: '#000', // Color de los números
            formatter: (value) => `${Math.round(value)}%`, // Formato del número
            font: {
              weight: 'bold',
              size: 14
            }
          }
        }
      },
      plugins: [ChartDataLabels] // Agregar el plugin para mostrar los valores
    });
  }

  getAlertClass(alert: string): string {
    if (alert.includes('Crítica')) {
      return 'high';
    } else if (alert.includes('Medio')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getAlertIcon(alert: string): string {
    if (alert.includes('Crítica')) {
      return 'fa-exclamation-triangle'; // Ícono de alerta crítica
    } else if (alert.includes('Medio')) {
      return 'fa-exclamation-circle'; // Ícono de alerta media
    } else {
      return 'fa-info-circle'; // Ícono de alerta baja
    }
  }

exportToPDF() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  let y = 20;

  // Función para limpiar texto
  function limpiarTexto(texto: string): string {
    return texto
      .replace(/\s+/g, ' ')      // Reemplaza múltiples espacios/tabulaciones/saltos por un solo espacio
      .replace(/ ?\n ?/g, '\n')  // Mantiene saltos de línea limpios
      .trim();
  }

  const marginX = 14;
  const maxWidth = pw - marginX * 2;
  const lineHeight = 6;

  // 2) Título centrado
  doc.setFontSize(18);
  doc.text('Reporte de Seguridad de CyberInterpret', pw / 2, y, { align: 'center' });
  y += 10;

  // 3) Metadatos del archivo
  doc.setFontSize(12);
  doc.text(`Archivo: ${this.analysis.name}`, marginX, y); y += 6;
  doc.text(`Fecha: ${new Date(this.analysis.createdAt).toLocaleString()}`, marginX, y); y += 6;
  doc.text(`Tamaño: ${(this.analysis.size / 1024 / 1024).toFixed(2)} MB`, marginX, y); y += 10;

  // Función para agregar texto dividido y ajustado verticalmente
  const agregarTexto = (titulo: string, contenido: string) => {
    // Título
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (y + lineHeight > ph - 20) { doc.addPage(); y = 20; }
    doc.text(titulo, marginX, y);
    y += lineHeight;

    // Contenido
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(limpiarTexto(contenido), maxWidth);
    for (const line of lines) {
      if (y + lineHeight > ph - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, marginX, y);
      y += lineHeight;
    }
    y += 4;
  };

  // 4) Resumen del Análisis
  agregarTexto('Resumen del Análisis:', this.analysis.result.executiveSummary);

  // 5) Descripción del Estado General
  agregarTexto('Descripción del Estado General:', this.analysis.result.result.estadoGeneral.generalDescription);

  // 6) Gráficos
  const chartHeight = 60;
  const contentWidth = pw - 28;
  const imgW = contentWidth * 0.5;
  const chartTitles = ['Cumplimiento por Categoría', 'Estado General'];
  const canvases: HTMLCanvasElement[] = [
    this.barChart.nativeElement,
    this.pieChart.nativeElement
  ];

  canvases.forEach((canvas, index) => {
    if (y + chartHeight + 10 > ph - 20) {
      doc.addPage();
      y = 20;
    }

    const title = chartTitles[index];
    const textWidth = doc.getTextWidth(title);
    const titleX = (pw - textWidth) / 2;
    doc.setFontSize(12);
    doc.text(title, titleX, y);
    y += 6;

    const imgData = canvas.toDataURL('image/png');
    const x = 14 + (contentWidth - imgW) / 2;
    doc.addImage(imgData, 'PNG', x, y, imgW, chartHeight);
    y += chartHeight + 8;
  });

  // 7) Tabla de alertas y recomendaciones
  const { alertas, recomendaciones } = this.analysis.result.result.alertasYRecomendaciones;
  if (y + 40 > ph - 20) { doc.addPage(); y = 20; }
  (doc as any).autoTable({
    startY: y,
    head: [['Tipo', 'Detalle']],
    body: [
      ...alertas.map(a => ['Alerta Crítica', a]),
      ...recomendaciones.map(r => ['Recomendación', r])
    ],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 8) Pie de página en cada página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`CyberInterpret – Página ${i} de ${pageCount}`, pw - 14, ph - 10, { align: 'right' });
  }

  // 9) Guardar
  doc.save('reporte_seguridad.pdf');
}
  
  
}
