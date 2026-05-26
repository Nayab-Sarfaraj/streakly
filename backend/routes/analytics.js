const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const HabitLog = require('../models/HabitLog');

const HABIT_IDS = ['gym','reading','company','learning','sideproject','pixlreel','kastreel','post','jobhunt'];
const HABIT_NAMES = {
  gym:         '🏋️ Gym / Workout',
  reading:     '📚 Book Reading',
  company:     '💼 Company Work',
  learning:    '🧠 Learning / Courses',
  sideproject: '🚀 Side Projects',
  pixlreel:    '🎬 Pixl AI Reel',
  kastreel:    '🎬 Kast Reel',
  post:        '📣 Post on X / LinkedIn',
  jobhunt:     '💼 Job Hunt',
};
const USER_ID = 'default';

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const today = dayjs();
    const year = today.year();
    const month = String(today.month() + 1).padStart(2, '0');
    const startOfMonth = dayjs(`${year}-${month}-01`);
    const daysInMonth = startOfMonth.daysInMonth();
    const monthDates = Array.from({ length: daysInMonth }, (_, i) =>
      startOfMonth.add(i, 'day').format('YYYY-MM-DD')
    );

    const monthLogs = await HabitLog.find({ userId: USER_ID, date: { $in: monthDates } });

    // habit counts this month
    const habitCounts = HABIT_IDS.reduce((acc, id) => { acc[id] = 0; return acc; }, {});
    monthLogs.forEach(l => HABIT_IDS.forEach(id => { if (l.habits[id]) habitCounts[id]++; }));

    const sortedHabits = Object.entries(habitCounts).sort((a, b) => b[1] - a[1]);
    const bestHabitId = sortedHabits[0][0];
    const worstHabitId = sortedHabits[sortedHabits.length - 1][0];

    const avgScoreThisMonth = monthLogs.length
      ? monthLogs.reduce((sum, l) => sum + l.scorePercent, 0) / monthLogs.length / 100
      : 0;

    // all logs for streak calculation
    const allLogs = await HabitLog.find({ userId: USER_ID }).sort({ date: -1 });
    const logMap = allLogs.reduce((acc, l) => { acc[l.date] = l; return acc; }, {});

    // current streak: consecutive days ending today with score >= 50%
    let currentStreak = 0;
    let checkDate = today;
    while (true) {
      const dateStr = checkDate.format('YYYY-MM-DD');
      const log = logMap[dateStr];
      if (log && log.scorePercent >= 50) {
        currentStreak++;
        checkDate = checkDate.subtract(1, 'day');
      } else {
        break;
      }
    }

    // longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = allLogs.map(l => l.date).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      const log = logMap[sortedDates[i]];
      if (log && log.scorePercent >= 50) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    res.json({
      bestHabit: {
        id: bestHabitId,
        name: HABIT_NAMES[bestHabitId],
        daysThisMonth: habitCounts[bestHabitId],
      },
      needsWork: {
        id: worstHabitId,
        name: HABIT_NAMES[worstHabitId],
        daysThisMonth: habitCounts[worstHabitId],
      },
      currentStreak,
      longestStreak,
      avgScoreThisMonth: parseFloat(avgScoreThisMonth.toFixed(2)),
      totalDaysLogged: allLogs.length,
      habitCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
