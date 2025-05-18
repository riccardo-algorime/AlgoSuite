import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { AttackSurfaceResponseDto } from './attack-surface-response.dto';
import { AssetResponseDto } from '@modules/assets/dto';

@Exclude()
export class AttackSurfaceWithAssetsDto extends AttackSurfaceResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Assets associated with the attack surface',
    type: [AssetResponseDto],
  })
  @Type(() => AssetResponseDto)
  assets: AssetResponseDto[];
}
