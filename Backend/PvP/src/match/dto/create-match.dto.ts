import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiPropertyOptional({
    example: 'abc123',
    description: 'ID del torneo PVP en Contenedor1. Opcional para partidas PvP independientes.',
  })
  @IsOptional()
  @IsString()
  torneoId?: string;

  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Token de Contenedor1 (cerebro_db) para validar torneo y participantes cuando el match pertenece a un torneo.',
  })
  @IsOptional()
  @IsString()
  tokenC1?: string;
}
