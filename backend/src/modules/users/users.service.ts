import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
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
    // Handle null case explicitly for TypeORM
    if (refreshToken === null) {
      await this.usersRepository.update(userId, { refreshToken: undefined });
    } else {
      await this.usersRepository.update(userId, { refreshToken });
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

