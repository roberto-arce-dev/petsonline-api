import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservaDocument = Reserva & Document;

@Schema({ timestamps: true })
export class Reserva {
  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  cliente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Mascota', required: true })
  mascota: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServicioVeterinario', required: true })
  servicio: Types.ObjectId;

  @Prop({ type: Date, required: true })
  fechaReserva: Date;

  @Prop({ enum: ['pendiente', 'confirmada', 'completada', 'cancelada'], default: 'pendiente' })
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

  @Prop()
  observaciones?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);

ReservaSchema.index({ cliente: 1 });
ReservaSchema.index({ mascota: 1 });
ReservaSchema.index({ servicio: 1 });
ReservaSchema.index({ fechaReserva: 1 });
ReservaSchema.index({ estado: 1 });
ReservaSchema.index(
  { servicio: 1, fechaReserva: 1 },
  {
    unique: true,
    partialFilterExpression: { estado: { $ne: 'cancelada' } },
  },
);
