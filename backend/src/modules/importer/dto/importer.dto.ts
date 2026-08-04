/** Validates POST /importer body (entity, columns, rows, dryRun). */
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

/** Optional per-column import flags (reserved for future overwrite behavior). */
export class ImportColumns {
  @IsOptional()
  @IsBoolean({ message: 'overwrite debe ser verdadero o falso' })
  overwrite?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'onlyUpdateNulls debe ser verdadero o falso' })
  onlyUpdateNulls?: boolean;
}

/** Parsed CSV payload for POST /importer. */
export class PostImporterBodyDTO {
  @IsString({ message: 'La entidad de importación es obligatoria' })
  @IsIn(['sales'], {
    message: 'Solo se admite la importación de ventas (entity = sales)',
  })
  entity!: string;

  @IsArray({ message: 'Las columnas deben enviarse como lista' })
  @ArrayMinSize(1, { message: 'Debés enviar al menos una columna' })
  @IsDefined({ each: true, message: 'Hay columnas inválidas en el archivo' })
  columns: [string, ImportColumns][];

  @IsArray({ message: 'Las filas deben enviarse como lista' })
  @ArrayMinSize(1, { message: 'El archivo no tiene filas para importar' })
  @IsArray({ each: true, message: 'Cada fila debe ser una lista de valores' })
  rows: any[][];

  @IsOptional()
  @IsBoolean({ message: 'dryRun debe ser verdadero o falso' })
  dryRun?: boolean = false;

  @IsOptional()
  @IsString({ message: 'El nombre de archivo debe ser texto' })
  file_name?: string;
}
