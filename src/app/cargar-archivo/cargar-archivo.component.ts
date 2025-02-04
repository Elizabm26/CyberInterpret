import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cargar-archivo',
  templateUrl: './cargar-archivo.component.html',
  styleUrls: ['./cargar-archivo.component.scss']
})
export class CargarArchivoComponent implements OnInit {
  archivo: any;
  constructor() { }
  ngOnInit(): void {}

}
