import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { OtakudesuController } from './otakudesu.controller';
import { OtakudesuService } from './otakudesu.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300000, // 5 minutes default TTL
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [OtakudesuController],
  providers: [OtakudesuService],
  exports: [OtakudesuService],
})
export class OtakudesuModule {}
