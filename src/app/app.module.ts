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
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

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
    AppRoutingModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyBRGsUohHdwkWVJAddENZxjjT0hnUbC5_A",
      authDomain: "cyberinterpret-3022a.firebaseapp.com",
      projectId: "cyberinterpret-3022a",
      storageBucket: "cyberinterpret-3022a.firebasestorage.app",
      messagingSenderId: "571224405899",
      appId: "1:571224405899:web:22c7a5dba24243fcc6618e"
    }),
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
