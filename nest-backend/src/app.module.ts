import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@common/database/database.module';
import { CoreModule } from './core/core.module';
import { UsersModule } from '@modules/users/users.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { AttackSurfacesModule } from '@modules/attack-surfaces/attack-surfaces.module';
import { AssetsModule } from '@modules/assets/assets.module';
import { ScansModule } from '@modules/scans/scans.module';
import { ScanResultsModule } from '@modules/scan-results/scan-results.module';
import { FindingsModule } from '@modules/findings/findings.module';
import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module'; // Changed to relative path

@Module({
  imports: [
    // Database module
    DatabaseModule,

    // Core module
    CoreModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    AttackSurfacesModule,
    AssetsModule,
    ScansModule,
    ScanResultsModule,
    FindingsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
