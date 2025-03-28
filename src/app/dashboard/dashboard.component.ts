import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import Chart from 'chart.js/auto';
import { Observable } from 'rxjs';
import { AnalysisView } from '../visualizacion/visualizacion.component';

export interface Item { name: string };

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private analysisViewCollection!: AngularFirestoreCollection<AnalysisView>;
  analysisView!: Observable<AnalysisView[]>;

  toolInfo: string = 'CyberInterpret analiza archivos de seguridad generados por Feasibility Cybersecurity, detecta riesgos y genera reportes detallados.';

  modulesStatus = [
    { name: 'Carga de Archivos', status: 'Activo', icon: 'upload' },
    { name: 'Visualización de Datos', status: 'Activo', icon: 'bar_chart' },
    { name: 'Generación de Reportes', status: 'Pendiente', icon: 'article' },
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
    private afs: AngularFirestore,
  ) { }

  ngOnInit() {
    this.analysisViewCollection = this.afs.collection<AnalysisView>('analysis');
    this.analysisView = this.analysisViewCollection.valueChanges();
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