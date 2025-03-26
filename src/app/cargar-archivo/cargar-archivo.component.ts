import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, lastValueFrom, Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { app } from '../firebase';
import { getGenerativeModel, getVertexAI } from 'firebase/vertexai';

export interface Analysis {
  id: string;
  name: string;
  fileURL: string;
  createdAt: string;
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

  private analysisCollection: AngularFirestoreCollection<Analysis>;


  constructor(
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
  ) {
    this.analysisCollection = afs.collection<Analysis>('analysis');
  }

  ngOnInit(): void { }

  onFileSelected(event: any) {
    const file: File = event?.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
    const fileName = file.name;
    console.log('Nombre del archivo:', fileName);
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
            fileURL: url,
            createdAt: new Date().toISOString()
          };
          this.analysisCollection.doc(id).set(data);
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

  analyzeFile() {
    alert('Análisis en proceso...'); // Aquí puedes agregar la lógica real del análisis

    const vertexAI = getVertexAI(app);
    const model = getGenerativeModel(vertexAI, { model: 'gemini-2.0-flash' });

    const run = async () => {
      // Provide a prompt that contains text
      const prompt = "Write a story about a magic backpack."

      // To generate text output, call generateContent with the text input
      const result = await model.generateContent(prompt);

      const response = result.response;
      const text = response.text();
      console.log(text);
    }

    run();

  }


}
