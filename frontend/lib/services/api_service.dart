import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/jugador_model.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  
  final storage = const FlutterSecureStorage();

  Future<Map<String, dynamic>> register(String username, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'error': jsonDecode(response.body)['error']};
      }
    } catch (e) {
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storage.write(key: 'jwt_token', value: data['token']);
        await storage.write(key: 'user_id', value: data['usuario']['id'].toString());
        await storage.write(key: 'username', value: data['usuario']['username']);
        
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': jsonDecode(response.body)['error']};
      }
    } catch (e) {
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }

  Future<String?> getToken() async {
    return await storage.read(key: 'jwt_token');
  }

  Future<void> logout() async {
    await storage.deleteAll();
  }

    // Obtener todos los jugadores
  static Future<List<Jugador>> obtenerJugadores({String? juego, String? region, String? rol}) async {
    try {
      String url = '$baseUrl/jugadores?';
      if (juego != null) url += 'juego=$juego&';
      if (region != null) url += 'region=$region&';
      if (rol != null) url += 'rol=$rol';

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Jugador.fromJson(json)).toList();
      } else {
        throw Exception('Error al obtener jugadores');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Crear perfil de jugador
  static Future<Map<String, dynamic>> crearJugador(Jugador jugador, String token) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/jugadores'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(jugador.toJson()),
      );

      if (response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Error al crear perfil');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener jugador específico
  static Future<Jugador> obtenerJugador(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/jugadores/$id'));

      if (response.statusCode == 200) {
        return Jugador.fromJson(json.decode(response.body));
      } else {
        throw Exception('Jugador no encontrado');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Eliminar jugador
  static Future<void> eliminarJugador(int id, String token) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/jugadores/$id'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200) {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Error al eliminar perfil');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}

