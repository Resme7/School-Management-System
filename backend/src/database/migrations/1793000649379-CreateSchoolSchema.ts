import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchoolSchema1793000649379 implements MigrationInterface {
  name = 'CreateSchoolSchema1793000649379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "grades" ("id" SERIAL NOT NULL, "subject" character varying(50) NOT NULL, "value" smallint NOT NULL, "date" date NOT NULL, "studentId" integer NOT NULL, "teacherId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_8c61745489d0e2e8f24058ea45" CHECK ("value" BETWEEN 1 AND 10), CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fcfc027e4e5fb37a4372e68807" ON "grades"  ("studentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "students" ("id" SERIAL NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "dateOfBirth" date NOT NULL, "userId" integer NOT NULL, "classId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_e0208b4f964e609959aff431bf" UNIQUE ("userId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "classes" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "teacherId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1f3940af28a76098f31004f03ca" UNIQUE ("name"), CONSTRAINT "PK_e207aa15404e9b2ce35910f9f7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "teachers" ("id" SERIAL NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_4d8041cbc103a5142fa2f2afad" UNIQUE ("userId"), CONSTRAINT "PK_a8d4f83be3abe4c687b0a0093c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "grades" ADD CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grades" ADD CONSTRAINT "FK_e60eb3569366f86a886f7027b3d" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "FK_575e5ce508ee1275f45cb7c4c32" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "classes" ADD CONSTRAINT "FK_4b7ac7a7eb91f3e04229c7c0b6f" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teachers" ADD CONSTRAINT "FK_4d8041cbc103a5142fa2f2afad4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "teachers" DROP CONSTRAINT "FK_4d8041cbc103a5142fa2f2afad4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "classes" DROP CONSTRAINT "FK_4b7ac7a7eb91f3e04229c7c0b6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_575e5ce508ee1275f45cb7c4c32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grades" DROP CONSTRAINT "FK_e60eb3569366f86a886f7027b3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grades" DROP CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070"`,
    );
    await queryRunner.query(`DROP TABLE "teachers"`);
    await queryRunner.query(`DROP TABLE "classes"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcfc027e4e5fb37a4372e68807"`,
    );
    await queryRunner.query(`DROP TABLE "grades"`);
  }
}
