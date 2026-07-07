/**
 * Seed de base de datos para GopassTasks.
 *
 * Crea los roles predefinidos del sistema y un usuario administrador por defecto.
 * Es idempotente: si los datos ya existen, no falla ni crea duplicados.
 *
 * Ejecución: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** Roles predefinidos del sistema */
const ROLES = [
  {
    name: 'ADMIN',
    description: 'Administrador del sistema. Acceso completo a todos los módulos.',
  },
  {
    name: 'DEVELOPER',
    description: 'Desarrollador. Puede gestionar proyectos y tareas asignadas.',
  },
  {
    name: 'VIEWER',
    description: 'Observador. Solo puede visualizar proyectos y tareas.',
  },
] as const;

/** Credenciales del usuario administrador por defecto */
const ADMIN_USER = {
  name: 'Administrador',
  email: 'admin@gopasstasks.com',
  password: 'Admin1234!',
};

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed de base de datos...');

  // Crear roles (upsert: no falla si ya existen)
  for (const rol of ROLES) {
    await prisma.role.upsert({
      where: { name: rol.name },
      update: { description: rol.description },
      create: {
        name: rol.name,
        description: rol.description,
      },
    });
    console.log(`  ✓ Rol '${rol.name}' listo.`);
  }

  // Obtener el rol ADMIN para asignarlo al usuario por defecto
  const rolAdmin = await prisma.role.findUniqueOrThrow({
    where: { name: 'ADMIN' },
  });

  // Crear usuario administrador por defecto (idempotente: upsert por email)
  const passwordHash = await bcrypt.hash(ADMIN_USER.password, 12);

  const usuarioAdmin = await prisma.user.upsert({
    where: { email: ADMIN_USER.email },
    update: {
      name: ADMIN_USER.name,
      roleId: rolAdmin.id,
      isActive: true,
    },
    create: {
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      passwordHash,
      roleId: rolAdmin.id,
      isActive: true,
    },
  });

  console.log(`  ✓ Usuario admin '${usuarioAdmin.email}' listo.`);
  console.log('');
  console.log('✅ Seed completado correctamente.');
  console.log('');
  console.log('  Credenciales de acceso:');
  console.log(`    Email:    ${ADMIN_USER.email}`);
  console.log(`    Password: ${ADMIN_USER.password}`);
  console.log('  ⚠️  Cambia la contraseña en producción.');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
