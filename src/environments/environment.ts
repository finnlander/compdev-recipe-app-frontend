/**
 * Environment specific values.
 */
export const environment = {
  production: false,
  /**
   * Enable mocking backend responses with HTTP interceptor.
   */
  enableBackendMock: true,

  /**
   * Generate some sample data, if none available
   */
  generateSampleData: true,

  /**
   * Base URL to the backend server.
   */
  backendServerBaseUrl: 'http://localhost:3000',
};
