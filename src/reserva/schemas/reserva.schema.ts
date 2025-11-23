import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservaDocument = Reserva & Document;

@Schema({ timestamps: true })
export class Reserva {
  @Prop({ type: Types.ObjectId, ref: 'Mascota', required: true })
  mascota: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServicioVeterinario', required: true })
  servicio: Types.ObjectId;

  @Prop({ required: true })
  fecha: Date;

  @Prop()
  hora?: string;

  @Prop({ enum: ['pendiente', 'confirmada', 'completada', 'cancelada'], default: 'pendiente' })
  estado?: string;

  @Prop()
  notas?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);

ReservaSchema.index({ mascota: 1 });
ReservaSchema.index({ servicio: 1 });
ReservaSchema.index({ fecha: 1 });
ReservaSchema.index({ estado: 1 });
