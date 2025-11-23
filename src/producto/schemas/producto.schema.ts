import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductoDocument = Producto & Document;

@Schema({ timestamps: true })
export class Producto {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop({ enum: ['alimento', 'juguete', 'accesorio', 'medicina'] })
  categoria?: string;

  @Prop({ min: 0 })
  precio: number;

  @Prop({ default: 0, min: 0 })
  stock?: number;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const ProductoSchema = SchemaFactory.createForClass(Producto);

ProductoSchema.index({ categoria: 1 });
ProductoSchema.index({ nombre: 'text' });
