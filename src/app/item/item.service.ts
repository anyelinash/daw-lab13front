import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:3000/api/items';

  constructor(private http: HttpClient) { }

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getItemById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get(url);
  }

  createItem(item: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, item)
      .pipe(
        catchError((error) => {
          return throwError(error); // o cualquier otra lógica de manejo de errores
        })
      );
  }
  

  updateItem(id: string, item: FormData): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, item);
  }

  deleteItem(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url);
  }

  getSortedItems(sortBy: string, order: string): Observable<any[]> {
    const url = `${this.apiUrl}?sortBy=${sortBy}&order=${order}`;
    console.log('URL para ordenar:', url); // Verifica la URL generada para el ordenamiento
    return this.http.get<any[]>(url)
      .pipe(
        tap(items => console.log('Items ordenados:', items)), // Verifica los items ordenados recibidos
        catchError(error => {
          console.error('Error al obtener items ordenados:', error);
          return throwError(error);
        })
      );
  }  
    

  searchItems(term: string): Observable<any[]> {
    const url = `${this.apiUrl}/search/${term}`;
    return this.http.get<any[]>(url);
  }
}
