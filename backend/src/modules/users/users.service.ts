import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user === null ? undefined : user;
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { refreshToken } });
    return user === null ? undefined : user;
  }

  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    this.logger.log(`Setting refresh token for user ${userId}`);
    try {
      const queryBuilder = this.usersRepository
        .createQueryBuilder()
        .update(User)
        .where('id = :id', { id: userId });

      // Handle null case explicitly
      if (refreshToken === null) {
        queryBuilder.set({ refreshToken: () => 'NULL' });
      } else {
        queryBuilder.set({ refreshToken: refreshToken });
      }

      await queryBuilder.execute();
      this.logger.log(`Refresh token updated for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error setting refresh token for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user === null ? undefined : user;
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    // Filter out complex objects that TypeORM can't handle directly
    const { projects, ...updateData } = data as any;
    await this.usersRepository.update(id, updateData);
  }
}

