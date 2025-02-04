import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BodyComponent } from './body/body.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CargarArchivoComponent } from './cargar-archivo/cargar-archivo.component';
import { AyudaComponent } from './ayuda/ayuda.component';
import { VisualizacionComponent } from './visualizacion/visualizacion.component';
import { ReporteComponent } from './reporte/reporte.component';

@NgModule({
  declarations: [
    AppComponent,
    BodyComponent,
    SidenavComponent,
    DashboardComponent,    
    CargarArchivoComponent,
    AyudaComponent,
    VisualizacionComponent,
    ReporteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
