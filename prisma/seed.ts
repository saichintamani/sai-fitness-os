import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Sai Fitness OS Database...')

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'sai@fitness.os' }
  })

  if (existingUser) {
    console.log('Database already seeded.')
    return
  }

  // 2. Create Base User & Profile
  const user = await prisma.user.create({
    data: {
      email: 'sai@fitness.os',
      name: 'Sai',
      profile: {
        create: {
          age: 20,
          heightCm: 170,
          weightKg: 49,
          gender: 'Male',
          dietPreference: 'Vegetarian',
          hostelMode: true,
          budgetMonthly: 2000,
          onboardingCompleted: true
        }
      },
      settings: {
        create: {
          theme: 'dark',
          notifications: true
        }
      }
    }
  })
  
  console.log(`Created user ${user.name}`)

  // 3. Create Exercise Library
  const exercises = [
    { name: 'Shoulder Press', primaryMuscle: 'front-delts', secondaryMuscles: ['triceps'], equipment: 'Dumbbells', movementPattern: 'Vertical Push' },
    { name: 'Lateral Raise', primaryMuscle: 'lateral-delts', secondaryMuscles: [], equipment: 'Dumbbells', movementPattern: 'Isolation' },
    { name: 'Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], equipment: 'Barbell', movementPattern: 'Horizontal Push' },
    { name: 'Incline Dumbbell Press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], equipment: 'Dumbbells', movementPattern: 'Incline Push' },
    { name: 'Pull-up', primaryMuscle: 'lats', secondaryMuscles: ['biceps', 'rear-delts'], equipment: 'Bodyweight', movementPattern: 'Vertical Pull' },
    { name: 'Barbell Row', primaryMuscle: 'upper-back', secondaryMuscles: ['lats', 'biceps'], equipment: 'Barbell', movementPattern: 'Horizontal Pull' },
    { name: 'Face Pull', primaryMuscle: 'rear-delts', secondaryMuscles: ['upper-back'], equipment: 'Cable', movementPattern: 'Horizontal Pull' },
    { name: 'Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'lower-back', 'core'], equipment: 'Barbell', movementPattern: 'Squat' },
    { name: 'Romanian Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'lower-back'], equipment: 'Barbell', movementPattern: 'Hinge' },
    { name: 'Leg Press', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'Machine', movementPattern: 'Squat' },
    { name: 'Leg Curl', primaryMuscle: 'hamstrings', secondaryMuscles: [], equipment: 'Machine', movementPattern: 'Isolation' },
    { name: 'Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Machine', movementPattern: 'Isolation' },
    { name: 'Bicep Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'Dumbbells', movementPattern: 'Isolation' },
    { name: 'Tricep Extension', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Cable', movementPattern: 'Isolation' },
    { name: 'Crunch', primaryMuscle: 'core', secondaryMuscles: [], equipment: 'Bodyweight', movementPattern: 'Flexion' }
  ]

  const exerciseMap = new Map()
  for (const ex of exercises) {
    const createdEx = await prisma.exercise.create({ data: ex })
    exerciseMap.set(ex.name, createdEx.id)
  }
  
  console.log('Created exercise library')

  // 4. Create 24-Week Program Structure
  const program = await prisma.program.create({
    data: {
      name: 'Sai Aesthetics Protocol',
      description: '6-Month hypertrophy progression focused on Lateral Delts, Rear Delts, and Chest.',
      userId: user.id,
      versions: {
        create: {
          versionNumber: 1,
          isActive: true,
          startDate: new Date(),
          phases: {
            create: [
              { name: 'Phase 1: Foundation', orderIndex: 1, durationWeeks: 4 },
              { name: 'Phase 2: Progressive Hypertrophy', orderIndex: 2, durationWeeks: 4 },
              { name: 'Phase 3: Development', orderIndex: 3, durationWeeks: 4 },
              { name: 'Phase 4: Specialization', orderIndex: 4, durationWeeks: 4 },
              { name: 'Phase 5: Advanced Development', orderIndex: 5, durationWeeks: 4 },
              { name: 'Phase 6: Consolidation', orderIndex: 6, durationWeeks: 4 },
            ]
          }
        }
      }
    },
    include: { versions: { include: { phases: true } } }
  })
  
  console.log('Created 6-month program structure')
  
  const phases = program.versions[0].phases
  
  // Create Templates for Phase 1 (Foundation)
  const phase1 = phases.find(p => p.orderIndex === 1)!
  
  const templates = [
    { name: 'Push A', dayOfWeek: 1, priority: 'Chest' },
    { name: 'Pull A', dayOfWeek: 2, priority: 'Upper Back' },
    { name: 'Legs A + Core', dayOfWeek: 3, priority: 'Quads' },
    { name: 'Push B', dayOfWeek: 4, priority: 'Lateral Delts' },
    { name: 'Pull B', dayOfWeek: 5, priority: 'Lats' },
    { name: 'Legs B + Arms + Core', dayOfWeek: 6, priority: 'Hamstrings' },
    { name: 'Full Rest', dayOfWeek: 0, priority: 'Recovery', isRestDay: true }
  ]

  for (const t of templates) {
    const template = await prisma.workoutTemplate.create({
      data: {
        phaseId: phase1.id,
        name: t.name,
        dayOfWeek: t.dayOfWeek,
        isRestDay: t.isRestDay || false,
        priority: t.priority,
        estimatedDurationMin: t.isRestDay ? 0 : 75
      }
    })
    
    // Seed some basic prescriptions for Push A (Monday)
    if (t.name === 'Push A') {
      await prisma.exercisePrescription.createMany({
        data: [
          { workoutTemplateId: template.id, exerciseId: exerciseMap.get('Bench Press'), orderIndex: 1, sets: 3, repsMin: 5, repsMax: 8, targetRir: 2, restSeconds: 180, notes: 'Focus on explosive concentric' },
          { workoutTemplateId: template.id, exerciseId: exerciseMap.get('Incline Dumbbell Press'), orderIndex: 2, sets: 3, repsMin: 8, repsMax: 12, targetRir: 1, restSeconds: 120 },
          { workoutTemplateId: template.id, exerciseId: exerciseMap.get('Shoulder Press'), orderIndex: 3, sets: 3, repsMin: 8, repsMax: 12, targetRir: 2, restSeconds: 120 },
          { workoutTemplateId: template.id, exerciseId: exerciseMap.get('Lateral Raise'), orderIndex: 4, sets: 4, repsMin: 12, repsMax: 15, targetRir: 1, restSeconds: 90 },
          { workoutTemplateId: template.id, exerciseId: exerciseMap.get('Tricep Extension'), orderIndex: 5, sets: 3, repsMin: 10, repsMax: 15, targetRir: 1, restSeconds: 90 },
        ]
      })
    }
  }

  // 5. Create Food Database (Hostel Friendly)
  const foods = [
    { name: 'Oats (Raw)', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, servingSize: '100g', isEstimate: true, isHostelFriendly: true },
    { name: 'Milk (Toned)', calories: 58, protein: 3.2, carbs: 4.8, fat: 3.0, fiber: 0, servingSize: '100ml', isEstimate: true, isHostelFriendly: true },
    { name: 'Curd (Dahi)', calories: 98, protein: 3.1, carbs: 3.4, fat: 4.3, fiber: 0, servingSize: '100g', isEstimate: true, isHostelFriendly: true },
    { name: 'Soya Chunks', calories: 345, protein: 52, carbs: 33, fat: 0.5, fiber: 13, servingSize: '100g', isEstimate: true, isHostelFriendly: true },
    { name: 'Paneer', calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0, servingSize: '100g', isEstimate: true, isHostelFriendly: true },
    { name: 'Roasted Chana', calories: 369, protein: 19, carbs: 58, fat: 5, fiber: 17, servingSize: '100g', isEstimate: true, isHostelFriendly: true },
    { name: 'Peanuts (Roasted)', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5, servingSize: '100g', isEstimate: true, isHostelFriendly: true },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, servingSize: '100g (1 medium)', isEstimate: true, isHostelFriendly: true },
    { name: 'Dal (Cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, servingSize: '1 bowl (~150g)', isEstimate: true, isHostelFriendly: true },
    { name: 'Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, servingSize: '1 bowl (~150g)', isEstimate: true, isHostelFriendly: true },
    { name: 'Roti', calories: 120, protein: 3.5, carbs: 24, fat: 0.5, fiber: 3.5, servingSize: '1 medium', isEstimate: true, isHostelFriendly: true },
    { name: 'Sev Puri', calories: 280, protein: 5, carbs: 35, fat: 12, fiber: 3, servingSize: '1 plate (6 puris)', isEstimate: true, isHostelFriendly: false },
    { name: 'Creatine Monohydrate', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: '5g', isEstimate: false, isHostelFriendly: true }
  ]

  await prisma.food.createMany({ data: foods })
  
  console.log('Created Hostel Food Database')
  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
