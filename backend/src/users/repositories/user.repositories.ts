import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.repository.exists({ where: { email } });
  }

  isEmailTaken(email: string, excludeUserId?: number): Promise<boolean> {
    return this.repository.exists({
      where: excludeUserId ? { email, id: Not(excludeUserId) } : { email },
    });
  }

  build(data: DeepPartial<User>): User {
    return this.repository.create(data);
  }

  save(user: Partial<User>): Promise<User> {
    return this.repository.save(this.repository.create(user));
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
