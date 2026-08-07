// Populates the database with demo data: 1 admin, 2 managers, 6 employees (3 per manager),
// and ~30 weekdays of realistic attendance per employee. Selfies use placeholder image URLs
// rather than real Cloudinary uploads — seeding shouldn't require live Cloudinary credentials
// or push a hundred-plus throwaway images into a real Cloudinary account.
//
// WARNING: this DELETES all existing User/Attendance/Overtime/Counter documents in the target
// database (MONGO_URI) before repopulating. Run with care against a real cluster.
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import User from '../models/User.model.js';
import Attendance from '../models/Attendance.model.js';
import Overtime from '../models/Overtime.model.js';
import Counter from '../models/Counter.model.js';
import { normalizeDate } from '../utils/dateHelper.js';
import { requestOvertime, reviewOvertime } from '../services/overtime.service.js';

const DEFAULT_PASSWORD = 'Passw0rd!123';
const PLACEHOLDER_SELFIE_URL = 'https://placehold.co/400x400/6366f1/ffffff?text=Selfie';
const OFFICE_LOCATION = {
  latitude: env.OFFICE_LATITUDE,
  longitude: env.OFFICE_LONGITUDE,
  address: 'Seed Office Location',
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const isWeekend = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

const punch = (time) => ({
  time,
  selfieUrl: PLACEHOLDER_SELFIE_URL,
  selfiePublicId: 'seed/placeholder',
  location: OFFICE_LOCATION,
});

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    Attendance.deleteMany({}),
    Overtime.deleteMany({}),
    Counter.deleteMany({}),
  ]);
}

async function createUsers() {
  const admin = await User.create({
    name: 'Ava Admin',
    email: 'admin@attendance.test',
    password: DEFAULT_PASSWORD,
    role: 'admin',
    department: 'Operations',
  });

  const managerDefs = [
    { name: 'Miles Manager', email: 'manager1@attendance.test', department: 'Engineering' },
    { name: 'Maya Manager', email: 'manager2@attendance.test', department: 'Sales' },
  ];

  const managers = [];
  for (const def of managerDefs) {
    managers.push(await User.create({ ...def, password: DEFAULT_PASSWORD, role: 'manager' }));
  }

  const employeeNames = [
    'Elena Employee',
    'Ethan Employee',
    'Ella Employee',
    'Ezra Employee',
    'Eve Employee',
    'Emil Employee',
  ];

  const employees = [];
  for (let i = 0; i < employeeNames.length; i += 1) {
    const manager = managers[Math.floor(i / 3)];
    employees.push(
      await User.create({
        name: employeeNames[i],
        email: `employee${i + 1}@attendance.test`,
        password: DEFAULT_PASSWORD,
        role: 'employee',
        department: manager.department,
        manager: manager._id,
      })
    );
  }

  return { admin, managers, employees };
}

async function seedAttendanceForEmployee(employee, { markInProgressToday }) {
  const today = normalizeDate(new Date());

  // The "still mid-shift" record should land on the most recent weekday, not literally today —
  // today itself may be a weekend, and the weekend-skip below runs before an isToday check ever
  // would, so anchoring on offset === 0 would silently produce no in-progress record at all.
  let mostRecentWeekdayOffset = 0;
  while (isWeekend(new Date(today.getTime() - mostRecentWeekdayOffset * 86_400_000))) {
    mostRecentWeekdayOffset += 1;
  }

  const records = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - offset);
    if (isWeekend(date)) continue;

    const isMostRecentWeekday = offset === mostRecentWeekdayOffset;

    // Simulate the occasional missed day so the data isn't unrealistically perfect.
    if (!isMostRecentWeekday && Math.random() < 0.08) continue;

    const punchInTime = new Date(date);
    punchInTime.setUTCHours(0, Math.round(randomBetween(-15, 45)) + 9 * 60, 0, 0);

    if (isMostRecentWeekday && markInProgressToday) {
      records.push({ user: employee._id, date, punchIn: punch(punchInTime) });
      continue;
    }

    const workedHours = randomBetween(6.5, 9.75);
    const punchOutTime = new Date(punchInTime.getTime() + workedHours * 3_600_000);

    const verificationRoll = Math.random();
    const verificationStatus =
      verificationRoll < 0.55 ? 'pending' : verificationRoll < 0.85 ? 'valid' : 'invalid';

    records.push({
      user: employee._id,
      date,
      punchIn: punch(punchInTime),
      punchOut: punch(punchOutTime),
      verificationStatus,
      ...(verificationStatus !== 'pending' && {
        verifiedBy: employee.manager,
        verifiedAt: new Date(punchOutTime.getTime() + 3_600_000),
      }),
    });
  }

  // Attendance.create() (not insertMany) so the pre-save hook derives totalWorkingHours/workStatus
  // from the timestamps, the same as it would for a real punch — keeping seed data internally
  // consistent with the model's own invariants instead of us hand-computing a parallel copy.
  if (records.length) {
    await Attendance.create(records);
  }
}

async function seedOvertimeRequests({ managers, employees }) {
  // One employee per manager gets each of the three OT outcomes, spread across both teams.
  const plan = [
    { employee: employees[0], manager: managers[0], outcome: 'approved' },
    { employee: employees[1], manager: managers[0], outcome: 'rejected' },
    { employee: employees[2], manager: managers[0], outcome: 'pending' },
    { employee: employees[3], manager: managers[1], outcome: 'approved' },
    { employee: employees[4], manager: managers[1], outcome: 'pending' },
    { employee: employees[5], manager: managers[1], outcome: 'rejected' },
  ];

  for (const { employee, manager, outcome } of plan) {
    const eligible = await Attendance.findOne({
      user: employee._id,
      totalWorkingHours: { $gt: env.STANDARD_SHIFT_HOURS },
      'punchOut.time': { $ne: null },
    }).sort({ date: -1 });

    if (!eligible) continue; // unlucky random draw with no >8h day; skip rather than force one

    const overage = Math.round((eligible.totalWorkingHours - env.STANDARD_SHIFT_HOURS) * 10) / 10;
    const overtime = await requestOvertime(employee._id, {
      attendanceId: eligible._id,
      requestedHours: Math.max(0.5, overage), // Overtime.requestedHours has a schema min of 0.5
      reason: 'Seed data: stayed late to close out sprint deliverables',
    });

    if (outcome !== 'pending') {
      await reviewOvertime(manager, overtime._id, {
        status: outcome,
        reviewComment:
          outcome === 'approved' ? 'Approved — confirmed against the timeline' : 'Rejected — insufficient justification',
      });
    }
  }
}

function printCredentials({ admin, managers, employees }) {
  const rows = [
    { role: 'admin', name: admin.name, email: admin.email, employeeId: admin.employeeId },
    ...managers.map((m) => ({ role: 'manager', name: m.name, email: m.email, employeeId: m.employeeId })),
    ...employees.map((e) => ({ role: 'employee', name: e.name, email: e.email, employeeId: e.employeeId })),
  ];

  console.log('\n================ SEED COMPLETE ================');
  console.log(`All accounts share the same password: ${DEFAULT_PASSWORD}`);
  console.table(rows);
  console.log('=================================================\n');
}

async function run() {
  if (env.NODE_ENV === 'production' && process.argv[2] !== '--force') {
    logger.error(
      'Refusing to run the seeder with NODE_ENV=production without --force — this deletes all existing data.'
    );
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);
  logger.info(`Seeding database: ${mongoose.connection.name}`);

  await clearCollections();
  const { admin, managers, employees } = await createUsers();

  for (let i = 0; i < employees.length; i += 1) {
    // Exactly one employee's most recent weekday is left mid-shift (punched in, not out) so the
    // dashboards have a realistic "in-progress" record to render.
    await seedAttendanceForEmployee(employees[i], { markInProgressToday: i === 0 });
  }

  await seedOvertimeRequests({ managers, employees });

  printCredentials({ admin, managers, employees });

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  // A one-shot CLI script, not a long-running server — console.error is synchronous, so this
  // exits immediately rather than depending on an async winston transport callback to fire.
  console.error(`Seeding failed: ${error.stack}`);
  process.exit(1);
});
