import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
    }

    create(createUserDto: any) {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }

    findAll() {
        return this.usersRepository.find();
    }

    async findOne(id: number) {
        const user = await this.usersRepository.findOne({where: {id}});
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: number, updateUserDto: any) {
        const user = await this.findOne(id);
        this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }
}