import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  providers: [SupabaseStorageService],
  imports: [],
  exports: [SupabaseStorageService], //export the service so it can be used in other modules
})
export class SupabaseStorageModule {}
