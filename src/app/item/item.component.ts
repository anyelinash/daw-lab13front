import { Component, OnInit } from '@angular/core';
import { ItemService } from '../item.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {
  items: any[] = [];
  currentItem: any = {};
  successMessage: string = '';
  errorMessage: string = '';
  searchTerm: string = '';
  orderByField: string = '';
  orderByDirection: string = 'asc';
  selectedFile: File | null = null;
  imageError: string = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.getItems();
  }

  // Función para obtener items
  getItems(): void {
    this.itemService.getItems().subscribe((items) => {
      this.items = items;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      this.imageError = 'Por favor seleccione un archivo de imagen válido.';
      this.selectedFile = null;
    } else {
      this.imageError = '';
      this.selectedFile = file;
    }
  }

  // Función para crear un item
  createItem(item: any): void {
    if (!item || !item.calificacion) {
      console.error('El campo "calificacion" es requerido.');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', item.nombre);
    formData.append('descripcion', item.descripcion);
    formData.append('genero', item.genero);
    formData.append('fechaLanzamiento', item.fechaLanzamiento);
    formData.append('calificacion', item.calificacion.toString());
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else {
      this.errorMessage = 'La imagen es requerida.';
      this.autoCloseMessage();
      return;
    }
  
    this.itemService.createItem(formData).subscribe(
      (response) => {
        this.getItems();
        this.successMessage = 'Item creado exitosamente.';
        this.clearForm();
        this.autoCloseMessage();
  
        // Asignar la URL de la imagen devuelta por el servidor
        this.currentItem.imageUrl = response.imageUrl; // Asegúrate de que el servidor devuelva la URL de la imagen
      },
      (error) => {
        this.errorMessage = 'Falló al crear el item.';
        this.autoCloseMessage();
      }
    );
  }
  
  // Función para actualizar un item
  updateItem(id: string, item: any): void {
    const formData = new FormData();
    formData.append('nombre', item.nombre);
    formData.append('descripcion', item.descripcion);
    formData.append('genero', item.genero);
    formData.append('fechaLanzamiento', item.fechaLanzamiento);
    formData.append('calificacion', item.calificacion.toString());
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    this.itemService.updateItem(id, formData).subscribe(
      () => {
        this.getItems();
        this.successMessage = 'Item actualizado exitosamente.';
        this.clearForm();
        this.autoCloseMessage();
      },
      (error) => {
        this.errorMessage = 'Falló al actualizar el item.';
        this.autoCloseMessage();
      }
    );
  }

  // Función para eliminar un item
  deleteItem(id: string): void {
    if (confirm('¿Seguro que quieres eliminar este item?')) {
      this.itemService.deleteItem(id).subscribe(
        () => {
          this.getItems();
          this.successMessage = 'Item eliminado exitosamente.';
          this.autoCloseMessage();
        },
        (error) => {
          this.errorMessage = 'Falló al eliminar el item.';
          this.autoCloseMessage();
        }
      );
    }
  }

  // Función para obtener un item por id
  getItemById(id: string): void {
    this.itemService.getItemById(id).subscribe((item) => {
      this.currentItem = item;
    });
  }

  // Función para editar un item
  editItem(id: string): void {
    this.getItemById(id);
  }

  // Función para limpiar el formulario
  clearForm(): void {
    this.currentItem = {};
    this.selectedFile = null;
  }

  // Función para realizar la búsqueda
  search(): void {
    if (this.searchTerm.trim()) {
      this.itemService.searchItems(this.searchTerm.trim()).subscribe(
        (items) => {
          this.items = items;
        },
        (error) => {
          this.errorMessage = 'Error al buscar elementos.';
          this.autoCloseMessage();
        }
      );
    } else {
      this.getItems();
    }
  }

  // Función para limpiar el término de búsqueda
  clearSearch(): void {
    this.searchTerm = '';
    this.getItems();
  }

  orderByAsc(field: string): void {
    this.orderByField = field;
    this.orderByDirection = 'asc';
    this.getSortedItems(this.orderByField, this.orderByDirection);
  }
  
  orderByDesc(field: string): void {
    this.orderByField = field;
    this.orderByDirection = 'desc';
    this.getSortedItems(this.orderByField, this.orderByDirection);
  }
  
  orderBy(field: string): void {
    if (this.orderByField === field) {
      this.orderByDirection = this.orderByDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderByField = field;
      this.orderByDirection = 'asc';
    }
    this.getSortedItems(this.orderByField, this.orderByDirection);
  }   
  
  getSortedItems(field: string, direction: string): void {
    this.itemService.getSortedItems(field, direction)
      .subscribe(
        (items) => {
          console.log('Items ordenados desde backend:', items);
          // Ordenar los items en el frontend antes de asignarlos
          this.items = this.sortItems(items, field, direction);
          console.log('Items ordenados en this.items:', this.items);
        },
        (error) => {
          console.error('Error al obtener items ordenados:', error);
        }
      );
  }
  
  sortItems(items: any[], field: string, direction: string): any[] {
    return items.sort((a, b) => {
      if (direction === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }
   
  
  trackByItemId(index: number, item: any): string {
    return item._id; // O el campo único que identifique cada item
  }  
  
  // Función para cerrar el mensaje de éxito
  closeSuccessMessage(): void {
    this.successMessage = '';
  }

  // Función para cerrar el mensaje de error
  closeErrorMessage(): void {
    this.errorMessage = '';
  }

  // Función para cerrar automáticamente los mensajes después de un tiempo
  autoCloseMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000); // Cierra los mensajes después de 5 segundos
  }
}
