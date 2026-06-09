const { v4: uuidv4 } = require("uuid")

// just using memory for now, swap with a db later if needed
const store = {
  assignments: [
    {
      id: uuidv4(),
      title: "Linear Algebra Problem Set 3",
      subject: "ECE",
      course: "MATH 2130",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      status: "in-progress",
      notes: "Focus on eigenvalues section",
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "ML Assignment: Implement Linear Regression",
      subject: "ML",
      course: "CS 4780",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      status: "not-started",
      notes: "Use numpy only, no sklearn",
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Circuit Analysis Lab Report",
      subject: "ECE",
      course: "ECE 2100",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "urgent",
      status: "in-progress",
      notes: "Include oscilloscope screenshots",
      createdAt: new Date().toISOString(),
    },
  ],

  grades: [
    {
      id: uuidv4(),
      course: "MATH 2130",
      courseName: "Linear Algebra",
      subject: "ECE",
      credits: 3,
      assignments: [
        { name: "Assignment 1", score: 88, maxScore: 100, weight: 20 },
        { name: "Midterm", score: 76, maxScore: 100, weight: 30 },
      ],
    },
    {
      id: uuidv4(),
      course: "CS 4780",
      courseName: "Machine Learning",
      subject: "ML",
      credits: 4,
      assignments: [
        { name: "Assignment 1", score: 95, maxScore: 100, weight: 15 },
        { name: "Assignment 2", score: 89, maxScore: 100, weight: 15 },
      ],
    },
    {
      id: uuidv4(),
      course: "ECE 2100",
      courseName: "Circuit Analysis",
      subject: "ECE",
      credits: 4,
      assignments: [
        { name: "Lab 1", score: 92, maxScore: 100, weight: 10 },
        { name: "Midterm", score: 81, maxScore: 100, weight: 35 },
      ],
    },
  ],

  notes: [
    {
      id: uuidv4(),
      title: "Backpropagation Notes",
      content: "The chain rule is key. dL/dw = dL/da * da/dz * dz/dw. Cache intermediate values during forward pass.",
      subject: "ML",
      tags: ["neural-networks", "calculus"],
      pinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Thevenin Equivalent Circuits",
      content: "Steps: 1) Remove load. 2) Find Vth. 3) Kill sources, find Rth. 4) Reconnect load.",
      subject: "ECE",
      tags: ["circuits", "exam-prep"],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  sessions: [],

  streak: {
    current: 4,
    longest: 12,
    lastActiveDate: new Date().toDateString(),
  },
}

module.exports = { store, uuidv4 }
