import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RobleService } from 'src/roble/roble.service';
import { CreateTorneoDto } from './dto/create-torneo.dto';
import { CreateResultadoDto } from './dto/create-resultado.dto';
import { EstadoTorneo } from './enums/estado-torneo.enum';
import { generarCodigoAcceso } from 'src/common/utils/codigo-acceso.util';
import { UpdateTorneoDto } from './dto/update-torneo.dto';

type TorneoRecord = {
  _id?: string;
  nombre: string;
  descripcion: string;
  creadorId: string;
  creadorNombre?: string | null;
  codigoAcceso: string | null;
  esPublico: boolean;
  estado: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  recurrencia: string | null;
  configuracion: Record<string, unknown> | null;
  fechaCreacion: string;
};

type ParticipanteRecord = {
  _id?: string;
  torneoId: string;
  usuarioId: string;
  fechaUnion: string;
};

type ResultadoRecord = {
  _id?: string;
  torneoId: string;
  usuarioId: string;
  puntaje: number;
  tiempo: number;
  fechaRegistro: string;
};

type PerfilBasicoRecord = {
  _id?: string;
  usuarioId: string;
  nombre?: string | null;
};

@Injectable()
export class TorneosService {
  private readonly TABLE_TORNEOS = 'Torneos';
  private readonly TABLE_PARTICIPANTES = 'Participantes';
  private readonly TABLE_RESULTADOS = 'ResultadosTorneo';

  constructor(private readonly roble: RobleService) {}

  private isAdminRole(userRole?: string): boolean {
    return String(userRole ?? '').trim().toLowerCase() === 'admin';
  }

  private canManageTournament(
    torneo: TorneoRecord,
    usuarioId: string,
    userRole?: string,
  ): boolean {
    return torneo.creadorId === usuarioId || this.isAdminRole(userRole);
  }

  private toUpperSafe(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().toUpperCase();
  }

  private normalizeUserId(value: unknown): string {
    return String(value ?? '').trim();
  }

  private normalizeCreatorName(value: unknown): string | null {
    const normalized = String(value ?? '').trim();
    if (
      !normalized ||
      normalized === 'undefined' ||
      normalized === 'null'
    ) {
      return null;
    }
    return normalized;
  }

  private extractAuthUsersRows(payload: unknown): Array<Record<string, unknown>> {
    if (Array.isArray(payload)) {
      return payload as Array<Record<string, unknown>>;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { data?: unknown }).data)
    ) {
      return (payload as { data: Array<Record<string, unknown>> }).data;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { users?: unknown }).users)
    ) {
      return (payload as { users: Array<Record<string, unknown>> }).users;
    }

    return [];
  }

  private resolveAuthUserId(row: Record<string, unknown>): string {
    const candidates = [
      row.id,
      row.sub,
      row.uid,
      row.userId,
      row.usuarioId,
      row._id,
    ];

    for (const candidate of candidates) {
      const normalized = this.normalizeUserId(candidate);
      if (normalized) {
        return normalized;
      }
    }

    return '';
  }

  private resolveAuthUserName(row: Record<string, unknown>): string {
    const candidates = [row.name, row.nombre, row.fullName];

    for (const candidate of candidates) {
      const normalized = this.normalizeCreatorName(candidate);
      if (normalized) {
        return normalized;
      }
    }

    if (typeof row.email === 'string') {
      const email = row.email.trim();
      if (email) {
        return email.split('@')[0] || email;
      }
    }

    return '';
  }

  private async getAuthUserNamesByIdSafe(
    accessToken: string,
    userIds: Set<string>,
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!accessToken || !userIds.size) {
      return map;
    }

    try {
      const payload = await this.roble.listAuthUsers(accessToken);
      const rows = this.extractAuthUsersRows(payload);

      for (const row of rows) {
        const userId = this.resolveAuthUserId(row);
        if (!userId || !userIds.has(userId)) {
          continue;
        }

        const userName = this.resolveAuthUserName(row);
        if (!userName) {
          continue;
        }

        map.set(userId, userName);
      }
    } catch {
      return map;
    }

    return map;
  }

  private toEstadoTorneo(value: string): EstadoTorneo | null {
    // Si el string coincide con algún valor del enum, lo devolvemos como enum
    if ((Object.values(EstadoTorneo) as string[]).includes(value)) {
      return value as EstadoTorneo;
    }
    return null;
  }

  private withComputedEstado(torneo: TorneoRecord): TorneoRecord {
    const nuevoEstado = this.calcularEstadoAutomatico(torneo);
    if (!nuevoEstado) return torneo;
    if (torneo.estado === nuevoEstado) return torneo;
    return {
      ...torneo,
      estado: nuevoEstado,
    };
  }

  private isBrowsableState(value: string): boolean {
    const estado = this.toEstadoTorneo(value);

    return (
      estado === EstadoTorneo.PROGRAMADO ||
      estado === EstadoTorneo.ACTIVO ||
      estado === EstadoTorneo.PAUSADO ||
      estado === EstadoTorneo.FINALIZADO
    );
  }

  private canSeeTournamentInList(
    torneo: TorneoRecord,
    usuarioId?: string,
    userRole?: string,
    joinedTournamentIds: Set<string> = new Set(),
  ): boolean {
    const normalizedUserId = String(usuarioId ?? '').trim();

    if (this.canManageTournament(torneo, normalizedUserId, userRole)) {
      return true;
    }

    if (!this.isBrowsableState(torneo.estado)) {
      return false;
    }

    if (torneo.esPublico) {
      return true;
    }

    return Boolean(torneo._id && joinedTournamentIds.has(torneo._id));
  }

  private canOpenTournamentDetail(
    torneo: TorneoRecord,
    usuarioId?: string,
    userRole?: string,
    joinedTournamentIds: Set<string> = new Set(),
  ): boolean {
    const normalizedUserId = String(usuarioId ?? '').trim();

    if (this.canManageTournament(torneo, normalizedUserId, userRole)) {
      return true;
    }

    if (torneo._id && joinedTournamentIds.has(torneo._id)) {
      return true;
    }

    return this.isBrowsableState(torneo.estado);
  }

  private sanitizeTournamentForViewer(
    torneo: TorneoRecord,
    usuarioId?: string,
    userRole?: string,
  ): TorneoRecord {
    const normalizedUserId = String(usuarioId ?? '').trim();
    if (this.canManageTournament(torneo, normalizedUserId, userRole)) {
      return torneo;
    }

    return {
      ...torneo,
      codigoAcceso: null,
    };
  }

  private sanitizeTournamentForPublic(torneo: TorneoRecord): TorneoRecord {
    return this.sanitizeTournamentForViewer(torneo);
  }

  private async getJoinedTournamentIds(
    accessToken: string,
    usuarioId: string,
  ): Promise<Set<string>> {
    const normalizedUserId = String(usuarioId ?? '').trim();
    if (!normalizedUserId) {
      return new Set();
    }

    const rows = await this.roble.read<ParticipanteRecord>(
      accessToken,
      this.TABLE_PARTICIPANTES,
      { usuarioId: normalizedUserId },
    );

    return new Set(
      rows
        .map((row) => String(row.torneoId ?? '').trim())
        .filter(Boolean),
    );
  }

  private async obtenerTorneoPublicoPorId(
    torneoId: string,
  ): Promise<TorneoRecord | null> {
    const rows = await this.roble.readWithPublicToken<TorneoRecord>(
      this.TABLE_TORNEOS,
      { _id: torneoId },
    );

    return rows[0] ?? null;
  }

  private async attachCreatorNames(
    torneos: TorneoRecord[],
    options: { accessToken?: string; usePublicToken?: boolean } = {},
  ): Promise<TorneoRecord[]> {
    if (!torneos.length) {
      return torneos;
    }

    const creatorIds = Array.from(
      new Set(
        torneos
          .filter(
            (torneo) => !this.normalizeCreatorName(torneo.creadorNombre),
          )
          .map((torneo) => this.normalizeUserId(torneo.creadorId))
          .filter(Boolean),
      ),
    );

    if (!creatorIds.length) {
      return torneos;
    }

    const creatorNames = new Map<string, string>();

    await Promise.all(
      creatorIds.map(async (creatorId) => {
        try {
          const profiles = options.usePublicToken
            ? await this.roble.readWithPublicToken<PerfilBasicoRecord>('Perfil', {
                usuarioId: creatorId,
              })
            : await this.roble.read<PerfilBasicoRecord>(
                options.accessToken ?? '',
                'Perfil',
                { usuarioId: creatorId },
              );

          const creatorName = this.normalizeCreatorName(profiles[0]?.nombre);
          if (creatorName) {
            creatorNames.set(creatorId, creatorName);
          }
        } catch {
          // Si no podemos leer el perfil, conservamos el fallback al id.
        }
      }),
    );

    if (options.accessToken && creatorIds.length) {
      const authCreatorNames = await this.getAuthUserNamesByIdSafe(
        options.accessToken,
        new Set(creatorIds),
      );

      for (const [creatorId, creatorName] of authCreatorNames.entries()) {
        if (!creatorNames.has(creatorId)) {
          creatorNames.set(creatorId, creatorName);
        }
      }
    }

    return torneos.map((torneo) => {
      const creatorId = this.normalizeUserId(torneo.creadorId);
      const creatorName = creatorNames.get(creatorId);
      if (!creatorName) {
        return torneo;
      }

      return {
        ...torneo,
        creadorNombre: creatorName,
      };
    });
  }
  private calcularEstadoAutomatico(torneo: TorneoRecord): EstadoTorneo | null {
    const estado = this.toEstadoTorneo(torneo.estado);

    // Si no coincide con el enum (estado raro), no tocamos nada
    if (!estado) return null;

    // Estados que NO deben ser sobre-escritos por fechas
    if (estado === EstadoTorneo.CANCELADO) return null;
    if (estado === EstadoTorneo.PAUSADO) return null;
    if (estado === EstadoTorneo.BORRADOR) return null;

    const inicio = new Date(torneo.fechaInicio);
    const fin = new Date(torneo.fechaFin);
    const ahora = new Date();

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      return null;
    }

    if (ahora > fin) return EstadoTorneo.FINALIZADO;
    if (ahora >= inicio && ahora <= fin) return EstadoTorneo.ACTIVO;

    return EstadoTorneo.PROGRAMADO;
  }

  private async syncEstadoPorFecha(
    accessToken: string,
    torneo: TorneoRecord,
  ): Promise<TorneoRecord> {
    const nuevoEstado = this.calcularEstadoAutomatico(torneo);
    if (!nuevoEstado) return torneo;

    const estadoActual = this.toEstadoTorneo(torneo.estado);
    if (estadoActual === nuevoEstado) return torneo;

    if (!torneo._id) return torneo;

    const actualizado = await this.roble.update<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
      '_id',
      torneo._id,
      {
        estado: nuevoEstado,
      },
    );

    return actualizado;
  }

  async obtenerTorneoDetalle(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
    userRole: string,
  ): Promise<TorneoRecord> {
    const torneo = await this.obtenerTorneoPorId(accessToken, torneoId);
    if (!torneo) {
      throw new NotFoundException('Torneo no existe');
    }

    const sincronizado = await this.syncEstadoPorFecha(accessToken, torneo);
    const joinedTournamentIds = await this.getJoinedTournamentIds(
      accessToken,
      usuarioId,
    );

    if (
      !this.canOpenTournamentDetail(
        sincronizado,
        usuarioId,
        userRole,
        joinedTournamentIds,
      )
    ) {
      throw new NotFoundException('Torneo no disponible');
    }

    const [enriched] = await this.attachCreatorNames(
      [
        this.sanitizeTournamentForViewer(
          sincronizado,
          usuarioId,
          userRole,
        ),
      ],
      { accessToken },
    );

    return enriched;
  }

  async actualizarEstadoTorneo(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
    userRole: string,
    nuevoEstado: EstadoTorneo,
  ): Promise<TorneoRecord> {
    const torneoBase = await this.obtenerTorneoPorId(accessToken, torneoId);
    if (!torneoBase) {
      throw new NotFoundException('Torneo no existe');
    }

    const torneo = await this.syncEstadoPorFecha(accessToken, torneoBase);

    // El creador o un admin pueden cambiar el estado del torneo
    if (!this.canManageTournament(torneo, usuarioId, userRole)) {
      throw new ForbiddenException(
        'Solo el creador o un admin pueden cambiar el estado del torneo.',
      );
    }

    // No permitimos cambios de estado si el torneo ya está FINALIZADO o CANCELADO
    const estadoActual = this.toEstadoTorneo(torneo.estado);
    if (!estadoActual) {
      throw new BadRequestException('Estado actual inválido en torneo.');
    }

    if (
      estadoActual === EstadoTorneo.FINALIZADO ||
      estadoActual === EstadoTorneo.CANCELADO
    ) {
      throw new BadRequestException(
        'No se puede cambiar el estado de un torneo FINALIZADO o CANCELADO.',
      );
    }

    // Validación de transiciones permitidas
    const allowed: Record<EstadoTorneo, EstadoTorneo[]> = {
      [EstadoTorneo.BORRADOR]: [
        EstadoTorneo.PROGRAMADO,
        EstadoTorneo.CANCELADO,
      ],
      [EstadoTorneo.PROGRAMADO]: [
        EstadoTorneo.ACTIVO,
        EstadoTorneo.PAUSADO,
        EstadoTorneo.CANCELADO,
      ],
      [EstadoTorneo.ACTIVO]: [EstadoTorneo.PAUSADO, EstadoTorneo.CANCELADO],
      [EstadoTorneo.PAUSADO]: [
        EstadoTorneo.PROGRAMADO,
        EstadoTorneo.ACTIVO,
        EstadoTorneo.CANCELADO,
      ],
      [EstadoTorneo.FINALIZADO]: [],
      [EstadoTorneo.CANCELADO]: [],
    };

    const estadoDestino = this.toUpperSafe(nuevoEstado) as EstadoTorneo;
    if (!this.toEstadoTorneo(estadoDestino)) {
      throw new BadRequestException(`Estado destino inválido: ${estadoDestino}`);
    }
    if (estadoDestino === estadoActual) {
      return torneo;
    }

    const permitidos = allowed[estadoActual] ?? [];
    if (!permitidos.includes(estadoDestino)) {
      throw new BadRequestException(
        `Transición inválida: ${estadoActual} -> ${estadoDestino}`,
      );
    }

    // Guardamos
    if (!torneo._id)
      throw new BadRequestException('Torneo sin _id (no se puede actualizar).');

    const actualizado = await this.roble.update<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
      '_id',
      torneo._id,
      { estado: estadoDestino },
    );
    return actualizado;
  }

  async editarTorneo(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
    userRole: string,
    dto: UpdateTorneoDto,
  ): Promise<TorneoRecord> {
    const torneoBase = await this.obtenerTorneoPorId(accessToken, torneoId);
    if (!torneoBase) {
      throw new NotFoundException('Torneo no existe');
    }

    const torneo = await this.syncEstadoPorFecha(accessToken, torneoBase);

    if (!this.canManageTournament(torneo, usuarioId, userRole)) {
      throw new ForbiddenException(
        'Solo el creador o un admin pueden editar el torneo.',
      );
    }

    const estadoActual = this.toEstadoTorneo(torneo.estado);
    if (!estadoActual) {
      throw new BadRequestException('Estado actual invalido en torneo.');
    }

    if (
      (estadoActual === EstadoTorneo.FINALIZADO ||
        estadoActual === EstadoTorneo.CANCELADO) &&
      !this.isAdminRole(userRole)
    ) {
      throw new BadRequestException(
        'No se puede editar un torneo FINALIZADO o CANCELADO.',
      );
    }

    if (estadoActual === EstadoTorneo.ACTIVO && !this.isAdminRole(userRole)) {
      const tipoActual = this.toUpperSafe(torneo.tipo);
      const tipoNuevo =
        dto.tipo !== undefined ? this.toUpperSafe(dto.tipo) : undefined;
      const cambioTipo = Boolean(tipoNuevo && tipoNuevo !== tipoActual);
      const cambioFechaInicio =
        dto.fechaInicio !== undefined &&
        String(dto.fechaInicio).trim() !== String(torneo.fechaInicio).trim();
      const cambioFechaFin =
        dto.fechaFin !== undefined &&
        String(dto.fechaFin).trim() !== String(torneo.fechaFin).trim();

      if (cambioTipo || cambioFechaInicio || cambioFechaFin) {
        throw new BadRequestException(
          'No se puede cambiar el tipo ni las fechas de un torneo ACTIVO.',
        );
      }
    }

    const updates: Record<string, unknown> = {};

    if (dto.nombre !== undefined) updates.nombre = dto.nombre;
    if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion;
    if (dto.tipo !== undefined) {
      const tipo = this.toUpperSafe(dto.tipo);
      if (tipo) updates.tipo = tipo;
    }

    if (dto.fechaInicio !== undefined) updates.fechaInicio = dto.fechaInicio;
    if (dto.fechaFin !== undefined) updates.fechaFin = dto.fechaFin;

    if (dto.recurrencia !== undefined) {
      const recurrencia = this.toUpperSafe(dto.recurrencia);
      if (recurrencia) updates.recurrencia = recurrencia;
    }

    if (dto.configuracion !== undefined) {
      updates.configuracion = dto.configuracion;
    }

    if (dto.esPublico !== undefined) {
      updates.esPublico = dto.esPublico;

      if (dto.esPublico === false) {
        const codigoExistente = torneo.codigoAcceso;
        const codigo = codigoExistente ?? generarCodigoAcceso(6);
        updates.codigoAcceso = codigo;
      }
    }

    if (!torneo._id) {
      throw new BadRequestException(
        'Torneo sin _id (no se puede actualizar).',
      );
    }

    const actualizado = await this.roble.update<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
      '_id',
      torneo._id,
      updates,
    );

    const sincronizado = await this.syncEstadoPorFecha(
      accessToken,
      actualizado,
    );
    return sincronizado;
  }

  async cancelarTorneo(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
    userRole: string,
  ): Promise<TorneoRecord> {
    const torneoBase = await this.obtenerTorneoPorId(accessToken, torneoId);
    if (!torneoBase) throw new Error('Torneo no existe');

    const torneo = await this.syncEstadoPorFecha(accessToken, torneoBase);

    // El creador o un admin pueden cancelar el torneo
    if (!this.canManageTournament(torneo, usuarioId, userRole)) {
      throw new Error(
        'Solo el creador o un admin pueden cancelar el torneo.',
      );
    }

    const estadoActual = this.toEstadoTorneo(torneo.estado);
    if (!estadoActual) throw new Error('Estado actual inválido en torneo.');

    // Si ya está cancelado, lo devolvemos tal cual
    if (estadoActual === EstadoTorneo.CANCELADO) {
      return torneo;
    }

    // No se puede cancelar si ya finalizó
    if (estadoActual === EstadoTorneo.FINALIZADO) {
      throw new Error('No se puede cancelar un torneo FINALIZADO.');
    }

    if (!torneo._id) {
      throw new Error('Torneo sin _id (no se puede actualizar).');
    }

    const actualizado = await this.roble.update<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
      '_id',
      torneo._id,
      { estado: EstadoTorneo.CANCELADO },
    );

    return actualizado;
  }

  async listarTorneos(
    accessToken: string,
    usuarioId: string,
    userRole: string,
  ): Promise<TorneoRecord[]> {
    const torneos = await this.roble.read<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
    );
    const joinedTournamentIds = await this.getJoinedTournamentIds(
      accessToken,
      usuarioId,
    );

    const sincronizados = await Promise.all(
      torneos.map(async (t) => {
        try {
          return await this.syncEstadoPorFecha(accessToken, t);
        } catch {
          return t;
        }
      }),
    );

    const visibles = sincronizados
      .filter((torneo) =>
        this.canSeeTournamentInList(
          torneo,
          usuarioId,
          userRole,
          joinedTournamentIds,
        ),
      )
      .map((torneo) =>
        this.sanitizeTournamentForViewer(torneo, usuarioId, userRole),
      );

    return this.attachCreatorNames(visibles, { accessToken });
  }

  async listarTorneosPublicos(): Promise<TorneoRecord[]> {
    const torneos = await this.roble.readWithPublicToken<TorneoRecord>(
      this.TABLE_TORNEOS,
    );

    const visibles = torneos
      .map((torneo) => this.withComputedEstado(torneo))
      .filter((torneo) => this.canSeeTournamentInList(torneo))
      .map((torneo) => this.sanitizeTournamentForPublic(torneo));

    return this.attachCreatorNames(visibles, { usePublicToken: true });
  }

  // Aqui crearíamos un nuevo torneo, insertando un nuevo registro en la tabla "Torneos" de ROBLE
  async crearTorneo(
    accessToken: string,
    creadorId: string,
    creadorNombre: string | null,
    dto: CreateTorneoDto,
  ): Promise<TorneoRecord> {
    const esPublico = dto.esPublico;
    const codigoAcceso = esPublico ? undefined : generarCodigoAcceso(6);
    const torneo: TorneoRecord = {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      creadorId,
      creadorNombre,
      codigoAcceso: dto.codigoAcceso ?? null,
      esPublico: dto.esPublico,
      estado: EstadoTorneo.BORRADOR,
      tipo: this.toUpperSafe(dto.tipo),
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      recurrencia: this.toUpperSafe(dto.recurrencia ?? 'NINGUNA'),
      configuracion: dto.configuracion ?? {},
      fechaCreacion: new Date().toISOString(),
    };

    if (!esPublico && codigoAcceso) {
      torneo.codigoAcceso = codigoAcceso;
    }

    const result = await this.roble.insert<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
      [torneo],
    );

    const inserted = result.inserted[0];
    if (!inserted) {
      const reason =
        result.skipped?.[0]?.reason ?? 'Sin razón reportada por ROBLE';
      throw new Error(
        `No se pudo insertar el resultado por este motivo: ${reason}`,
      );
    }
    return inserted;
  }

  // Aqui obetenemos la información de un torneo específico
  async obtenerTorneoPorId(
    accessToken: string,
    torneoId: string,
  ): Promise<TorneoRecord | null> {
    const rows = await this.roble.read<TorneoRecord>(
      accessToken,
      this.TABLE_TORNEOS,
      { _id: torneoId },
    );
    return rows[0] ?? null;
  }

  async obtenerTorneoDetallePublico(torneoId: string): Promise<TorneoRecord> {
    const torneo = await this.obtenerTorneoPublicoPorId(torneoId);

    if (!torneo) {
      throw new NotFoundException('Torneo no existe');
    }

    const visible = this.withComputedEstado(torneo);
    if (!this.canSeeTournamentInList(visible)) {
      throw new NotFoundException('Torneo no disponible');
    }

    const [enriched] = await this.attachCreatorNames(
      [this.sanitizeTournamentForPublic(visible)],
      { usePublicToken: true },
    );

    return enriched;
  }

  // Aqui actualizamos la información de un torneo específico
  async usuarioYaInscrito(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
  ): Promise<boolean> {
    const rows = await this.roble.read<ParticipanteRecord>(
      accessToken,
      this.TABLE_PARTICIPANTES,
      { torneoId, usuarioId },
    );
    return rows.length > 0;
  }

  // Aqui unimos a un usuario a un torneo específico
  async unirseATorneo(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
    codigoAcceso?: string,
  ): Promise<ParticipanteRecord> {
    const torneoBase = await this.obtenerTorneoPorId(accessToken, torneoId);
    if (!torneoBase) throw new Error('Este torneo no existe');

    const torneo = await this.syncEstadoPorFecha(accessToken, torneoBase);
    const estado = this.toEstadoTorneo(torneo.estado);
    if (
      estado === EstadoTorneo.FINALIZADO ||
      estado === EstadoTorneo.CANCELADO
    ) {
      throw new Error('No se puede unir a un torneo FINALIZADO o CANCELADO.');
    }

    // Evitamos duplicado de inscripción
    const ya = await this.usuarioYaInscrito(accessToken, torneoId, usuarioId);
    if (ya) throw new Error('El usuario ya está inscrito en este torneo');

    // Validamos el código de acceso si el torneo es privado
    if (torneo.esPublico === false) {
      if (!codigoAcceso)
        throw new Error(
          'Este torneo es privado y requiere un código de acceso valido',
        );
      if (!torneo.codigoAcceso || codigoAcceso !== torneo.codigoAcceso) {
        throw new Error('Código de acceso inválido');
      }
    }

    const participante: ParticipanteRecord = {
      torneoId,
      usuarioId,
      fechaUnion: new Date().toISOString(),
    };

    const result = await this.roble.insert<ParticipanteRecord>(
      accessToken,
      this.TABLE_PARTICIPANTES,
      [participante],
    );

    const inserted = result.inserted[0];
    if (!inserted) {
      const reason =
        result.skipped?.[0]?.reason ?? 'Sin razón reportada por ROBLE';
      throw new Error(
        `No se pudo insertar el participante por este motivo: ${reason}`,
      );
    }

    return inserted;
  }

  // Aqui listamos los participantes de un torneo específico
  async listarParticipantes(
    accessToken: string,
    torneoId: string,
  ): Promise<ParticipanteRecord[]> {
    return this.roble.read<ParticipanteRecord>(
      accessToken,
      this.TABLE_PARTICIPANTES,
      { torneoId },
    );
  }

  async listarParticipantesPublico(
    torneoId: string,
  ): Promise<ParticipanteRecord[]> {
    const torneo = await this.obtenerTorneoPublicoPorId(torneoId);
    if (!torneo) {
      throw new NotFoundException('Torneo no existe');
    }

    const visible = this.withComputedEstado(torneo);
    if (!this.canSeeTournamentInList(visible)) {
      throw new NotFoundException('Torneo no disponible');
    }

    return this.roble.readWithPublicToken<ParticipanteRecord>(
      this.TABLE_PARTICIPANTES,
      { torneoId },
    );
  }

  // Aqui registramos el resultado de un participante en un torneo
  async registrarResultado(
    accessToken: string,
    torneoId: string,
    usuarioId: string,
    dto: CreateResultadoDto,
  ): Promise<ResultadoRecord> {
    // Verificamos que el usuario esté inscrito en el torneo
    const participantes = await this.roble.read<ParticipanteRecord>(
      accessToken,
      'Participantes',
      {
        torneoId,
        usuarioId,
      },
    );

    if (!participantes.length) {
      throw new Error('El usuario no está inscrito en este torneo.');
    }

    // Verificamos que el torneo esté ACTIVO
    const torneoBase = await this.obtenerTorneoPorId(accessToken, torneoId);
    if (!torneoBase) throw new Error('Torneo no existe');

    const torneo = await this.syncEstadoPorFecha(accessToken, torneoBase);
    const estado = this.toEstadoTorneo(torneo.estado);
    if (estado !== EstadoTorneo.ACTIVO) {
      throw new Error('Solo se pueden registrar resultados en torneos ACTIVO.');
    }

    // Buscamos el resultado existente
    const existentes = await this.roble.read<ResultadoRecord>(
      accessToken,
      this.TABLE_RESULTADOS,
      { torneoId, usuarioId },
    );

    const nuevoResultado: ResultadoRecord = {
      torneoId,
      usuarioId,
      puntaje: dto.puntaje,
      tiempo: dto.tiempo,
      fechaRegistro: new Date().toISOString(),
    };

    // Si no existe lo instertamos insertar
    if (!existentes.length) {
      const result = await this.roble.insert<ResultadoRecord>(
        accessToken,
        this.TABLE_RESULTADOS,
        [nuevoResultado],
      );

      return result.inserted[0];
    }

    // Si existe verifiacamo si es mejor
    const actual = existentes[0];

    const esMejor =
      dto.puntaje > actual.puntaje ||
      (dto.puntaje === actual.puntaje && dto.tiempo < actual.tiempo);

    if (!esMejor) {
      return actual;
    }

    // Actaulizamos el resultado existente con el nuevo resultado
    if (!actual._id) {
      throw new Error(
        'El resultado existente no trae id (no se puede actualizar).',
      );
    }

    const actualizado = await this.roble.update<ResultadoRecord>(
      accessToken,
      this.TABLE_RESULTADOS,
      '_id',
      actual._id,
      {
        puntaje: nuevoResultado.puntaje,
        tiempo: nuevoResultado.tiempo,
        fechaRegistro: nuevoResultado.fechaRegistro,
      },
    );

    return actualizado;
  }

  // Aqui obtenemos el ranking del torneo, ordenado
  // por puntaje (desc), tiempo (asc) y fechaRegistro (asc)
  async obtenerRanking(
    accessToken: string,
    torneoId: string,
  ): Promise<ResultadoRecord[]> {
    const resultados = await this.roble.read<ResultadoRecord>(
      accessToken,
      this.TABLE_RESULTADOS,
      { torneoId },
    );

    return resultados.sort((a, b) => {
      if (b.puntaje !== a.puntaje) {
        return b.puntaje - a.puntaje;
      }
      if (a.tiempo !== b.tiempo) {
        return a.tiempo - b.tiempo;
      }
      return (
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime()
      );
    });
  }

  async obtenerRankingPublico(torneoId: string): Promise<ResultadoRecord[]> {
    const torneo = await this.obtenerTorneoPublicoPorId(torneoId);
    if (!torneo) {
      throw new NotFoundException('Torneo no existe');
    }

    const visible = this.withComputedEstado(torneo);
    if (!this.canSeeTournamentInList(visible)) {
      throw new NotFoundException('Torneo no disponible');
    }

    const resultados = await this.roble.readWithPublicToken<ResultadoRecord>(
      this.TABLE_RESULTADOS,
      { torneoId },
    );

    return resultados.sort((a, b) => {
      if (b.puntaje !== a.puntaje) {
        return b.puntaje - a.puntaje;
      }
      if (a.tiempo !== b.tiempo) {
        return a.tiempo - b.tiempo;
      }
      return (
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime()
      );
    });
  }

  async obtenerResultadosPorUsuario(
    accessToken: string,
    usuarioId: string,
  ): Promise<ResultadoRecord[]> {
    return this.roble.read<ResultadoRecord>(
      accessToken,
      this.TABLE_RESULTADOS,
      {
        usuarioId,
      },
    );
  }
}


