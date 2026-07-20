import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDevIconClassName(techName: string) {
  const normalizedTechName = techName.replace(/[. ]/g, '').toLowerCase();

  const techMap: { [key: string]: string } = {
    javaScript: 'devicon-javascript-plain',
    js: 'devicon-javascript-plain',
    typeScript: 'devicon-typescript-plain',
    ts: 'devicon-typescript-plain',
    react: 'devicon-react-original',
    reactjs: 'devicon-react-original',
    nextjs: 'devicon-nextjs-plain',
    next: 'devicon-nextjs-plain',
    nodejs: 'devicon-nodejs-plain',
    node: 'devicon-nodejs-plain',
    bun: 'devicon-bun-plain',
    bunjs: 'devicon-bun-plain',
    deno: 'devicon-denojs-original',
    denojs: 'devicon-denojs-plain',
    python: 'devicon-python-plain',
    java: 'devicon-java-plain',
    cpp: 'devicon-cplusplus-plain',
    cplusplus: 'devicon-cplusplus-plain',
    csharp: 'devicon-csharp-plain',
    php: 'devicon-php-plain',
    html: 'devicon-html5-plain',
    html5: 'devicon-html5-plain',
    css: 'devicon-css3-plain',
    css3: 'devicon-css3-plain',
    git: 'devicon-git-plain',
    docker: 'devicon-docker-plain',
    mongodb: 'devicon-mongodb-plain',
    mongo: 'devicon-mongodb-plain',
    mysql: 'devicon-mysql-plain',
    postgresql: 'devicon-postgresql-plain',
    postgres: 'devicon-postgresql-plain',
    aws: 'devicon-amazonwebservices-original',
    amazonwebservices: 'devicon-amazonwebservices-original',
    tailwind: 'devicon-tailwindcss-original',
    tailwindcss: 'devicon-tailwindcss-original',
    ai: 'devicon-artificialintelligence-plain',
    artificialintelligence: 'devicon-artificialintelligence-plain',
  };

  return `${techMap[normalizedTechName] || `devicon-${normalizedTechName}-plain`} colored`;
}

export function getTimeStamp(createdAt: Date) {
  const date = new Date(createdAt);
  const now = new Date().getTime();
  const past = new Date(date).getTime();

  const seconds = Math.floor((now - past) / 1000);

  const units = [
    { label: 'year', seconds: 60 * 60 * 24 * 365 },
    { label: 'month', seconds: 60 * 60 * 24 * 30 },
    { label: 'day', seconds: 60 * 60 * 24 },
    { label: 'hour', seconds: 60 * 60 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  const unit = units.find((unit) => seconds >= unit.seconds);

  if (!unit) return 'just now';

  const value = Math.floor(seconds / unit.seconds);

  return `${value} ${unit.label}${value !== 1 ? 's' : ''} ago`;
}
