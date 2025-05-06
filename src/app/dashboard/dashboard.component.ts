import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { Observable } from 'rxjs';
import { AnalysisView } from '../visualizacion/visualizacion.component';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export interface Item { name: string };

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  analysisView: AnalysisView[] = [];

  toolInfo: string = 'CyberInterpret es una herramienta diseñada para facilitar la interpretación del documento de salida generado por Feasibility Cybersecurity. Su propósito es analizar el archivo y presentar los resultados de forma clara, precisa y comprensible. Además, permite exportar la información interpretada, lo que resulta especialmente útil para personas sin conocimientos técnicos en seguridad informática.';

  modulesStatus = [
    { name: 'Carga de Archivos', status: 'Activo', icon: 'upload' },
    { name: 'Visualización de Datos', status: 'Activo', icon: 'bar_chart' },
    { name: 'Generación de Reportes', status: 'Activo', icon: 'article' },
    { name: 'Motor de Análisis', status: 'Activo', icon: 'analytics' }
  ];

  recentFiles = [
    { name: 'reporte1.json', date: '2025-02-10' },
    { name: 'analisis_final.csv', date: '2025-02-08' },
    { name: 'seguridad_nist.xml', date: '2025-02-07' }
  ];

  notifications = [
    { message: 'Nuevo archivo de análisis procesado correctamente.', date: 'Hace 2 horas' },
    { message: 'Se detectó una vulnerabilidad en el último análisis.', date: 'Hace 5 horas' },
    { message: 'El módulo de reportes requiere actualización.', date: 'Ayer' }
  ];

  @ViewChild('doughnutCanvas', { static: true }) doughnutCanvas!: ElementRef;
  doughnutChart: any;

  constructor(
  ) { }

  ngOnInit() {
    const ref = query(collection(db, 'analysis'), limit(5), orderBy('createdAt', 'desc'))
    getDocs(ref).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let data: AnalysisView;
        data = doc.data() as AnalysisView;
        data.id = doc.id;
        this.analysisView.push(data);
      })
    })
    this.loadChart();
  }

  loadChart() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
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
        maintainAspectRatio: false
      }
    });
  }
  redirectToFeasibility() {
    window.open('https://facilitycyber.labworks.org/tools/managementPriorities', '_blank');
  }
}