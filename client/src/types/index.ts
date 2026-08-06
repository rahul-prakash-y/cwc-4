export interface TeamMember {
  name: string;
  role: 'Leader' | 'Frontend' | 'Backend' | 'Fullstack' | 'Designer' | string;
  avatar: string;
  github?: string;
}

export interface Team {
  id: string;
  name: string;
  tagline: string;
  rank: number;
  points: number;
  members: TeamMember[];
  status: 'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | 'Approved' | 'Pending' | 'Arena Ready' | string;
  avatar: string;
  themeColor: string;
  streak: number;
  badges: string[];
}

export interface TimelineDay {
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  type: 'Registration' | 'Selection' | 'Quiz' | 'Code Battle' | 'Hackathon' | 'Boss Fight' | 'Bonus Round' | string;
  points: number;
  status: 'Completed' | 'In Progress' | 'Upcoming' | string;
  winnerTeam?: string;
}

export interface RuleCategory {
  id: string;
  title: string;
  iconName: string;
  description: string;
  badgeText: string;
  rules: {
    title: string;
    content: string;
    tag?: string;
  }[];
}
