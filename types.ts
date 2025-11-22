export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string | null;
  isProcessing: boolean;
  error: string | null;
}

export interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}