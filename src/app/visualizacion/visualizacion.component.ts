import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
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
        this.loadBarChart();
        this.loadPieChart();

      }
    })
  }

  loadBarChart() {
    const recover = this.analysis.result.result.recover.nivel * 100;
    const identify = this.analysis.result.result.identify.nivel * 100;
    const respond = this.analysis.result.result.respond.nivel * 100;
    const protect = this.analysis.result.result.protect.nivel * 100;
    const detect = this.analysis.result.result.detect.nivel * 100;

    new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
      labels: ['Identify', 'Recover', 'Respond', 'Protect', 'Detect'],
      datasets: [
        {
        label: 'Cumplimiento (%)',
        data: [recover, identify, respond, protect, detect],
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
              afterBody: () => [`Descripción: ${generalDescription}`]
            }
          }
        }
      }
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
    const doc = new jsPDF('p', 'mm', 'a4');
     // Captura la pantalla del reporte
     html2canvas(this.reportContent.nativeElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let yPos = 20; // Margen superior

      // Agregar título y encabezado
      doc.setFontSize(18);
      doc.text('Reporte de Seguridad', 14, yPos);
      yPos += 10;

      // Agregar imagen del contenido capturado
      if (imgHeight > 240) {
        const pageHeight = doc.internal.pageSize.height - 20;
        let heightLeft = imgHeight;

        while (heightLeft > 0) {
          doc.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          yPos = -pageHeight;

          if (heightLeft > 0) {
            doc.addPage();
          }
        }
      } else {
        doc.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
      }

      // Pie de página
      doc.setFontSize(10);
      doc.text('CyberInterpret - Reporte generado automáticamente', 14, 285);

      // Guardar el PDF
      doc.save('reporte_seguridad.pdf');
    });
  }
}
