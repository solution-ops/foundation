/**
 * Response type for the health check endpoint
 */
export type HealthResponse = {
  status: string;
  message: string;
  timestamp: string;
};
