import { RobleService } from 'src/roble/roble.service';
import { TorneosService } from './torneos.service';

type MockRobleService = jest.Mocked<
  Pick<
    RobleService,
    'read' | 'readWithPublicToken' | 'update' | 'insert' | 'listAuthUsers'
  >
>;

describe('TorneosService historical access', () => {
  let service: TorneosService;
  let roble: MockRobleService;

  function matchesFilter(
    row: Record<string, unknown>,
    filters?: Record<string, unknown>,
  ) {
    if (!filters || !Object.keys(filters).length) {
      return true;
    }

    return Object.entries(filters).every(
      ([key, value]) => row[key] === value,
    );
  }

  function seedData(options?: {
    torneos?: Array<Record<string, unknown>>;
    participantes?: Array<Record<string, unknown>>;
    resultados?: Array<Record<string, unknown>>;
    perfiles?: Array<Record<string, unknown>>;
  }) {
    const torneos = options?.torneos ?? [];
    const participantes = options?.participantes ?? [];
    const resultados = options?.resultados ?? [];
    const perfiles = options?.perfiles ?? [];

    roble.read.mockImplementation(
      async (_token, table, filters?: Record<string, unknown>) => {
        if (table === 'Torneos') {
          return torneos.filter((row) => matchesFilter(row, filters));
        }
        if (table === 'Participantes') {
          return participantes.filter((row) => matchesFilter(row, filters));
        }
        if (table === 'ResultadosTorneo') {
          return resultados.filter((row) => matchesFilter(row, filters));
        }
        if (table === 'Perfil') {
          return perfiles.filter((row) => matchesFilter(row, filters));
        }
        return [];
      },
    );
  }

  beforeEach(() => {
    roble = {
      read: jest.fn(),
      readWithPublicToken: jest.fn(),
      update: jest.fn(),
      insert: jest.fn(),
      listAuthUsers: jest.fn(),
    };

    roble.readWithPublicToken.mockResolvedValue([]);
    roble.update.mockImplementation(async (_token, _table, _idField, _id, payload) => payload as never);
    roble.insert.mockResolvedValue({ inserted: [], skipped: [] } as never);
    roble.listAuthUsers.mockResolvedValue([]);

    service = new TorneosService(roble as unknown as RobleService);
  });

  it('includes creator-owned finalized tournaments in the authenticated list', async () => {
    seedData({
      torneos: [
        {
          _id: 'torneo-own-finalizado',
          nombre: 'Mi finalizado',
          descripcion: 'Historico propio',
          creadorId: 'creator-1',
          codigoAcceso: null,
          esPublico: true,
          estado: 'FINALIZADO',
          tipo: 'SERIE',
          fechaInicio: '2020-01-10T10:00:00.000Z',
          fechaFin: '2020-01-10T11:00:00.000Z',
          recurrencia: 'NINGUNA',
          configuracion: {
            duracionMaximaMin: 20,
            dificultad: 'Intermedio',
            numeroTableros: 3,
          },
          fechaCreacion: '2020-01-01T00:00:00.000Z',
        },
        {
          _id: 'torneo-other-finalizado',
          nombre: 'Finalizado ajeno',
          descripcion: 'No debe verse',
          creadorId: 'other-1',
          codigoAcceso: null,
          esPublico: true,
          estado: 'FINALIZADO',
          tipo: 'SERIE',
          fechaInicio: '2020-01-11T10:00:00.000Z',
          fechaFin: '2020-01-11T11:00:00.000Z',
          recurrencia: 'NINGUNA',
          configuracion: {
            duracionMaximaMin: 20,
            dificultad: 'Intermedio',
            numeroTableros: 3,
          },
          fechaCreacion: '2020-01-02T00:00:00.000Z',
        },
        {
          _id: 'torneo-publico',
          nombre: 'Programado abierto',
          descripcion: 'Debe seguir visible',
          creadorId: 'other-2',
          codigoAcceso: null,
          esPublico: true,
          estado: 'PROGRAMADO',
          tipo: 'SERIE',
          fechaInicio: '2099-01-11T10:00:00.000Z',
          fechaFin: '2099-01-11T11:00:00.000Z',
          recurrencia: 'NINGUNA',
          configuracion: {
            duracionMaximaMin: 20,
            dificultad: 'Intermedio',
            numeroTableros: 3,
          },
          fechaCreacion: '2099-01-02T00:00:00.000Z',
        },
      ],
      perfiles: [
        { usuarioId: 'creator-1', nombre: 'Creator Uno' },
        { usuarioId: 'other-1', nombre: 'Other Uno' },
        { usuarioId: 'other-2', nombre: 'Other Dos' },
      ],
    });

    const rows = await service.listarTorneos('token-1', 'creator-1', 'player');

    expect(rows.map((row) => row._id)).toEqual(
      expect.arrayContaining(['torneo-own-finalizado', 'torneo-publico']),
    );
    expect(rows.map((row) => row._id)).not.toContain('torneo-other-finalizado');
  });

  it('allows the creator to read participants and ranking from a finalized tournament', async () => {
    seedData({
      torneos: [
        {
          _id: 'torneo-own-finalizado',
          nombre: 'Mi finalizado',
          descripcion: 'Historico propio',
          creadorId: 'creator-1',
          codigoAcceso: null,
          esPublico: true,
          estado: 'FINALIZADO',
          tipo: 'SERIE',
          fechaInicio: '2020-01-10T10:00:00.000Z',
          fechaFin: '2020-01-10T11:00:00.000Z',
          recurrencia: 'NINGUNA',
          configuracion: {
            duracionMaximaMin: 20,
            dificultad: 'Intermedio',
            numeroTableros: 3,
          },
          fechaCreacion: '2020-01-01T00:00:00.000Z',
        },
      ],
      participantes: [
        {
          _id: 'part-1',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'player-1',
          fechaUnion: '2020-01-10T09:55:00.000Z',
        },
      ],
      resultados: [
        {
          _id: 'res-1',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'player-1',
          puntaje: 120,
          tiempo: 300,
          fechaRegistro: '2020-01-10T11:05:00.000Z',
        },
      ],
      perfiles: [
        { usuarioId: 'creator-1', nombre: 'Creator Uno' },
        { usuarioId: 'player-1', nombre: 'Player Uno' },
      ],
    });

    const participantes = await service.listarParticipantes(
      'token-1',
      'torneo-own-finalizado',
      'creator-1',
      'player',
    );
    const ranking = await service.obtenerRanking(
      'token-1',
      'torneo-own-finalizado',
      'creator-1',
      'player',
    );

    expect(participantes).toHaveLength(1);
    expect(participantes[0]).toEqual(
      expect.objectContaining({
        usuarioId: 'player-1',
        usuarioNombre: 'Player Uno',
      }),
    );
    expect(ranking).toHaveLength(1);
    expect(ranking[0]).toEqual(
      expect.objectContaining({
        usuarioId: 'player-1',
        usuarioNombre: 'Player Uno',
        puntaje: 120,
      }),
    );
  });

  it('allows a joined participant to read a finalized tournament without exposing it in the general list', async () => {
    seedData({
      torneos: [
        {
          _id: 'torneo-own-finalizado',
          nombre: 'Mi finalizado',
          descripcion: 'Historico propio',
          creadorId: 'creator-1',
          codigoAcceso: null,
          esPublico: true,
          estado: 'FINALIZADO',
          tipo: 'SERIE',
          fechaInicio: '2020-01-10T10:00:00.000Z',
          fechaFin: '2020-01-10T11:00:00.000Z',
          recurrencia: 'NINGUNA',
          configuracion: {
            duracionMaximaMin: 20,
            dificultad: 'Intermedio',
            numeroTableros: 3,
          },
          fechaCreacion: '2020-01-01T00:00:00.000Z',
        },
      ],
      participantes: [
        {
          _id: 'part-1',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'player-1',
          fechaUnion: '2020-01-10T09:55:00.000Z',
        },
      ],
      resultados: [
        {
          _id: 'res-1',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'player-1',
          puntaje: 120,
          tiempo: 300,
          fechaRegistro: '2020-01-10T11:05:00.000Z',
        },
      ],
      perfiles: [
        { usuarioId: 'creator-1', nombre: 'Creator Uno' },
        { usuarioId: 'player-1', nombre: 'Player Uno' },
      ],
    });

    const visibleList = await service.listarTorneos('token-1', 'player-1', 'player');
    const detalle = await service.obtenerTorneoDetalle(
      'token-1',
      'torneo-own-finalizado',
      'player-1',
      'player',
    );
    const participantes = await service.listarParticipantes(
      'token-1',
      'torneo-own-finalizado',
      'player-1',
      'player',
    );
    const ranking = await service.obtenerRanking(
      'token-1',
      'torneo-own-finalizado',
      'player-1',
      'player',
    );

    expect(visibleList.map((row) => row._id)).not.toContain(
      'torneo-own-finalizado',
    );
    expect(detalle).toEqual(
      expect.objectContaining({
        _id: 'torneo-own-finalizado',
        estado: 'FINALIZADO',
      }),
    );
    expect(participantes).toHaveLength(1);
    expect(ranking).toHaveLength(1);
  });

  it('returns finalized participation history with user result summary', async () => {
    seedData({
      torneos: [
        {
          _id: 'torneo-own-finalizado',
          nombre: 'Mi finalizado',
          descripcion: 'Historico propio',
          creadorId: 'creator-1',
          codigoAcceso: null,
          esPublico: true,
          estado: 'FINALIZADO',
          tipo: 'SERIE',
          fechaInicio: '2020-01-10T10:00:00.000Z',
          fechaFin: '2020-01-10T11:00:00.000Z',
          recurrencia: 'NINGUNA',
          configuracion: {
            duracionMaximaMin: 20,
            dificultad: 'Intermedio',
            numeroTableros: 3,
          },
          fechaCreacion: '2020-01-01T00:00:00.000Z',
        },
      ],
      participantes: [
        {
          _id: 'part-1',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'player-1',
          fechaUnion: '2020-01-10T09:55:00.000Z',
        },
      ],
      resultados: [
        {
          _id: 'res-1',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'winner-1',
          puntaje: 150,
          tiempo: 280,
          fechaRegistro: '2020-01-10T11:01:00.000Z',
        },
        {
          _id: 'res-2',
          torneoId: 'torneo-own-finalizado',
          usuarioId: 'player-1',
          puntaje: 120,
          tiempo: 300,
          fechaRegistro: '2020-01-10T11:05:00.000Z',
        },
      ],
      perfiles: [
        { usuarioId: 'creator-1', nombre: 'Creator Uno' },
        { usuarioId: 'player-1', nombre: 'Player Uno' },
        { usuarioId: 'winner-1', nombre: 'Winner Uno' },
      ],
    });

    const rows = await service.listarHistorialParticipacion('token-1', 'player-1');

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        _id: 'torneo-own-finalizado',
        creadorNombre: 'Creator Uno',
        fechaUnion: '2020-01-10T09:55:00.000Z',
        miPosicion: 2,
        miPuntaje: 120,
        miTiempo: 300,
        miFechaRegistro: '2020-01-10T11:05:00.000Z',
      }),
    );
  });
});
