import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MascotaDocument = Mascota & Document;

@Schema({ timestamps: true })
export class Mascota {
  @Prop({ required: true })
  nombre: string;

  @Prop({ enum: ['perro', 'gato', 'ave', 'otro'], default: 'perro' })
  especie?: string;

  @Prop()
  raza?: string;

  @Prop({ min: 0 })
  edad?: number;

  @Prop({ min: 0 })
  peso?: number;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  cliente: Types.ObjectId;

  @Prop()
  foto?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const MascotaSchema = SchemaFactory.createForClass(Mascota);

MascotaSchema.index({ cliente: 1 });
MascotaSchema.index({ especie: 1 });
