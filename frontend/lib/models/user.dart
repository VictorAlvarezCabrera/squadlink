class User {
  final int id;
  final String username;
  final String email;
  final bool esPremium;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.esPremium,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      esPremium: json['es_premium'] ?? false,
    );
  }
}
