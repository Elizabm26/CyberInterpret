import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-visualizacion',
  templateUrl: './visualizacion.component.html',
  styleUrls: ['./visualizacion.component.scss']
})
export class VisualizacionComponent implements OnInit {
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

  constructor() {}

  ngOnInit() {
    this.loadBarChart();
    this.loadPieChart();
  }

  loadBarChart() {
    new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Autenticación', 'Red', 'Cifrado', 'Logs', 'Accesos'],
        datasets: [
          {
            label: 'Cumplimiento (%)',
            data: [80, 65, 75, 50, 60],
            backgroundColor: ['#28a745', '#ffc107', '#007bff', '#dc3545', '#17a2b8']
          }
        ]
      },
      options: {
        responsive: true,
      maintainAspectRatio: false, // Permite que se ajuste mejor
      plugins: {
        legend: { display: false } // Oculta la leyenda para ahorrar espacio
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
    });
  }

  loadPieChart() {
    new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Cumple', 'Parcial', 'No Cumple'],
        datasets: [
          {
            data: [70, 20, 10],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' } // Mueve la leyenda debajo para ahorrar espacio
        }
      }
    });
  }
  // Método para exportar el reporte completo a PDF
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