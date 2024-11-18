const Objective = require("../../models/iperformance/objective");
const Goal = require("../../models/iperformance/goal");

const calculateParentStatusAndProgress = (objectives) => {
  const completedObjectives = objectives.filter(
    (objective) => objective.status === "Completed"
  );

  const progressPercentage = completedObjectives
    ? (completedObjectives.length / objectives.length) * 100
    : 0;

  const progress = progressPercentage;

  // compute the status
  const isInProgress = objectives.some(
    (objective) =>
      objective.status === "In progress" ||
      objective.status === "In review" ||
      objective.status === "Completed"
  );

  const allReview = objectives.every(
    (objective) => objective.status === "In review"
  );
  const allCompleted = objectives.every(
    (objective) => objective.status === "Completed"
  );

  const parentStatus = allReview
    ? "In review"
    : allCompleted
    ? "Completed"
    : isInProgress
    ? "In progress"
    : "Not started";

  return { parentStatus, progress };
};

const calculatePercentageIncrease = (previousValue, currentValue) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Math.floor(((currentValue - previousValue) / previousValue) * 100);
};

const getUserCompliance = (users, tasks) => {
  const userTaskCounts = tasks.reduce((counts, task) => {
    const userIds = task.owner;

    // for each of the user ids, increment the count
    userIds.forEach((userId) => {
      if (!counts[userId]) {
        counts[userId] = 0;
      }
      counts[userId] += 1;
    });

    return counts;
  }, {});

  let compliantUserCount = 0;

  users.forEach((user) => {
    const taskCount = userTaskCounts[user._id] || 0;
    if (taskCount >= 5) {
      compliantUserCount += 1;
    }
  });
  console.log({ compliantUserCount, users: users.length });
  return (compliantUserCount / users.length) * 100;
};

const getTeamCompliance = (teams, tasks) => {
  const complianceSum = teams.reduce((acc, team) => {
    const memberIds = team.members.map((member) => member.user.toString());

    if (memberIds.length > 0) {
      // get all tasks for the team members
      const membersTasks = tasks.filter((task) => {
        return task.owner.some((owner) => memberIds.includes(owner.toString()));
      });

      // Calculate the compliance as a percentage (capped at 100%)
      const taskCount = membersTasks.length;
      const compliance = Math.min((taskCount / 5) * 100, 100);

      acc += compliance;
    }

    return acc;
  }, 0);

  // Return the average compliance percentage for all teams
  return complianceSum / teams.length;
};

// Function to get the start and end of the month
const getMonthBoundaries = (date) => {
  return {
    beginningOfMonth: new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getTime(),
    endOfMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime(),
  };
};

// Function to get tasks within a specific month
const getMonthlyTasks = async (start, end) => {
  return await Task.find({
    startDate: { $gte: start, $lte: end },
  }).populate("weight");
};

// Function to initialize user statistics
const initializeUserStats = (weight) => {
  return {
    totalWeight: 0,
    completedWeight: 0,
    totalTasks: 0,
    completedTasks: 0,
    weights: new Set(),
    weightCount: Object.keys(weight).length > 0 ? { [weight._id]: 1 } : weight, // Count for the initial weight
  };
};

const updateUserStats = (stats, task) => {
  stats.totalWeight += task.weight?.value || 0;

  stats.totalTasks += 1;
  task.weight && stats.weights.add(task.weight);

  // Count the weight occurrences
  const weightId = task.weight?._id.toString();

  if (weightId) {
    stats.weightCount[weightId] = (stats.weightCount[weightId] || 0) + 1;
  }

  if (task.status === "Completed") {
    stats.completedWeight += task.weight?.value || 0;
    stats.completedTasks += 1;
  }
};

// Function to accumulate user statistics from tasks
const accumulateUserStats = (tasks, users, field = "_id") => {
  const userStats = {};

  users.forEach((user) => {
    userStats[user[field]] = initializeUserStats({});
  });

  tasks.forEach((task) => {
    task.owner.forEach((owner) => {
      if (!userStats[owner]) {
        userStats[owner] = initializeUserStats(task.weight);
      }
      updateUserStats(userStats[owner], task);
    });
  });

  return userStats;
};

const accumulateTeamUserStats = (tasks, users, field = "_id") => {
  const userStats = {};

  users.forEach((user) => {
    userStats[user[field]] = initializeUserStats({});
  });

  const memberIds = users.map((item) => item.user.toString());

  tasks.forEach((task) => {
    task.owner.forEach((owner) => {
      // only update if the owner is among the users
      if (memberIds.includes(owner.toString())) {
        if (!userStats[owner]) {
          userStats[owner] = initializeUserStats(task.weight);
        }
        updateUserStats(userStats[owner], task);
      }
    });
  });
  return userStats;
};

// Function to update user statistics based on a task

// Function to calculate performance for each user
const calculatePerformance = (userStats, users, field = "_id") => {
  return Object.entries(userStats)
    .map(([userId, stats]) => {
      const user = users.find((user) => user[field].toString() === userId); // get the user object
      const performance =
        (stats.completedWeight / stats.totalWeight) * 100 || 0; // Prevent division by zero
      return { user, performance, ...stats };
    })
    .sort((a, b) => b.performance - a.performance)
    .map((user) => {
      user.weights = Array.from(user.weights);
      return user;
    });
};

const transformStats = ([id, stats]) => ({
  id,
  ...stats,
  weights: Array.from(stats.weights), // Convert Set to an array
});

const mergeArray = (arr) =>
  arr.reduce((acc, current) => {
    if (!acc) return { ...current };

    // Sum numeric fields
    // acc.performance += current.performance;
    acc.totalWeight += current.totalWeight;
    acc.completedWeight += current.completedWeight;
    acc.totalTasks += current.totalTasks;
    acc.completedTasks += current.completedTasks;

    // Combine unique weights using a Set
    acc.weights = [...new Set([...acc.weights, ...current.weights])];
    // Sum weight counts
    Object.entries(current.weightCount).forEach(([weightId, count]) => {
      acc.weightCount[weightId] = (acc.weightCount[weightId] || 0) + count;
    });

    return acc;
  }, null);

const updateObjectiveStatus = async (objectiveId) => {
  try {
    // get the tasks for that objective
    const objectiveWithTasks = await Objective.aggregate([
      {
        $match: { _id: objectiveId },
      },
      {
        $lookup: {
          from: "task2",
          localField: "_id",
          foreignField: "objectiveId",
          as: "tasks",
        },
      },
    ]);
    const tasks = objectiveWithTasks[0].tasks;

    //calculate the percentage base on the tasks statuses
    const { progress, parentStatus } = calculateParentStatusAndProgress(tasks);
    console.log({ progress, parentStatus });

    const updatedObjective = await Objective.findByIdAndUpdate(
      objectiveId,
      {
        status: parentStatus,
        progress: progress,
      },
      { new: true }
    );

    if (updatedObjective.goalId) {
      // find the goal
      const goalsWithObjectives = await Goal.aggregate([
        {
          $match: { _id: updatedObjective.goalId },
        },
        {
          $lookup: {
            from: "objectives",
            localField: "_id",
            foreignField: "goalId",
            as: "objectives",
          },
        },
      ]);

      const objectives = goalsWithObjectives[0].objectives;
      const { progress, parentStatus } =
        calculateParentStatusAndProgress(objectives);

      // update the goal if needed
      await Goal.findByIdAndUpdate(
        updatedObjective.goalId,
        {
          status: parentStatus,
          progress: progress,
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  calculatePercentageIncrease,
  getUserCompliance,
  getTeamCompliance,
  getMonthBoundaries,
  getMonthlyTasks,
  accumulateUserStats,
  accumulateTeamUserStats,
  calculatePerformance,
  transformStats,
  mergeArray,
  updateObjectiveStatus,
  calculateParentStatusAndProgress,
};