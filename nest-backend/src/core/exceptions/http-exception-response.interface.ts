/**
 * Interface for HTTP exception response objects
 */
export interface IHttpExceptionResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}
