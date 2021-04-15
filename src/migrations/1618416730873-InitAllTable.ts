import {MigrationInterface, QueryRunner} from "typeorm";

export class InitAllTable1618416730873 implements MigrationInterface {
    name = 'InitAllTable1618416730873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permission_set" ("id" SERIAL NOT NULL, "course" character varying NOT NULL, "user" character varying NOT NULL, "blog" character varying NOT NULL, "instructor" character varying NOT NULL, "permission" character varying NOT NULL, "notification" character varying NOT NULL, "createdById" uuid, "roleName" character varying, CONSTRAINT "REL_374499312af5eb006d9da5f00f" UNIQUE ("roleName"), CONSTRAINT "PK_40c60f41127ea51a22e63d291f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("name" character varying NOT NULL, CONSTRAINT "PK_ae4578dcaed5adff96595e61660" PRIMARY KEY ("name"))`);
        await queryRunner.query(`CREATE TABLE "admin_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdById" uuid, "role" character varying, CONSTRAINT "PK_a28028ba709cd7e5053a86857b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "instructor" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL, "description" character varying NOT NULL, "imageUrl" character varying NOT NULL, "filePath" character varying NOT NULL, "phone" character varying NOT NULL, "userId" uuid, "createdById" uuid, CONSTRAINT "REL_a914853943da2844065d6e5c38" UNIQUE ("userId"), CONSTRAINT "PK_ccc0348eefb581ca002c05ef2f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lesson_document" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "filePath" character varying NOT NULL, "lessonId" integer, CONSTRAINT "PK_f64ebdbeb66df431dff53e66a47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lesson" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "videoUrl" character varying NOT NULL, "votes" integer DEFAULT '0', "content" character varying NOT NULL, "courseId" integer, CONSTRAINT "PK_0ef25918f0237e68696dee455bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying NOT NULL, "votes" integer, "imageUrl" character varying NOT NULL, "filePath" character varying NOT NULL, "timeByHour" smallint, "isCompleted" boolean, "benefits" character varying NOT NULL, "requirements" character varying NOT NULL, "levels" character varying DEFAULT 'Beginner', "instructorId" integer, "createdById" uuid, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "imageUrl" character varying NOT NULL, "filePath" character varying NOT NULL, "instructorId" integer, CONSTRAINT "REL_f51d7282371b79acc0c36fad76" UNIQUE ("instructorId"), CONSTRAINT "PK_f18a6fabea7b2a90ab6bf10a650" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_comment" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "content" character varying NOT NULL, "votes" smallint NOT NULL, "authorId" uuid, "courseId" integer, "lessonId" integer, "assignmentId" integer, CONSTRAINT "PK_09bced71952353c5ae4e40f0f52" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "test_case" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "expectedOutput" character varying NOT NULL, "input" character varying NOT NULL, "assignmentId" integer, CONSTRAINT "PK_ddd6142bdceedfe5161a0406984" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assignment" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying NOT NULL, "hints" character varying NOT NULL, "score" integer DEFAULT '10', "input" character varying NOT NULL, "output" character varying NOT NULL, "languageSupport" character varying NOT NULL, "lessonId" integer, CONSTRAINT "PK_43c2f5a3859f54cedafb270f37e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag_courses_course" ("tagId" integer NOT NULL, "courseId" integer NOT NULL, CONSTRAINT "PK_d2cfeb711e33d4d9c9d8855b399" PRIMARY KEY ("tagId", "courseId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dfc759b9650a51b70d09111745" ON "tag_courses_course" ("tagId") `);
        await queryRunner.query(`CREATE INDEX "IDX_87247ad9257f4e2ce3a500a999" ON "tag_courses_course" ("courseId") `);
        await queryRunner.query(`CREATE TABLE "course_joining_users_client_user" ("courseId" integer NOT NULL, "clientUserId" uuid NOT NULL, CONSTRAINT "PK_51d46bd81fca8f58fe136f8fc95" PRIMARY KEY ("courseId", "clientUserId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9d035b39cb0a69e95be08047e9" ON "course_joining_users_client_user" ("courseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_297e91aff79e44c1d0ea737a7b" ON "course_joining_users_client_user" ("clientUserId") `);
        await queryRunner.query(`ALTER TABLE "permission_set" ADD CONSTRAINT "FK_29cd99f4a2fedff1cb74935c6a7" FOREIGN KEY ("createdById") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permission_set" ADD CONSTRAINT "FK_374499312af5eb006d9da5f00f7" FOREIGN KEY ("roleName") REFERENCES "role"("name") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_user" ADD CONSTRAINT "FK_ce2c117e51b3704f924a325e268" FOREIGN KEY ("createdById") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_user" ADD CONSTRAINT "FK_faa5e69338cb413df6d4e4926b3" FOREIGN KEY ("role") REFERENCES "role"("name") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD CONSTRAINT "FK_a914853943da2844065d6e5c383" FOREIGN KEY ("userId") REFERENCES "client_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD CONSTRAINT "FK_ce6e86bd3994debeedb4e37e050" FOREIGN KEY ("createdById") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_document" ADD CONSTRAINT "FK_5e36459f19864b41ce715d46c53" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "lesson" ADD CONSTRAINT "FK_3801ccf9533a8627c1dcb1e33bf" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_32d94af473bb59d808d9a68e17b" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_2481291d5c97aaff5cf3ce5359c" FOREIGN KEY ("createdById") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_user" ADD CONSTRAINT "FK_f51d7282371b79acc0c36fad76f" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_comment" ADD CONSTRAINT "FK_19d0406f821caa3149825fe9693" FOREIGN KEY ("authorId") REFERENCES "client_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_comment" ADD CONSTRAINT "FK_6289371e657912dec61859188ec" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_comment" ADD CONSTRAINT "FK_c6a0e0174d223b6280fd473e90a" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_comment" ADD CONSTRAINT "FK_2ef33d55c2a1caa93dc47436b27" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_case" ADD CONSTRAINT "FK_7b36585a5f32744f923fe35cb3a" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD CONSTRAINT "FK_01c74e33f096093669cf9115510" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag_courses_course" ADD CONSTRAINT "FK_dfc759b9650a51b70d09111745e" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag_courses_course" ADD CONSTRAINT "FK_87247ad9257f4e2ce3a500a999c" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_joining_users_client_user" ADD CONSTRAINT "FK_9d035b39cb0a69e95be08047e9d" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_joining_users_client_user" ADD CONSTRAINT "FK_297e91aff79e44c1d0ea737a7b4" FOREIGN KEY ("clientUserId") REFERENCES "client_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_joining_users_client_user" DROP CONSTRAINT "FK_297e91aff79e44c1d0ea737a7b4"`);
        await queryRunner.query(`ALTER TABLE "course_joining_users_client_user" DROP CONSTRAINT "FK_9d035b39cb0a69e95be08047e9d"`);
        await queryRunner.query(`ALTER TABLE "tag_courses_course" DROP CONSTRAINT "FK_87247ad9257f4e2ce3a500a999c"`);
        await queryRunner.query(`ALTER TABLE "tag_courses_course" DROP CONSTRAINT "FK_dfc759b9650a51b70d09111745e"`);
        await queryRunner.query(`ALTER TABLE "assignment" DROP CONSTRAINT "FK_01c74e33f096093669cf9115510"`);
        await queryRunner.query(`ALTER TABLE "test_case" DROP CONSTRAINT "FK_7b36585a5f32744f923fe35cb3a"`);
        await queryRunner.query(`ALTER TABLE "user_comment" DROP CONSTRAINT "FK_2ef33d55c2a1caa93dc47436b27"`);
        await queryRunner.query(`ALTER TABLE "user_comment" DROP CONSTRAINT "FK_c6a0e0174d223b6280fd473e90a"`);
        await queryRunner.query(`ALTER TABLE "user_comment" DROP CONSTRAINT "FK_6289371e657912dec61859188ec"`);
        await queryRunner.query(`ALTER TABLE "user_comment" DROP CONSTRAINT "FK_19d0406f821caa3149825fe9693"`);
        await queryRunner.query(`ALTER TABLE "client_user" DROP CONSTRAINT "FK_f51d7282371b79acc0c36fad76f"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_2481291d5c97aaff5cf3ce5359c"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_32d94af473bb59d808d9a68e17b"`);
        await queryRunner.query(`ALTER TABLE "lesson" DROP CONSTRAINT "FK_3801ccf9533a8627c1dcb1e33bf"`);
        await queryRunner.query(`ALTER TABLE "lesson_document" DROP CONSTRAINT "FK_5e36459f19864b41ce715d46c53"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP CONSTRAINT "FK_ce6e86bd3994debeedb4e37e050"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP CONSTRAINT "FK_a914853943da2844065d6e5c383"`);
        await queryRunner.query(`ALTER TABLE "admin_user" DROP CONSTRAINT "FK_faa5e69338cb413df6d4e4926b3"`);
        await queryRunner.query(`ALTER TABLE "admin_user" DROP CONSTRAINT "FK_ce2c117e51b3704f924a325e268"`);
        await queryRunner.query(`ALTER TABLE "permission_set" DROP CONSTRAINT "FK_374499312af5eb006d9da5f00f7"`);
        await queryRunner.query(`ALTER TABLE "permission_set" DROP CONSTRAINT "FK_29cd99f4a2fedff1cb74935c6a7"`);
        await queryRunner.query(`DROP INDEX "IDX_297e91aff79e44c1d0ea737a7b"`);
        await queryRunner.query(`DROP INDEX "IDX_9d035b39cb0a69e95be08047e9"`);
        await queryRunner.query(`DROP TABLE "course_joining_users_client_user"`);
        await queryRunner.query(`DROP INDEX "IDX_87247ad9257f4e2ce3a500a999"`);
        await queryRunner.query(`DROP INDEX "IDX_dfc759b9650a51b70d09111745"`);
        await queryRunner.query(`DROP TABLE "tag_courses_course"`);
        await queryRunner.query(`DROP TABLE "assignment"`);
        await queryRunner.query(`DROP TABLE "test_case"`);
        await queryRunner.query(`DROP TABLE "user_comment"`);
        await queryRunner.query(`DROP TABLE "client_user"`);
        await queryRunner.query(`DROP TABLE "course"`);
        await queryRunner.query(`DROP TABLE "lesson"`);
        await queryRunner.query(`DROP TABLE "lesson_document"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "instructor"`);
        await queryRunner.query(`DROP TABLE "admin_user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "permission_set"`);
    }

}