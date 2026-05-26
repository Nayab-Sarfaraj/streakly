const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const HabitLog = require('../models/HabitLog');

const HABIT_IDS = ['gym','reading','company','learning','sideproject','pixlreel','kastreel','post','jobhunt'];
const USER_ID = 'default';

function computeStats(habits) {
  const completedCount = HABIT_IDS.filter(id => habits[id]).length;
  const scorePercent = Math.round((completedCount / 9) * 100);
  return { completedCount, scorePercent };
}

function emptyHabits() {
  return HABIT_IDS.reduce((acc, id) => { acc[id] = false; return acc; }, {});
}

// GET /api/logs/today
router.get('/today', async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    let log = await HabitLog.findOne({ userId: USER_ID, date: today });
    if (!log) {
      log = await HabitLog.create({
        userId: USER_ID,
        date: today,
        habits: emptyHabits(),
        completedCount: 0,
        scorePercent: 0,
      });
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/logs/today
router.put('/today', async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const { habits } = req.body;
    const { completedCount, scorePercent } = computeStats(habits);

    const log = await HabitLog.findOneAndUpdate(
      { userId: USER_ID, date: today },
      { $set: { habits, completedCount, scorePercent } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/week?start=YYYY-MM-DD
router.get('/week', async (req, res) => {
  try {
    const { start } = req.query;
    const startDate = dayjs(start);
    const dates = Array.from({ length: 7 }, (_, i) => startDate.add(i, 'day').format('YYYY-MM-DD'));

    const logs = await HabitLog.find({ userId: USER_ID, date: { $in: dates } });
    const logMap = logs.reduce((acc, l) => { acc[l.date] = l; return acc; }, {});

    const result = dates.map(date => logMap[date] || {
      userId: USER_ID,
      date,
      habits: emptyHabits(),
      completedCount: 0,
      scorePercent: 0,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/month?year=YYYY&month=MM
router.get('/month', async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = dayjs(`${year}-${month}-01`);
    const daysInMonth = startDate.daysInMonth();
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
      startDate.add(i, 'day').format('YYYY-MM-DD')
    );

    const logs = await HabitLog.find({ userId: USER_ID, date: { $in: dates } });
    const logMap = logs.reduce((acc, l) => { acc[l.date] = l; return acc; }, {});

    const result = dates.map(date => logMap[date] || {
      userId: USER_ID,
      date,
      habits: emptyHabits(),
      completedCount: 0,
      scorePercent: 0,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/year?year=YYYY
router.get('/year', async (req, res) => {
  try {
    const { year } = req.query;
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const results = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        const startDate = dayjs(`${year}-${month}-01`);
        const daysInMonth = startDate.daysInMonth();
        const dates = Array.from({ length: daysInMonth }, (_, d) =>
          startDate.add(d, 'day').format('YYYY-MM-DD')
        );

        const logs = await HabitLog.find({ userId: USER_ID, date: { $in: dates } });

        if (!logs.length) {
          return { month: monthNames[i], completedTotal: 0, scoreAvg: 0, bestHabit: null };
        }

        const completedTotal = logs.reduce((sum, l) => sum + l.completedCount, 0);
        const scoreAvg = logs.reduce((sum, l) => sum + l.scorePercent, 0) / logs.length / 100;

        // find best habit
        const habitCounts = HABIT_IDS.reduce((acc, id) => { acc[id] = 0; return acc; }, {});
        logs.forEach(l => HABIT_IDS.forEach(id => { if (l.habits[id]) habitCounts[id]++; }));
        const bestHabit = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0][0];

        return { month: monthNames[i], completedTotal, scoreAvg: parseFloat(scoreAvg.toFixed(2)), bestHabit };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
