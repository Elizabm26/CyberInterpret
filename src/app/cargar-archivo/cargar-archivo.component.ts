import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, lastValueFrom, Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { app } from '../firebase';
import { getGenerativeModel, getVertexAI, Schema } from 'firebase/vertexai';
import { Router } from '@angular/router';

export interface Analysis {
  id: string;
  name: string;
  size: number;
  fileURL: string;
  createdAt: string;
  result?: any;
}

@Component({
  selector: 'app-cargar-archivo',
  templateUrl: './cargar-archivo.component.html',
  styleUrls: ['./cargar-archivo.component.scss']
})
export class CargarArchivoComponent implements OnInit {
  message: string = '';
  fileUploaded: boolean = false;
  uploadPercent!: Observable<number | undefined>;
  downloadURL!: Observable<string>;
  file!: File;
  document!: Analysis;
  isAnalyzing: boolean = false;

  private analysisCollection: AngularFirestoreCollection<Analysis>;


  constructor(
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private _router: Router,
  ) {
    this.analysisCollection = afs.collection<Analysis>('analysis');
  }

  ngOnInit(): void { }

  onFileSelected(event: any) {
    const file: File = event?.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
    this.file = file;

    const filePath = file.name;
    const fileRef = this.storage.ref(filePath);
    const task = fileRef.put(file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();

        lastValueFrom(fileRef.getDownloadURL()).then((url: string) => {
          const id = this.afs.createId();

          const data: Analysis = {
            id: id,
            name: file.name,
            size: file.size,
            fileURL: url,
            createdAt: new Date().toISOString()
          };
          this.analysisCollection.doc(id).set(data).then(() => {
            this.document = data;
          });
          this.fileUploaded = true;
        });

      })
    ).subscribe()

  }

  // onFileSelected(event: any) {
  //   debugger;
  //   const file: File = event?.target.files[0];
  //   if (file) {
  //     this.uploadFile(file);
  //   }

  //   const id = this.afs.createId()

  //   const data: Analysis = {
  //     id: id,
  //     name: file.name,
  //     fileURL: `http://localhost/files/${file.name}`,
  //     createdAt: new Date().toISOString()
  //   };

  //   // Guardamos los datos.
  //   this.analysisCollection.doc(id).set(data);

  // }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
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


  async fileToGenerativePart(file: File): Promise<any> {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result!.toString().split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  analyzeFile() {
    const jsonSchema = Schema.object({
      properties: {
        title: Schema.string(),
        executiveSummary: Schema.string({ description: 'El resumen ejecutivo se lo puede encontrar en la sección "Resumen ejecutivo"' }),
        breach: Schema.string({ description: '¿Cuáles son las brechas de seguridad identificadas en el documento?' }),
        result: Schema.object({
          properties: {
            identify: Schema.object({
              properties: {
                description: Schema.string({ description: 'Dentro de la sección "Identify", se encuentra información relacionada con la identificación. ¿Podrías proporcionarme un resumen completo de todo el contenido de esta sección?' }),
                nivel: Schema.number({ description: '¿Podrías proporcionarme el porcentaje con decimal de cumplimiento en el reporte relacionado con la identificación?' }),
                cumple: Schema.number({ description: 'Porcentaje de cumplimiento en la sección "Identify". Una valoración general sobre el cumplimiento con los estándares de seguridad.' }),
                parcial: Schema.number({ description: 'Porcentaje de cumplimiento parcial en la sección "Identify". Una valoración general sobre las áreas parcialmente cubiertas.' }),
                noCumple: Schema.number({ description: 'Porcentaje de no cumplimiento en la sección "Identify". Una valoración general sobre las áreas que no cumplen con los estándares de seguridad.' })
              }
            }),
            protect: Schema.object({
              properties: {
                description: Schema.string({ description: 'Dentro de la sección "Protect", se encuentra información relacionada con la protección. ¿Podrías proporcionarme un resumen completo de todo el contenido de esta sección?' }),
                nivel: Schema.number({ description: '¿Podrías proporcionarme el porcentaje con decimal de cumplimiento en el reporte relacionado con la protección?' }),
                cumple: Schema.number({ description: 'Porcentaje de cumplimiento en la sección "Protect". Una valoración general sobre el cumplimiento con los estándares de seguridad.' }),
                parcial: Schema.number({ description: 'Porcentaje de cumplimiento parcial en la sección "Protect". Una valoración general sobre las áreas parcialmente cubiertas.' }),
                noCumple: Schema.number({ description: 'Porcentaje de no cumplimiento en la sección "Protect". Una valoración general sobre las áreas que no cumplen con los estándares de seguridad.' })
              }
            }),
            detect: Schema.object({
              properties: {
                description: Schema.string({ description: 'Dentro de la sección "Detect", se aborda información sobre la detección. ¿Podrías proporcionarme un resumen detallado de todo lo que se cubre en esta sección?' }),
                nivel: Schema.number({ description: '¿Podrías proporcionarme el porcentaje con decimal de cumplimiento en el reporte relacionado con la detección?' }),
                cumple: Schema.number({ description: 'Porcentaje de cumplimiento en la sección "Detect". Una valoración general sobre el cumplimiento con los estándares de seguridad.' }),
                parcial: Schema.number({ description: 'Porcentaje de cumplimiento parcial en la sección "Detect". Una valoración general sobre las áreas parcialmente cubiertas.' }),
                noCumple: Schema.number({ description: 'Porcentaje de no cumplimiento en la sección "Detect". Una valoración general sobre las áreas que no cumplen con los estándares de seguridad.' })
              }
            }),
            respond: Schema.object({
              properties: {
                description: Schema.string({ description: 'En la sección "Respond", se habla sobre cómo responder a incidentes. ¿Podrías proporcionarme un resumen completo de toda la información relevante en esta sección?' }),
                nivel: Schema.number({ description: '¿Podrías proporcionarme el porcentaje con decimal de cumplimiento en el reporte relacionado con la respuesta?' }),
                cumple: Schema.number({ description: 'Porcentaje de cumplimiento en la sección "Respond". Una valoración general sobre el cumplimiento con los estándares de seguridad.' }),
                parcial: Schema.number({ description: 'Porcentaje de cumplimiento parcial en la sección "Respond". Una valoración general sobre las áreas parcialmente cubiertas.' }),
                noCumple: Schema.number({ description: 'Porcentaje de no cumplimiento en la sección "Respond". Una valoración general sobre las áreas que no cumplen con los estándares de seguridad.' })
              }
            }),
            recover: Schema.object({
              properties: {
                description: Schema.string({ description: 'Dentro de la sección "Recover", se exploran las estrategias de recuperación. ¿Podrías proporcionarme un resumen completo de los temas tratados en esta sección?' }),
                nivel: Schema.number({ description: '¿Podrías proporcionarme el porcentaje con decimal de cumplimiento en el reporte relacionado con la recuperación?' }),
                cumple: Schema.number({ description: 'Porcentaje de cumplimiento en la sección "Recover". Una valoración general sobre el cumplimiento con los estándares de seguridad.' }),
                parcial: Schema.number({ description: 'Porcentaje de cumplimiento parcial en la sección "Recover". Una valoración general sobre las áreas parcialmente cubiertas.' }),
                noCumple: Schema.number({ description: 'Porcentaje de no cumplimiento en la sección "Recover". Una valoración general sobre las áreas que no cumplen con los estándares de seguridad.' })
              }
            }),
            estadoGeneral: Schema.object({
              properties: {
                cumple: Schema.number({ description: 'Porcentaje de cumplimiento en el reporte', example: '0.1' }),
                parcial: Schema.number({ description: 'Porcentaje de cumplimiento parcial en el reporte', example: '0.2' }),
                noCumple: Schema.number({ description: 'Porcentaje de no cumplimiento en el reporte', example: '0.3' })
              }
            }),
            alertasYRecomendaciones: Schema.object({
              properties: {
                alertas: Schema.array({
                  items: Schema.string(),
                  description: 'Lista de alertas relacionadas con el análisis general de seguridad.'
                }),
                recomendaciones: Schema.array({
                  items: Schema.string(),
                  description: 'Lista de recomendaciones generales para mejorar la seguridad.'
                })
              }
            })
          }
        })
      }
    });



    const vertexAI = getVertexAI(app);

    const model = getGenerativeModel(vertexAI, {
      model: 'gemini-2.0-flash', generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
      }
    });



    const run = async () => {
      if (!this.file) {
        console.error('No file selected.');
        return;
      }

      try {
        this.isAnalyzing = true;
        const prompt = "Analiza el contenido del siguiente documento:";
        const imagePart = await this.fileToGenerativePart(this.file);

        const result = await model.generateContent([prompt, imagePart]);
        const resultParsed = JSON.parse(result.response.text());
        console.log(resultParsed);
        this.document.result = resultParsed;
        this.analysisCollection.doc(this.document.id).set(this.document, { merge: true }).then(() => {
          console.log('Felicidades tu análisis esta completado');
          this._router.navigate(['visualizacion', this.document.id]);
        });

      } catch (error) {
        console.error('Error during analysis:', error);
      } finally {
        this.isAnalyzing = false;
      }
    };

    run();

  }
}
