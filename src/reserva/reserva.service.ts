import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { AgendarServicioDto } from './dto/agendar-servicio.dto';
import { Reserva, ReservaDocument } from './schemas/reserva.schema';

@Injectable()
export class ReservaService {
  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<ReservaDocument>,
  ) {}

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const nuevoReserva = await this.reservaModel.create(createReservaDto);
    return nuevoReserva;
  }

  async findAll(): Promise<Reserva[]> {
    const reservas = await this.reservaModel.find();
    return reservas;
  }

  async findOne(id: string | number): Promise<Reserva> {
    const reserva = await this.reservaModel.findById(id)
    .populate('mascota', 'nombre especie raza')
    .populate('servicio', 'nombre precio duracion');
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrado`);
    }
    return reserva;
  }

  async update(id: string | number, updateReservaDto: UpdateReservaDto): Promise<Reserva> {
    const reserva = await this.reservaModel.findByIdAndUpdate(id, updateReservaDto, { new: true })
    .populate('mascota', 'nombre especie raza')
    .populate('servicio', 'nombre precio duracion');
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrado`);
    }
    return reserva;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.reservaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrado`);
    }
  }

  // Métodos EP3 agregados
  async findByCliente(clienteId: string): Promise<Reserva[]> {
    return this.reservaModel.find({ cliente: new Types.ObjectId(clienteId) })
      .populate('mascota', 'nombre especie raza')
      .populate('servicio', 'nombre precio duracion')
      .sort({ fechaReserva: -1 })
      .exec();
  }

  async findByMascota(mascotaId: string): Promise<Reserva[]> {
    return this.reservaModel.find({ mascota: new Types.ObjectId(mascotaId) })
      .populate('mascota', 'nombre especie raza')
      .populate('servicio', 'nombre precio duracion')
      .sort({ fechaReserva: -1 })
      .exec();
  }

  async agendarServicio(agendarServicioDto: AgendarServicioDto): Promise<Reserva> {
    const nuevaReserva = await this.reservaModel.create({
      cliente: new Types.ObjectId(agendarServicioDto.clienteId),
      mascota: new Types.ObjectId(agendarServicioDto.mascotaId),
      servicio: new Types.ObjectId(agendarServicioDto.servicioId),
      fechaReserva: new Date(agendarServicioDto.fechaReserva),
      observaciones: agendarServicioDto.observaciones,
      estado: 'confirmada',
      fechaCreacion: new Date(),
      nombre: `Reserva - ${new Date(agendarServicioDto.fechaReserva).toLocaleDateString()}`
    });
    return nuevaReserva.populate(['mascota', 'servicio']);
  }

  async getProximasReservas(clienteId: string): Promise<Reserva[]> {
    const fechaActual = new Date();
    return this.reservaModel.find({
      cliente: new Types.ObjectId(clienteId),
      fechaReserva: { $gte: fechaActual },
      estado: { $in: ['confirmada', 'pendiente'] }
    })
    .populate('mascota', 'nombre especie raza')
    .populate('servicio', 'nombre precio duracion')
    .sort({ fechaReserva: 1 })
    .exec();
  }
}
