import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const movements = [
  // Olympic Weightlifting
  { name: "Snatch", nameEs: "Arrancada", slug: "snatch", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },
  { name: "Clean and Jerk", nameEs: "Envión", slug: "clean-and-jerk", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },
  { name: "Clean", nameEs: "Cargada", slug: "clean", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },
  { name: "Power Snatch", nameEs: "Arrancada de potencia", slug: "power-snatch", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },
  { name: "Power Clean", nameEs: "Cargada de potencia", slug: "power-clean", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },
  { name: "Push Jerk", nameEs: "Jerk de empuje", slug: "push-jerk", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },
  { name: "Split Jerk", nameEs: "Jerk en tijera", slug: "split-jerk", category: "OLYMPIC_WEIGHTLIFTING", measureType: "WEIGHT" },

  // Powerlifting
  { name: "Back Squat", nameEs: "Sentadilla trasera", slug: "back-squat", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Front Squat", nameEs: "Sentadilla frontal", slug: "front-squat", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Overhead Squat", nameEs: "Sentadilla sobre cabeza", slug: "overhead-squat", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Deadlift", nameEs: "Peso muerto", slug: "deadlift", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Sumo Deadlift", nameEs: "Peso muerto sumo", slug: "sumo-deadlift", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Bench Press", nameEs: "Press de banca", slug: "bench-press", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Strict Press", nameEs: "Press estricto", slug: "strict-press", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Push Press", nameEs: "Push press", slug: "push-press", category: "POWERLIFTING", measureType: "WEIGHT" },
  { name: "Thruster", nameEs: "Thruster", slug: "thruster", category: "POWERLIFTING", measureType: "WEIGHT" },

  // Gymnastics (REPS)
  { name: "Pull Up", nameEs: "Dominada", slug: "pull-up", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Chest to Bar Pull Up", nameEs: "Dominada pecho a barra", slug: "chest-to-bar", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Muscle Up (Bar)", nameEs: "Muscle up en barra", slug: "muscle-up-bar", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Muscle Up (Ring)", nameEs: "Muscle up en argollas", slug: "muscle-up-ring", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Handstand Push Up", nameEs: "Flexión en parada de manos", slug: "handstand-push-up", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Toes to Bar", nameEs: "Pies a barra", slug: "toes-to-bar", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Ring Dip", nameEs: "Fondos en argollas", slug: "ring-dip", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Bar Dip", nameEs: "Fondos en barra", slug: "bar-dip", category: "GYMNASTICS", measureType: "REPS" },
  { name: "Pistol Squat", nameEs: "Sentadilla a una pierna", slug: "pistol-squat", category: "GYMNASTICS", measureType: "REPS" },

  // Monostructural
  { name: "Row 500m", nameEs: "Remo 500m", slug: "row-500m", category: "MONOSTRUCTURAL", measureType: "REPS" },
  { name: "Run 400m", nameEs: "Carrera 400m", slug: "run-400m", category: "MONOSTRUCTURAL", measureType: "REPS" },
  { name: "Double Under", nameEs: "Doble salto", slug: "double-under", category: "MONOSTRUCTURAL", measureType: "REPS" },

  // Functional
  { name: "Wall Ball", nameEs: "Wall ball", slug: "wall-ball", category: "FUNCTIONAL", measureType: "WEIGHT" },
  { name: "Kettlebell Swing", nameEs: "Swing con pesa rusa", slug: "kettlebell-swing", category: "FUNCTIONAL", measureType: "WEIGHT" },
]

async function main() {
  console.log("🌱 Seeding movements...")

  for (const movement of movements) {
    await prisma.movement.upsert({
      where: { slug: movement.slug },
      update: {},
      create: {
        ...movement,
        isGlobal: true,
        category: movement.category as any,
        measureType: movement.measureType as any,
      },
    })
  }

  console.log(`✅ ${movements.length} movements seeded`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
