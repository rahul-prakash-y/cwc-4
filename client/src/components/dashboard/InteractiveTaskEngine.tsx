import React from 'react';
import { McqRapidFireRenderer } from './McqRapidFireRenderer';
import { CodeEditorRenderer, TestCase } from './CodeEditorRenderer';
import { PuzzleRiddleRenderer } from './PuzzleRiddleRenderer';
import { DailyTaskView, TaskDetail } from './DailyTaskView';

export interface InteractiveTaskItem {
  id: string;
  dayNumber?: number;
  title: string;
  category?: string;
  type: 'MCQ' | 'Rapid Fire' | 'Code Completion' | 'Output Prediction' | 'Treasure Hunt' | 'Puzzle' | 'Main' | 'Special' | string;
  points: number;
  duration?: string;
  deadline?: string;
  description?: string;
  requirements?: string[];
  submissionTypesAllowed?: string[];
  mcqOptions?: string[];
  correctAnswer?: string;
  timeLimitSeconds?: number;
  testCases?: TestCase[];
  hintText?: string;
}

interface InteractiveTaskEngineProps {
  task: InteractiveTaskItem;
  status?: string;
  onTaskSubmitted?: (data?: any) => void;
}

export const InteractiveTaskEngine: React.FC<InteractiveTaskEngineProps> = ({
  task,
  status = 'Safe',
  onTaskSubmitted,
}) => {
  const taskType = task.type;

  // Handle MCQ or Rapid Fire Quiz Types
  if (taskType === 'MCQ' || taskType === 'Rapid Fire') {
    return (
      <McqRapidFireRenderer
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          points: task.points,
          mcqOptions: task.mcqOptions,
          correctAnswer: task.correctAnswer,
          timeLimitSeconds: task.timeLimitSeconds,
          onGraded: (res) => {
            if (onTaskSubmitted) onTaskSubmitted(res);
          },
        }}
      />
    );
  }

  // Handle Code Completion or Output Prediction Types
  if (taskType === 'Code Completion' || taskType === 'Output Prediction') {
    return (
      <CodeEditorRenderer
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          type: taskType as 'Code Completion' | 'Output Prediction',
          points: task.points,
          correctAnswer: task.correctAnswer,
          testCases: task.testCases,
          onGraded: (res) => {
            if (onTaskSubmitted) onTaskSubmitted(res);
          },
        }}
      />
    );
  }

  // Handle Treasure Hunt or Puzzle Types
  if (taskType === 'Treasure Hunt' || taskType === 'Puzzle') {
    return (
      <PuzzleRiddleRenderer
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          points: task.points,
          correctAnswer: task.correctAnswer,
          hintText: task.hintText,
          onGraded: (res) => {
            if (onTaskSubmitted) onTaskSubmitted(res);
          },
        }}
      />
    );
  }

  // Fallback to standard Arena Deliverable Task View
  const standardTaskDetail: TaskDetail = {
    id: task.id,
    dayNumber: task.dayNumber || 5,
    title: task.title,
    category: task.category || 'Boss Fight',
    points: task.points,
    duration: task.duration || '4 Hours',
    deadline: task.deadline || '03h 45m',
    description: task.description || '',
    requirements: task.requirements || [
      'Provide a public GitHub repository link with clean commits.',
      'Upload a Cloudinary deliverable file (PDF / Image / Video).',
    ],
    submissionTypesAllowed: task.submissionTypesAllowed || ['github', 'cloudinary'],
  };

  return <DailyTaskView task={standardTaskDetail} status={status} onTaskSubmitted={onTaskSubmitted} />;
};
