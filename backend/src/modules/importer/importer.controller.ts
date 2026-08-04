/** POST /importer — dispatches parsed CSV payloads to entity strategies. */
import { Body, Controller, Post } from '@nestjs/common';
import { PostImporterBodyDTO } from './dto/importer.dto';
import { ImporterService } from './importer.service';

@Controller('importer')
export class ImporterController {
  constructor(private readonly importerService: ImporterService) {}

  @Post()
  /** Runs import or dry-run validation for the given entity. */
  postImport(@Body() body: PostImporterBodyDTO) {
    return this.importerService.create(body);
  }
}
