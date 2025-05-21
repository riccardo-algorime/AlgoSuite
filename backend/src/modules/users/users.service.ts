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

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }
}

