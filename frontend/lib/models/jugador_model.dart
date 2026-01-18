class Jugador {
    final int id;
    final int usuarioId;
    final String juego;
    final String nombreJuego;
    final String? region;
    final String? rol;
    final int nivel;
    final String? username;
    final double? kdRatio;
    final double? winrate;
    final int? partidasJugadas;

    Jugador({
        required this.id,
        required this.usuarioId,
        required this.juego,
        required this.nombreJuego,
        this.region,
        this.rol,
        required this.nivel,
        this.username,
        this.kdRatio,
        this.winrate,
        this.partidasJugadas,
    });

    factory Jugador.fromJson(Map<String, dynamic> json) {
        return Jugador(
            id: json['id'],
            usuarioId: json['usuarioId'],
            juego: json['juego'],
            nombreJuego: json['nombre_juego'],
            region: json['region'],
            rol: json['rol'],
            nivel: json['nivel'] ?? 1,
            username: json['username'],
            kdRatio: json['kd_ratio'] != null ? double.tryParse(json['kd_ratio'].toString()): null,
            winrate: json['winrate'] != null ? double.tryParse(json['winrate'].toString()): null,
            partidasJugadas: json['partidas_jugadas'],

        );
    }

    Map<String, dynamic> toJson() {
        return {
            'juego': juego,
            'nombre_juego': nombreJuego,
            'region': region,
            'rol': rol,
            'nivel': nivel,
        };
    }
}