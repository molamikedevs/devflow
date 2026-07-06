export const SEARCH_DEBOUNCE_MS = 300;

export const questions = [
  {
    _id: '1',
    title: 'How to manage state in React?',
    description:
      'I am building a React application and I want to understand the best way to manage state between components.',
    tags: [
      { _id: '1', name: 'react' },
      { _id: '2', name: 'javascript' },
    ],
    author: {
      _id: '1',
      name: 'John Doe',
      image:
        'https://img.magnific.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80',
    },
    upvote: 22,
    downvote: 3,
    answers: 12,
    views: 560,
    createdAt: new Date(),
  },
  {
    _id: '2',
    title: 'How does async/await work in JavaScript?',
    description:
      'I understand promises but I am confused about how async and await work behind the scenes.',
    tags: [
      { _id: '3', name: 'javascript' },
      { _id: '4', name: 'promises' },
    ],
    author: {
      _id: '2',
      name: 'Sarah Smith',
      image:
        'https://img.magnific.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80',
    },
  },
  {
    _id: '3',
    title: 'How to create a responsive layout with Tailwind CSS?',
    description:
      'I want to make my website responsive using Tailwind CSS but I am not sure how to structure my classes.',
    tags: [
      { _id: '5', name: 'tailwindcss' },
      { _id: '6', name: 'css' },
    ],
    author: {
      _id: '3',
      name: 'Michael Brown',
      image:
        'https://img.magnific.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80',
    },
    upvote: 30,
    downvote: 4,
    answers: 15,
    views: 890,
    createdAt: new Date(),
  },
  {
    _id: '4',
    title: 'What is the difference between Next.js and React?',
    description:
      'I already know React and I want to understand what benefits Next.js provides.',
    tags: [
      { _id: '7', name: 'nextjs' },
      { _id: '8', name: 'react' },
    ],
    author: {
      _id: '4',
      name: 'Emily Johnson',
      image:
        'https://img.magnific.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80',
    },
    upvote: 18,
    downvote: 2,
    answers: 7,
    views: 420,
    createdAt: new Date(),
  },
  {
    _id: '5',
    title: 'How to optimize a website performance?',
    description:
      'My website is loading slowly. What techniques can I use to improve performance?',
    tags: [
      { _id: '9', name: 'performance' },
      { _id: '10', name: 'web-development' },
    ],
    author: {
      _id: '5',
      name: 'David Wilson',
      image:
        'https://img.magnific.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80',
    },
    upvote: 22,
    downvote: 3,
    answers: 12,
    views: 560,
    createdAt: new Date(),
  },
];

export const sidebarLinks = [
  {
    imgURL: '/icons/home.svg',
    route: '/',
    label: 'Home',
  },
  {
    imgURL: '/icons/users.svg',
    route: '/community',
    label: 'Community',
  },
  {
    imgURL: '/icons/star.svg',
    route: '/collections',
    label: 'Collections',
  },
  {
    imgURL: '/icons/suitcase.svg',
    route: '/jobs',
    label: 'Find Jobs',
  },
  {
    imgURL: '/icons/tag.svg',
    route: '/tags',
    label: 'Tags',
  },
  {
    imgURL: '/icons/user.svg',
    route: '/profile',
    label: 'Profile',
  },
  {
    imgURL: '/icons/question.svg',
    route: '/ask-question',
    label: 'Ask a question',
  },
];
