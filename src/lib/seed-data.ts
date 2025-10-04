import { db, Job, Candidate, Assessment, CandidateStage, JobStatus } from './db';

const jobTitles = [
  'Senior Frontend Engineer',
  'Backend Developer',
  'Full Stack Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Data Scientist',
  'Mobile Developer',
  'QA Engineer',
  'Technical Lead',
  'Solutions Architect',
  'Security Engineer',
  'Database Administrator',
  'Machine Learning Engineer',
  'Engineering Manager',
  'Site Reliability Engineer',
  'Platform Engineer',
  'Customer Success Manager',
  'Sales Engineer',
  'Product Designer',
  'Content Writer',
  'Marketing Manager',
  'HR Specialist',
  'Business Analyst',
  'Scrum Master'
];

const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  
  if (jobCount > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Seed 25 Jobs
  const jobs: Job[] = jobTitles.slice(0, 25).map((title, index) => ({
    id: `job-${index + 1}`,
    title,
    slug: generateSlug(title),
    description: `We are looking for an exceptional ${title} to join our growing team. This role offers exciting challenges and opportunities for professional growth.`,
    status: (Math.random() > 0.3 ? 'active' : 'archived') as JobStatus,
    tags: ['Remote', 'Full-time', Math.random() > 0.5 ? 'Senior' : 'Mid-level'],
    order: index,
    createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    updatedAt: new Date()
  }));

  await db.jobs.bulkAdd(jobs);

  // Seed 1000 Candidates
  const candidates: Candidate[] = [];
  const activeJobs = jobs.filter(j => j.status === 'active');

  for (let i = 0; i < 1000; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const job = randomElement(activeJobs);
    const stage = randomElement(stages);
    const appliedDate = randomDate(new Date(2024, 0, 1), new Date());

    candidates.push({
      id: `candidate-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      jobId: job.id,
      stage,
      appliedAt: appliedDate,
      notes: [],
      stageHistory: [
        {
          id: `history-${i}-1`,
          from: null,
          to: 'applied',
          changedAt: appliedDate,
          changedBy: 'System'
        }
      ]
    });
  }

  await db.candidates.bulkAdd(candidates);

  // Seed 3 Assessments
  const assessments: Assessment[] = [
    {
      id: 'assessment-1',
      jobId: jobs[0].id,
      title: 'Technical Assessment - Frontend',
      sections: [
        {
          id: 'section-1',
          title: 'Technical Skills',
          questions: [
            {
              id: 'q1',
              type: 'single-choice',
              title: 'How many years of React experience do you have?',
              required: true,
              options: ['0-1 years', '1-3 years', '3-5 years', '5+ years']
            },
            {
              id: 'q2',
              type: 'multi-choice',
              title: 'Which state management libraries have you used?',
              required: true,
              options: ['Redux', 'MobX', 'Zustand', 'Recoil', 'Context API']
            },
            {
              id: 'q3',
              type: 'short-text',
              title: 'What is your favorite frontend framework and why?',
              required: true,
              maxLength: 200
            },
            {
              id: 'q4',
              type: 'long-text',
              title: 'Describe a challenging technical problem you solved recently.',
              required: false,
              maxLength: 1000
            },
            {
              id: 'q5',
              type: 'numeric',
              title: 'Rate your TypeScript proficiency (1-10)',
              required: true,
              numericRange: { min: 1, max: 10 }
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Availability',
          questions: [
            {
              id: 'q6',
              type: 'single-choice',
              title: 'Are you available for full-time employment?',
              required: true,
              options: ['Yes', 'No']
            },
            {
              id: 'q7',
              type: 'short-text',
              title: 'When can you start?',
              required: true,
              conditionalOn: { questionId: 'q6', value: 'Yes' }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'assessment-2',
      jobId: jobs[1].id,
      title: 'Backend Engineering Assessment',
      sections: [
        {
          id: 'section-3',
          title: 'Technical Background',
          questions: [
            {
              id: 'q8',
              type: 'multi-choice',
              title: 'Which backend technologies are you proficient in?',
              required: true,
              options: ['Node.js', 'Python', 'Java', 'Go', 'Ruby', '.NET']
            },
            {
              id: 'q9',
              type: 'single-choice',
              title: 'Have you worked with microservices architecture?',
              required: true,
              options: ['Yes, extensively', 'Yes, somewhat', 'No, but interested', 'No']
            },
            {
              id: 'q10',
              type: 'long-text',
              title: 'Describe your experience with database design and optimization.',
              required: true,
              maxLength: 1000
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'assessment-3',
      jobId: jobs[4].id,
      title: 'Product Management Assessment',
      sections: [
        {
          id: 'section-4',
          title: 'Product Experience',
          questions: [
            {
              id: 'q11',
              type: 'short-text',
              title: 'What product management frameworks do you use?',
              required: true,
              maxLength: 200
            },
            {
              id: 'q12',
              type: 'numeric',
              title: 'Years of product management experience?',
              required: true,
              numericRange: { min: 0, max: 30 }
            },
            {
              id: 'q13',
              type: 'long-text',
              title: 'Describe a product launch you led from conception to delivery.',
              required: true,
              maxLength: 1500
            },
            {
              id: 'q14',
              type: 'file-upload',
              title: 'Upload your portfolio or case studies',
              required: false
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.assessments.bulkAdd(assessments);

  console.log('Database seeded successfully!');
}
