import { Test, TestingModule } from '@nestjs/testing';
import { AttackSurfacesService } from './attack-surfaces.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttackSurface } from './entities/attack-surface.entity';

describe('AttackSurfacesService', () => {
  let service: AttackSurfacesService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      // Add more mock methods as needed
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttackSurfacesService,
        { provide: getRepositoryToken(AttackSurface), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AttackSurfacesService>(AttackSurfacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests for AttackSurfacesService methods here
});
