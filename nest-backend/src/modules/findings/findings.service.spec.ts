import { Test, TestingModule } from '@nestjs/testing';
import { FindingsService } from './findings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Finding } from './entities/finding.entity';

describe('FindingsService', () => {
  let service: FindingsService;
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
      providers: [FindingsService, { provide: getRepositoryToken(Finding), useValue: mockRepo }],
    }).compile();

    service = module.get<FindingsService>(FindingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests for FindingsService methods here
});
