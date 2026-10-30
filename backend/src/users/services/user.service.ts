import {ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../common/enums/role.enum';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repositories';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email.toLowerCase());
  }

  async buildUser(email: string, password: string, role: Role): Promise<User> {
    return this.userRepository.build({
      email: await this.normalizeAvailableEmail(email),
      password: await this.hashPassword(password),
      role,
    });
  }

  async normalizeAvailableEmail(
    email: string,
    currentUserId?: number,
  ): Promise<string> {
    const normalized = email.trim().toLowerCase();
    if (await this.userRepository.isEmailTaken(normalized, currentUserId)) {
      throw new ConflictException(`Email ${normalized} is already in use`);
    }
    return normalized;
  }
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
