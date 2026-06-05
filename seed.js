// Seed script for Firestore emulator
// Usage: firebase emulators:start --import ./seed

const projects = [
  {
    id: 'default',
    name: 'Sprint Analytics Engine',
    description: 'Aesthetic metrics visualization panel & task orchestration monitor'
  }
];

// Empty seed - app starts fresh, user populates live data
const data = {
  'projects/default': { name: 'Sprint Analytics Engine', description: 'Aesthetic metrics visualization panel & task orchestration monitor' }
};

module.exports = { data };
