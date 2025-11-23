import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServicioVeterinarioDocument = ServicioVeterinario & Document;

@Schema({ timestamps: true })
export class ServicioVeterinario {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop({ default: 30, min: 0 })
  duracion?: number;

  @Prop({ min: 0 })
  precio: number;

  @Prop()
  veterinario?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const ServicioVeterinarioSchema = SchemaFactory.createForClass(ServicioVeterinario);

ServicioVeterinarioSchema.index({ nombre: 1 });
