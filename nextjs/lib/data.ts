export interface Link {
  id: string;
  url: string;
  title: string;
  image?: string;
  summary?: string;
  tags: string[];
  createdAt: string;
}

export const links: Link[] = [
  {
    id: '1',
    url: 'https://nextjs.org',
    title: 'Next.js by Vercel - The React Framework',
    image: 'https://nextjs.org/og.png',
    summary: 'Next.js is a React framework for building full-stack web applications. You use React Components to build user interfaces, and Next.js for additional features and optimizations.',
    tags: ['react', 'framework', 'javascript'],
    createdAt: '2023-06-01T12:00:00Z',
  },
  {
    id: '2',
    url: 'https://react.dev',
    title: 'React: The JavaScript library for building user interfaces',
    image: 'https://react.dev/images/og-home.png',
    summary: 'React is a JavaScript library for building user interfaces. It allows you to compose complex UIs from small and isolated pieces of code called "components".',
    tags: ['react', 'javascript', 'frontend'],
    createdAt: '2023-06-02T14:30:00Z',
  },
  {
    id: '3',
    url: 'https://www.typescriptlang.org',
    title: 'TypeScript: JavaScript with syntax for types',
    image: 'https://www.typescriptlang.org/images/branding/og-image.png',
    summary: 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
    tags: ['typescript', 'javascript', 'programming'],
    createdAt: '2023-06-03T09:15:00Z',
  },
];
