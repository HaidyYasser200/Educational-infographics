import type { Stage } from './stages';

export const stagesEn: Stage[] = [
  {
    id: 1,
    title: "What is Infographic?",
    icon: "🎨",
    color: "from-purple-500 to-pink-500",
    lesson: {
      title: "What is Infographic?",
      description: "An infographic is a visual representation of information and data. It combines text, images, and graphics to communicate information clearly and attractively.",
      keyPoints: [
        "Transforms complex information into easy-to-understand content",
        "Uses visual elements to attract attention",
        "Helps remember information better",
        "Widely used in education, marketing, and media"
      ]
    },
    gameType: 'matching',
    matchingItems: [
      { id: '1', concept: "Infographic", image: "Visual representation of information" },
      { id: '2', concept: "Visual Elements", image: "Attract attention" },
      { id: '3', concept: "Short Texts", image: "Prevent boredom" }
    ],
    requiredScore: 3
  },
  {
    id: 2,
    title: "Types of Infographics",
    icon: "📊",
    color: "from-blue-500 to-cyan-500",
    lesson: {
      title: "Types of Infographics",
      description: "There are multiple types of infographics, each suited for a specific purpose.",
      keyPoints: [
        "Statistical Infographic: for displaying numbers and statistics",
        "Timeline Infographic: for showing chronological sequence of events",
        "Comparison Infographic: for comparing different elements",
        "Geographic Infographic: for displaying data on maps"
      ]
    },
    gameType: 'mcq',
    mcqQuestions: [
      {
        question: "Which type of infographic is used to display numbers?",
        options: ["Timeline Infographic", "Statistical Infographic", "Geographic Infographic", "Comparison Infographic"],
        correctIndex: 1
      },
      {
        question: "What infographic type is suitable for showing a company's history?",
        options: ["Timeline Infographic", "Statistical Infographic", "Comparison Infographic", "Educational Infographic"],
        correctIndex: 0
      },
      {
        question: "Which type is best for displaying country data on a map?",
        options: ["Educational Infographic", "Timeline Infographic", "Geographic Infographic", "Comparison Infographic"],
        correctIndex: 2
      }
    ],
    requiredScore: 2
  },
  {
    id: 3,
    title: "Visual Hierarchy",
    icon: "👁️",
    color: "from-green-500 to-teal-500",
    lesson: {
      title: "Visual Hierarchy",
      description: "Visual hierarchy is arranging elements by importance to guide the reader's eye.",
      keyPoints: [
        "Larger elements attract attention first",
        "Bright colors stand out more",
        "Top position means greater importance",
        "Contrast helps highlight important elements"
      ]
    },
    gameType: 'dragdrop',
    dragDropItems: [
      { id: '1', content: "Main Title", correctOrder: 1 },
      { id: '2', content: "Subtitle", correctOrder: 2 },
      { id: '3', content: "Main Content", correctOrder: 3 },
      { id: '4', content: "Additional Details", correctOrder: 4 }
    ],
    requiredScore: 4
  },
  {
    id: 4,
    title: "Colors & Fonts",
    icon: "🎨",
    color: "from-orange-500 to-red-500",
    lesson: {
      title: "Colors & Fonts",
      description: "Choosing the right colors and fonts is essential for a successful infographic.",
      keyPoints: [
        "Use only 2-4 harmonious colors",
        "Warm colors express energy and enthusiasm",
        "Cool colors express calm and trust",
        "Choose clear and easy-to-read fonts"
      ]
    },
    gameType: 'fillblank',
    fillBlankQuestions: [
      {
        sentence: "It's preferred to use ___ harmonious colors in design",
        blank: "2-4",
        options: ["10-15", "2-4", "Only 1", "20 or more"],
        correctIndex: 1
      },
      {
        sentence: "___ colors express energy and enthusiasm",
        blank: "Warm",
        options: ["Cool", "Warm", "Gray", "Black"],
        correctIndex: 1
      },
      {
        sentence: "Fonts should be ___ and easy to read",
        blank: "clear",
        options: ["Complex", "Very small", "Clear", "Decorative"],
        correctIndex: 2
      }
    ],
    requiredScore: 2
  },
  {
    id: 5,
    title: "Icons & Symbols",
    icon: "⭐",
    color: "from-yellow-500 to-amber-500",
    lesson: {
      title: "Icons & Symbols",
      description: "Icons help convey meaning quickly and make the design more attractive.",
      keyPoints: [
        "Choose simple and clear icons",
        "Maintain a consistent icon style",
        "Use universally understood symbols",
        "Don't overuse icons in a single design"
      ]
    },
    gameType: 'matching',
    matchingItems: [
      { id: '1', concept: "Simple Icons", image: "Make understanding easier" },
      { id: '2', concept: "Consistent Style", image: "Gives an organized look" },
      { id: '3', concept: "Too Many Icons", image: "Causes distraction" }
    ],
    requiredScore: 3
  },
  {
    id: 6,
    title: "Design Rules",
    icon: "📐",
    color: "from-indigo-500 to-purple-500",
    lesson: {
      title: "Design Rules",
      description: "There are fundamental rules that make design balanced and comfortable for the eye.",
      keyPoints: [
        "Rule of Thirds: divide the design into 3 parts",
        "Balance: distribute elements equally",
        "Alignment: arrange elements on imaginary lines",
        "Repetition: use similar elements for consistency"
      ]
    },
    gameType: 'mcq',
    mcqQuestions: [
      {
        question: "What is the Rule of Thirds in design?",
        options: ["Using 3 colors", "Dividing design into 3 parts", "Using 3 fonts", "Adding 3 images"],
        correctIndex: 1
      },
      {
        question: "What does balance mean in design?",
        options: ["Using similar colors", "Distributing elements equally", "Using one font", "Adding many images"],
        correctIndex: 1
      },
      {
        question: "What is the benefit of repetition in design?",
        options: ["Making design boring", "Achieving consistency", "Increasing complexity", "Reducing elements"],
        correctIndex: 1
      }
    ],
    requiredScore: 2
  },
  {
    id: 7,
    title: "Data Presentation",
    icon: "📈",
    color: "from-teal-500 to-green-500",
    lesson: {
      title: "Data Presentation",
      description: "Choosing the right way to present data is essential for delivering the message.",
      keyPoints: [
        "Pie Chart: for percentages",
        "Bar Chart: for comparisons",
        "Line Chart: for changes over time",
        "Tables: for detailed data"
      ]
    },
    gameType: 'dragdrop',
    dragDropItems: [
      { id: '1', content: "Collect Data", correctOrder: 1 },
      { id: '2', content: "Analyze Data", correctOrder: 2 },
      { id: '3', content: "Choose Chart Type", correctOrder: 3 },
      { id: '4', content: "Design Visual Representation", correctOrder: 4 }
    ],
    requiredScore: 4
  },
  {
    id: 8,
    title: "Common Mistakes",
    icon: "⚠️",
    color: "from-red-500 to-pink-500",
    lesson: {
      title: "Common Infographic Mistakes",
      description: "Learn about common mistakes to avoid them in your designs.",
      keyPoints: [
        "Too much text and information",
        "Using too many clashing colors",
        "Lack of clear hierarchy",
        "Using low-quality images"
      ]
    },
    gameType: 'fillblank',
    fillBlankQuestions: [
      {
        sentence: "A common mistake is having ___ text and information",
        blank: "too much",
        options: ["Too little", "Too much", "Organized", "Arranged"],
        correctIndex: 1
      },
      {
        sentence: "Avoid using ___ and clashing colors",
        blank: "too many",
        options: ["Few", "Harmonious", "Too many", "Calm"],
        correctIndex: 2
      },
      {
        sentence: "Images should be of ___ quality",
        blank: "high",
        options: ["Low", "High", "Medium", "Poor"],
        correctIndex: 1
      }
    ],
    requiredScore: 2
  },
  {
    id: 9,
    title: "Analyzing Real Examples",
    icon: "🔍",
    color: "from-cyan-500 to-blue-500",
    lesson: {
      title: "Analyzing Real Examples",
      description: "Learn from analyzing successful infographics and understanding their success factors.",
      keyPoints: [
        "Observe the visual hierarchy",
        "Identify the colors used and why they were chosen",
        "Pay attention to how data is presented",
        "Evaluate the clarity of the main message"
      ]
    },
    gameType: 'mcq',
    mcqQuestions: [
      {
        question: "What's the first thing to notice when analyzing an infographic?",
        options: ["Number of colors", "Visual hierarchy", "Font size", "Number of images"],
        correctIndex: 1
      },
      {
        question: "Why do we analyze real examples?",
        options: ["To copy them exactly", "To learn from their success", "Just to criticize", "To compare prices"],
        correctIndex: 1
      },
      {
        question: "What is the most important criterion for a successful infographic?",
        options: ["Many colors", "Clear message", "Long text", "Many pages"],
        correctIndex: 1
      }
    ],
    requiredScore: 2
  },
  {
    id: 10,
    title: "Final Challenge",
    icon: "🏆",
    color: "from-amber-500 to-orange-500",
    lesson: {
      title: "Final Challenge",
      description: "Time to test everything you've learned! Prove you've become an infographic pro.",
      keyPoints: [
        "Review all previous concepts",
        "Apply the rules in your choices",
        "Think like a professional designer",
        "Trust what you've learned!"
      ]
    },
    gameType: 'dragdrop',
    dragDropItems: [
      { id: '1', content: "Define Goal & Audience", correctOrder: 1 },
      { id: '2', content: "Collect & Analyze Data", correctOrder: 2 },
      { id: '3', content: "Choose Appropriate Type", correctOrder: 3 },
      { id: '4', content: "Design Initial Layout", correctOrder: 4 },
      { id: '5', content: "Add Visual Elements", correctOrder: 5 },
      { id: '6', content: "Review & Improve", correctOrder: 6 }
    ],
    requiredScore: 6
  }
];
