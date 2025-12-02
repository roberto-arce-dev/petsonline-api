import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { AgendarServicioDto } from './dto/agendar-servicio.dto';
import { Reserva, ReservaDocument } from './schemas/reserva.schema';

@Injectable()
export class ReservaService {
  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<ReservaDocument>,
  ) {}

  private getPopulateOptions() {
    return [
      { path: 'mascota', select: 'nombre especie raza' },
      { path: 'servicio', select: 'nombre precio duracion' },
      { path: 'cliente', select: 'nombre email telefono' },
    ];
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`ID de ${fieldName} inválido`);
    }
    return new Types.ObjectId(value);
  }

  private parseFechaReserva(value: string): Date {
    const fecha = new Date(value);
    if (isNaN(fecha.getTime())) {
      throw new BadRequestException('Fecha de reserva inválida');
    }
    return fecha;
  }

  private async ensureDisponibilidad(
    servicioId: Types.ObjectId,
    fechaReserva: Date,
    excludeId?: Types.ObjectId,
  ) {
    const query: FilterQuery<ReservaDocument> = {
      servicio: servicioId,
      fechaReserva,
      estado: { $in: ['pendiente', 'confirmada'] },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existente = await this.reservaModel.findOne(query).lean();
    if (existente) {
      throw new ConflictException(
        'La fecha y hora ya están reservadas para este servicio',
      );
    }
  }

  private buildReservaData(input: {
    clienteId: string;
    mascotaId: string;
    servicioId: string;
    fechaReserva: string;
    observaciones?: string;
    estado?: Reserva['estado'];
    imagen?: string;
    imagenThumbnail?: string;
  }) {
    return {
      cliente: this.toObjectId(input.clienteId, 'cliente'),
      mascota: this.toObjectId(input.mascotaId, 'mascota'),
      servicio: this.toObjectId(input.servicioId, 'servicio'),
      fechaReserva: this.parseFechaReserva(input.fechaReserva),
      observaciones: input.observaciones,
      estado: input.estado ?? 'pendiente',
      imagen: input.imagen,
      imagenThumbnail: input.imagenThumbnail,
    };
  }

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const data = this.buildReservaData(createReservaDto);
    await this.ensureDisponibilidad(data.servicio, data.fechaReserva);
    const nuevaReserva = await this.reservaModel.create(data);
    return nuevaReserva.populate(this.getPopulateOptions());
  }

  async findAll(): Promise<Reserva[]> {
    return this.reservaModel
      .find()
      .populate(this.getPopulateOptions())
      .sort({ fechaReserva: 1 })
      .exec();
  }

  async findOne(id: string | number): Promise<Reserva> {
    const reserva = await this.reservaModel
      .findById(id)
      .populate(this.getPopulateOptions());
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrado`);
    }
    return reserva;
  }

  async update(
    id: string | number,
    updateReservaDto: UpdateReservaDto,
  ): Promise<Reserva> {
    const reserva = await this.reservaModel.findById(id);
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrado`);
    }

    const updateData: Partial<Reserva> & { fechaReserva?: Date } = {};

    if (updateReservaDto.clienteId) {
      updateData.cliente = this.toObjectId(
        updateReservaDto.clienteId,
        'cliente',
      );
    }
    if (updateReservaDto.mascotaId) {
      updateData.mascota = this.toObjectId(
        updateReservaDto.mascotaId,
        'mascota',
      );
    }
    if (updateReservaDto.servicioId) {
      updateData.servicio = this.toObjectId(
        updateReservaDto.servicioId,
        'servicio',
      );
    }
    if (updateReservaDto.fechaReserva) {
      updateData.fechaReserva = this.parseFechaReserva(
        updateReservaDto.fechaReserva,
      );
    }
    if (updateReservaDto.observaciones !== undefined) {
      updateData.observaciones = updateReservaDto.observaciones;
    }
    if (updateReservaDto.estado) {
      updateData.estado = updateReservaDto.estado;
    }
    if (updateReservaDto.imagen !== undefined) {
      updateData.imagen = updateReservaDto.imagen;
    }
    if (updateReservaDto.imagenThumbnail !== undefined) {
      updateData.imagenThumbnail = updateReservaDto.imagenThumbnail;
    }

    const servicio =
      (updateData.servicio as Types.ObjectId) ??
      (reserva.servicio as Types.ObjectId);
    const fechaReserva =
      updateData.fechaReserva ?? (reserva.fechaReserva as Date);

    if (!servicio || !fechaReserva) {
      throw new BadRequestException(
        'La reserva necesita un servicio y una fecha para actualizarse',
      );
    }

    await this.ensureDisponibilidad(servicio, fechaReserva, reserva._id);

    Object.assign(reserva, updateData);
    await reserva.save();

    return reserva.populate(this.getPopulateOptions());
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.reservaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrado`);
    }
  }

  // Métodos EP3 agregados
  async findByCliente(clienteId: string): Promise<Reserva[]> {
    return this.reservaModel
      .find({ cliente: this.toObjectId(clienteId, 'cliente') })
      .populate(this.getPopulateOptions())
      .sort({ fechaReserva: -1 })
      .exec();
  }

  async findByMascota(mascotaId: string): Promise<Reserva[]> {
    return this.reservaModel
      .find({ mascota: this.toObjectId(mascotaId, 'mascota') })
      .populate(this.getPopulateOptions())
      .sort({ fechaReserva: -1 })
      .exec();
  }

  async agendarServicio(agendarServicioDto: AgendarServicioDto): Promise<Reserva> {
    const data = this.buildReservaData({
      ...agendarServicioDto,
      estado: 'confirmada',
    });

    await this.ensureDisponibilidad(data.servicio, data.fechaReserva);

    const nuevaReserva = await this.reservaModel.create(data);
    return nuevaReserva.populate(this.getPopulateOptions());
  }

  async getProximasReservas(clienteId: string): Promise<Reserva[]> {
    const fechaActual = new Date();
    return this.reservaModel
      .find({
        cliente: this.toObjectId(clienteId, 'cliente'),
        fechaReserva: { $gte: fechaActual },
        estado: { $in: ['confirmada', 'pendiente'] },
      })
      .populate(this.getPopulateOptions())
      .sort({ fechaReserva: 1 })
      .exec();
  }
}
