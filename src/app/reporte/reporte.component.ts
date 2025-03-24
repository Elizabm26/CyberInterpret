import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.scss']
})
export class ReporteComponent implements AfterViewInit {
  @ViewChild('reportChart') reportChart!: ElementRef;
  @ViewChild('reportContent') reportContent!: ElementRef;

 // Datos simulados para el reporte
 totalEvaluaciones = 100;
 cumplimiento = 75;
 riesgos = 10;

 reportes = [
   { categoria: 'Autenticación', resultado: 'Cumple', riesgo: 'Bajo', recomendacion: 'Mantener buenas prácticas' },
   { categoria: 'Red', resultado: 'Parcial', riesgo: 'Medio', recomendacion: 'Mejorar encriptación' },
   { categoria: 'Cifrado', resultado: 'No cumple', riesgo: 'Alto', recomendacion: 'Implementar cifrado robusto' }
 ];

 ngAfterViewInit() {
   this.loadChart();
 }

 // Método para obtener clases CSS dinámicas
 getRiskClass(riesgo: string) {
   return riesgo === 'Alto' ? 'high-risk' : riesgo === 'Medio' ? 'medium-risk' : 'low-risk';
 }

 // Método para generar el gráfico
 loadChart() {
   new Chart(this.reportChart.nativeElement, {
     type: 'doughnut',
     data: {
       labels: ['Cumple', 'Parcial', 'No cumple'],
       datasets: [
         {
           data: [75, 15, 10],
           backgroundColor: ['#28a745', '#ffc107', '#dc3545']
         }
       ]
     },
     options: { responsive: true, maintainAspectRatio: false }
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
     
     doc.text('Reporte de Seguridad', 14, 20);
     doc.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
     doc.save('reporte_seguridad.pdf');
   });
 }
}