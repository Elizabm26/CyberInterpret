import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cargar-archivo',
  templateUrl: './cargar-archivo.component.html',
  styleUrls: ['./cargar-archivo.component.scss']
})
export class CargarArchivoComponent implements OnInit {
  message: string = '';
  fileUploaded: boolean = false;  
  constructor() { }
  ngOnInit(): void {}
 
  onFileSelected(event: any) {
  const file: File=event?.target.files[0];
  if(file){
    this.uploadFile(file);
  }
  }
  onDrop(event: DragEvent) {
  event.preventDefault();
  const file =event.dataTransfer?.files[0];
  if(file){
    this.uploadFile(file);
  }
  }
  onDragOver(event: DragEvent) {
  event.preventDefault();
  }
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    //this.http.post'http://localhost:3000/upload',formData).sub
  }
  analyzeFile() {
    alert('Análisis en proceso...'); // Aquí puedes agregar la lógica real del análisis
  }
}
