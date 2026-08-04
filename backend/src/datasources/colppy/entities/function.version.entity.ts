import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Stores SHA-256 hashes of synced DB function/trigger definitions by name. */
@Entity({ name: 'function_versions' })
export class FunctionVersion {
  @PrimaryColumn()
  name: string;

  @Column()
  hash: string;
}
