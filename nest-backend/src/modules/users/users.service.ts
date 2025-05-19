import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private _usersRepository: Repository<User>,
    // We'll need AuthService for hashing, or implement hashing directly
    // For now, let's assume bcrypt is available or we add a HashingService later
    // For simplicity in this step, I'll import bcrypt directly here.
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...restOfDto } = createUserDto;

    const existingUser = await this._usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Directly using bcrypt here for now. Ideally, this would be in AuthService or a HashingService
    const bcrypt = await import('bcrypt'); // Dynamic import
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this._usersRepository.create({
      ...restOfDto,
      email,
      hashedPassword,
    });
    return this._usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this._usersRepository.find();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this._usersRepository.findOne({ where: { email } });
    return user || undefined; // Explicitly return undefined if not found
  }

  async findOne(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // If password is being updated, hash it
    if (updateUserDto.password) {
      const bcrypt = await import('bcrypt'); // Dynamic import
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Merge handles partial updates. If password was updated, it's now hashed.
    // Ensure DTO property for password matches entity (e.g. hashedPassword if that's the DTO field)
    // Assuming updateUserDto might have a 'password' field, and entity has 'hashedPassword'
    // This needs careful DTO and entity alignment.
    // For now, let's assume updateUserDto.password should update user.hashedPassword
    const { password, ...restUpdateDto } = updateUserDto;
    const updatePayload: Partial<User> = { ...restUpdateDto };
    if (password) {
      updatePayload.hashedPassword = password; // password here is already hashed from above
    }

    this._usersRepository.merge(user, updatePayload);
    return this._usersRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);
    return this._usersRepository.remove(user);
  }
}
