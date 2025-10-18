
export interface Candidate {
  id: string;
  name: string;
  level: string;
  position: string;
  regNumber: string;
  image: string;
}

export interface Voter {
  id: string;
  name: string;
  level: string;
  regNumber: string;
  pin: string;
  hasVoted: boolean;
  isSpecial: boolean;
}

export interface Election {
title: string;
status: 'pending' | 'ongoing' | 'stopped';
}

export type UserRole = 'admin' | 'voter';

export interface User {
  regNumber: string;
  role: UserRole;
  hasVoted?: boolean;
}