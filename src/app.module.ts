import { Module } from '@nestjs/common';
import { OtakudesuModule } from './otakudesu/otakudesu.module';

@Module({
  imports: [OtakudesuModule],
})
export class AppModule {}
