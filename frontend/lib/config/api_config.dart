class ApiConfig {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Auth
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  
  // Users
  static const String randomUsers = '$baseUrl/users/random';
  static String userById(int id) => '$baseUrl/users/$id';
  
  // Games
  static const String games = '$baseUrl/games';
}
