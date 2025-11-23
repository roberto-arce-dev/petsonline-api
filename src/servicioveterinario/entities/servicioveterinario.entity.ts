export class ServicioVeterinario {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  imagenThumbnail?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ServicioVeterinario>) {
    Object.assign(this, partial);
  }
}
