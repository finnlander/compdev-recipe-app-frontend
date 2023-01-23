/**
 * Environment specific values.
 */
export const environment = {
  production: true,
  /**
   * Enable mocking backend responses with HTTP interceptor.
   */
  enableBackendMock: false,

  /**
   * Generate some sample data, if none available
   */
  generateSampleData: false,

  /**
   * Base URL to the backend server.
   */
  backendServerBaseUrl: 'http://localhost:3000',
};
