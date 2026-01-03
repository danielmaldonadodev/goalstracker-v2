const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Buscar el usuario de prueba
  let user = await prisma.user.findUnique({
    where: { email: 'test@test.com' }
  })

  if (!user) {
    console.log('Usuario test@test.com no encontrado. Buscar cualquier usuario...')
    user = await prisma.user.findFirst()
  }

  if (!user) {
    console.log('No hay usuarios. Creando usuario de prueba...')
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash('12345678', 12)
    
    user = await prisma.user.create({
      data: {
        name: 'Usuario Demo',
        email: 'demo@goalstracker.com',
        passwordHash: hash,
      }
    })
    console.log(`Usuario creado: ${user.email}`)
  }

  console.log(`Usando usuario: ${user.email} (${user.id})`)

  // Limpiar objetivos existentes de este usuario
  await prisma.objective.deleteMany({
    where: { userId: user.id }
  })

  const objectives = [
    {
      userId: user.id,
      name: 'Andar',
      description: 'Caminar distancia diaria',
      type: 'NUMERIC',
      unit: 'km',
      category: 'health',
      icon: '🚶',
      color: '#22c55e',
      config: JSON.stringify({}),
      thresholds: JSON.stringify({
        red: { lt: 3.0 },
        orange: { gte: 3.0, lt: 4.0 },
        green: { gte: 4.0 },
        optimal: { gte: 6.0 }
      }),
      sortOrder: 1,
    },
    {
      userId: user.id,
      name: 'Lectura',
      description: 'Páginas leídas al día',
      type: 'NUMERIC',
      unit: 'páginas',
      category: 'wellness',
      icon: '📚',
      color: '#3b82f6',
      config: JSON.stringify({}),
      thresholds: JSON.stringify({
        red: { lt: 5 },
        orange: { gte: 5, lt: 10 },
        green: { gte: 10 },
        optimal: { gte: 20 }
      }),
      sortOrder: 2,
    },
    {
      userId: user.id,
      name: 'Dormir',
      description: 'Horas de sueño',
      type: 'NUMERIC',
      unit: 'horas',
      category: 'health',
      icon: '😴',
      color: '#8b5cf6',
      config: JSON.stringify({}),
      thresholds: JSON.stringify({
        red: { lt: 6.5 },
        orange: { gte: 6.5, lt: 7.0 },
        green: { gte: 7.0 },
        optimal: { gte: 7.5, lte: 8.0 }
      }),
      sortOrder: 3,
    },
    {
      userId: user.id,
      name: 'Comer Bien',
      description: 'Alimentación saludable',
      type: 'BOOLEAN',
      category: 'health',
      icon: '🥗',
      color: '#10b981',
      config: JSON.stringify({}),
      thresholds: JSON.stringify({
        green: true,
        red: false
      }),
      sortOrder: 4,
    },
    {
      userId: user.id,
      name: 'Piano',
      description: 'Práctica de piano',
      type: 'NUMERIC',
      unit: 'minutos',
      category: 'wellness',
      icon: '🎹',
      color: '#f59e0b',
      config: JSON.stringify({}),
      thresholds: JSON.stringify({
        red: { lt: 10 },
        orange: { gte: 10, lt: 15 },
        green: { gte: 15 },
        optimal: { gte: 30 }
      }),
      sortOrder: 5,
    },
    {
      userId: user.id,
      name: 'Programar',
      description: 'Tiempo programando',
      type: 'NUMERIC',
      unit: 'minutos',
      category: 'productivity',
      icon: '💻',
      color: '#06b6d4',
      config: JSON.stringify({}),
      thresholds: JSON.stringify({
        red: { lt: 15 },
        orange: { gte: 15, lt: 20 },
        green: { gte: 20 },
        optimal: { gte: 45, lte: 60 }
      }),
      sortOrder: 6,
    },
  ]

  console.log('Creando objetivos...')
  
  for (const obj of objectives) {
    const created = await prisma.objective.create({
      data: obj
    })
    console.log(`Creado: ${created.name}`)
  }

  console.log('Seed completado!')
  console.log(`Total: ${objectives.length} objetivos`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
