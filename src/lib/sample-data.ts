import type { SeatingChartData, Guest, Table } from '@/types/seating';

const firstNames = ['Alex', 'Ben', 'Chloe', 'David', 'Emily', 'Finn', 'Grace', 'Henry', 'Isla', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tara', 'Ursula', 'Victor', 'Wendy', 'Xavi', 'Yara', 'Zane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nora'];
const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell'];

function getRandomName(usedNames: Set<string>): string {
  let name: string;
  let attempts = 0;
  do {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    name = `${firstName} ${lastName}`;
    attempts++;
  } while (usedNames.has(name) && attempts < (firstNames.length * lastNames.length / 2)); // Prevent infinite loop if names run out
  if (usedNames.has(name) && attempts >= (firstNames.length * lastNames.length / 2)) {
    // If still colliding after many attempts, append a number
    name = `${name} ${Math.floor(Math.random() * 100)}`;
  }
  usedNames.add(name);
  return name;
}

export function generateSampleData(): SeatingChartData {
  const tables: Table[] = [];
  const usedNames = new Set<string>();

  for (let i = 1; i <= 10; i++) {
    const guests: Guest[] = [];
    for (let j = 1; j <= 10; j++) {
      guests.push({
        id: `guest-${i}-${j}-${Math.random().toString(36).substring(7)}`, // Ensure unique IDs
        name: getRandomName(usedNames),
      });
    }
    tables.push({
      id: `table-${i}-${Math.random().toString(36).substring(7)}`, // Ensure unique IDs
      name: `Table ${i}`,
      guests,
    });
  }
  return { tables };
}
