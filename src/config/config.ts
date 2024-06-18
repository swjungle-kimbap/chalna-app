interface ApiConfig {
  apiUrl: string;
  loginUrl: string;
  signupUrl: string;
  postUrl: string;
  refreshTokenUrl: string; 
}

const baseUrl = 'http://43.201.51.101:8080';

export const config: ApiConfig = {
  apiUrl: `${baseUrl}/api`,
  loginUrl: `${baseUrl}/api/auth/login`,
  signupUrl: `${baseUrl}/api/auth/signup`,
  postUrl: `${baseUrl}/api/post`,
  refreshTokenUrl: `${baseUrl}/api/refresh`,  // Corrected to include the slash before `api`
};

export const {apiUrl, loginUrl, signupUrl, postUrl, refreshTokenUrl} = config;