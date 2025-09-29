import { Module } from '@nestjs/common';
import { CACHE_PROVIDER_TOKEN } from '@infra/cache/interfaces/tokens';
import { NodeCacheService } from '@infra/cache/node-cache/node-cache.service';

@Module({
  providers: [
    {
      provide: CACHE_PROVIDER_TOKEN,
      useClass: NodeCacheService,
    },
  ],
  exports: [CACHE_PROVIDER_TOKEN],
})
export class CacheModule {}