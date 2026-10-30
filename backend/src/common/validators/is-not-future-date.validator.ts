import { registerDecorator, type ValidationOptions } from 'class-validator';

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} cannot be in the future`, ...validationOptions },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          return value.slice(0, 10) <= todayIso();
        },
      },
    });
  };
}