// Tematicas del juego Impostor
// Las palabras no se muestran al usuario cuando selecciona la tematica

export interface Theme {
    id: string;
    name: string;
    icon: string;
    color: string;
    words: string[];
}

export const themes: Theme[] = [
    {
        id: 'animales',
        name: 'Animales',
        icon: '🦁',
        color: '#FF6B35',
        words: [
            'Perro', 'Gato', 'Elefante', 'Leon', 'Tigre', 'Jirafa', 'Cebra', 'Mono',
            'Serpiente', 'Aguila', 'Delfin', 'Tiburon', 'Ballena', 'Oso', 'Lobo',
            'Zorro', 'Conejo', 'Caballo', 'Vaca', 'Cerdo', 'Oveja', 'Gallina',
            'Pato', 'Loro', 'Buho', 'Pinguino', 'Koala', 'Canguro', 'Hipopotamo',
            'Rinoceronte', 'Cocodrilo', 'Tortuga', 'Camello', 'Gorila', 'Pantera'
        ]
    },
    {
        id: 'comidas',
        name: 'Comidas',
        icon: '🍕',
        color: '#E63946',
        words: [
            'Pizza', 'Hamburguesa', 'Sushi', 'Tacos', 'Pasta', 'Paella', 'Ensalada',
            'Arroz', 'Pollo', 'Pescado', 'Carne', 'Sopa', 'Lasana', 'Empanada',
            'Arepa', 'Ceviche', 'Burrito', 'Nachos', 'Hot dog', 'Sandwich',
            'Falafel', 'Curry', 'Ramen', 'Pho', 'Dim sum', 'Kebab', 'Gyros',
            'Pad thai', 'Crepe', 'Waffle', 'Panqueques', 'Omelette', 'Quesadilla'
        ]
    },
    {
        id: 'deportes',
        name: 'Deportes',
        icon: '⚽',
        color: '#2A9D8F',
        words: [
            'Futbol', 'Baloncesto', 'Tenis', 'Beisbol', 'Voleibol', 'Natacion',
            'Atletismo', 'Ciclismo', 'Boxeo', 'Golf', 'Rugby', 'Hockey',
            'Esqui', 'Snowboard', 'Surf', 'Skate', 'Gimnasia', 'Karate',
            'Judo', 'Taekwondo', 'Esgrima', 'Remo', 'Vela', 'Escalada',
            'Patinaje', 'Polo', 'Criquet', 'Badminton', 'Ping pong', 'Handball'
        ]
    },
    {
        id: 'peliculas',
        name: 'Peliculas',
        icon: '🎬',
        color: '#9B59B6',
        words: [
            'Titanic', 'Avatar', 'Matrix', 'Star Wars', 'Harry Potter', 'El Padrino',
            'Jurassic Park', 'Forrest Gump', 'El Rey Leon', 'Toy Story',
            'Frozen', 'Coco', 'Up', 'Shrek', 'Madagascar', 'Buscando a Nemo',
            'Los Vengadores', 'Spider-Man', 'Batman', 'Superman', 'Iron Man',
            'Thor', 'Hulk', 'Rapidos y Furiosos', 'Mision Imposible', 'James Bond',
            'Indiana Jones', 'Piratas del Caribe', 'Gladiador', 'Rocky'
        ]
    },
    {
        id: 'paises',
        name: 'Paises',
        icon: '🌍',
        color: '#3498DB',
        words: [
            'Espana', 'Francia', 'Italia', 'Alemania', 'Inglaterra', 'Portugal',
            'Mexico', 'Argentina', 'Brasil', 'Colombia', 'Peru', 'Chile',
            'Estados Unidos', 'Canada', 'Japon', 'China', 'Corea', 'India',
            'Australia', 'Egipto', 'Marruecos', 'Sudafrica', 'Rusia', 'Grecia',
            'Turquia', 'Tailandia', 'Vietnam', 'Indonesia', 'Filipinas', 'Cuba'
        ]
    },
    {
        id: 'profesiones',
        name: 'Profesiones',
        icon: '👨‍⚕️',
        color: '#1ABC9C',
        words: [
            'Medico', 'Abogado', 'Ingeniero', 'Profesor', 'Arquitecto', 'Chef',
            'Policia', 'Bombero', 'Piloto', 'Astronauta', 'Dentista', 'Veterinario',
            'Enfermero', 'Farmaceutico', 'Programador', 'Disenador', 'Fotografo',
            'Periodista', 'Actor', 'Musico', 'Cantante', 'Bailarin', 'Pintor',
            'Escultor', 'Escritor', 'Electricista', 'Plomero', 'Carpintero', 'Mecanico'
        ]
    },
    {
        id: 'lugares',
        name: 'Lugares',
        icon: '🏛️',
        color: '#E74C3C',
        words: [
            'Hospital', 'Escuela', 'Supermercado', 'Aeropuerto', 'Estacion de tren',
            'Biblioteca', 'Museo', 'Cine', 'Teatro', 'Estadio', 'Parque',
            'Playa', 'Montana', 'Restaurante', 'Hotel', 'Banco', 'Iglesia',
            'Cementerio', 'Zoo', 'Circo', 'Casino', 'Gimnasio', 'Spa',
            'Discoteca', 'Bar', 'Cafeteria', 'Farmacia', 'Gasolinera', 'Prision'
        ]
    },
    {
        id: 'videojuegos',
        name: 'Videojuegos',
        icon: '🎮',
        color: '#8E44AD',
        words: [
            'Minecraft', 'Fortnite', 'GTA', 'FIFA', 'Call of Duty', 'Mario Bros',
            'Zelda', 'Pokemon', 'Sonic', 'Tetris', 'Pac-Man', 'Among Us',
            'League of Legends', 'Valorant', 'Counter-Strike', 'Overwatch',
            'World of Warcraft', 'Diablo', 'God of War', 'The Last of Us',
            'Resident Evil', 'Assassins Creed', 'Dark Souls', 'Elden Ring',
            'Red Dead Redemption', 'Cyberpunk', 'Halo', 'Animal Crossing', 'Roblox'
        ]
    },
    {
        id: 'musica',
        name: 'Musica',
        icon: '🎵',
        color: '#F39C12',
        words: [
            'Rock', 'Pop', 'Reggaeton', 'Salsa', 'Bachata', 'Cumbia', 'Merengue',
            'Hip Hop', 'Rap', 'Jazz', 'Blues', 'Clasica', 'Electronica', 'Techno',
            'House', 'Country', 'Folk', 'Reggae', 'Punk', 'Metal', 'Indie',
            'K-Pop', 'Trap', 'Soul', 'Gospel', 'Opera', 'Flamenco', 'Tango'
        ]
    },
    {
        id: 'objetos',
        name: 'Objetos',
        icon: '📦',
        color: '#27AE60',
        words: [
            'Telefono', 'Computadora', 'Televisor', 'Refrigerador', 'Microondas',
            'Lavadora', 'Secadora', 'Aspiradora', 'Plancha', 'Licuadora',
            'Tostadora', 'Cafetera', 'Ventilador', 'Aire acondicionado', 'Calefactor',
            'Lampara', 'Reloj', 'Espejo', 'Silla', 'Mesa', 'Sofa', 'Cama',
            'Almohada', 'Cobija', 'Toalla', 'Paraguas', 'Maleta', 'Mochila', 'Cartera'
        ]
    },
    {
        id: 'superheroes',
        name: 'Superheroes',
        icon: '🦸',
        color: '#C0392B',
        words: [
            'Superman', 'Batman', 'Spider-Man', 'Iron Man', 'Capitan America',
            'Thor', 'Hulk', 'Wonder Woman', 'Aquaman', 'Flash', 'Green Lantern',
            'Black Panther', 'Doctor Strange', 'Ant-Man', 'Hawkeye', 'Black Widow',
            'Wolverine', 'Deadpool', 'Cyclops', 'Storm', 'Jean Grey', 'Magneto',
            'Professor X', 'Thanos', 'Loki', 'Scarlet Witch', 'Vision', 'Shazam'
        ]
    },
    {
        id: 'ropa',
        name: 'Ropa',
        icon: '👔',
        color: '#16A085',
        words: [
            'Camisa', 'Pantalon', 'Vestido', 'Falda', 'Chaqueta', 'Abrigo',
            'Sueter', 'Camiseta', 'Jeans', 'Shorts', 'Corbata', 'Bufanda',
            'Guantes', 'Gorra', 'Sombrero', 'Zapatos', 'Botas', 'Sandalias',
            'Tacones', 'Tenis', 'Calcetines', 'Medias', 'Pijama',
            'Bata', 'Traje de bano', 'Bikini', 'Cinturon', 'Bolso', 'Mochila'
        ]
    },
    {
        id: 'biblia',
        name: 'Personajes Biblicos',
        icon: '✝️',
        color: '#D4AF37',
        words: [
            'Jesus', 'Moises', 'Abraham', 'David', 'Noe', 'Adan', 'Eva',
            'Maria', 'Jose', 'Pedro', 'Pablo', 'Judas', 'Daniel', 'Jonas',
            'Sanson', 'Goliat', 'Cain', 'Abel', 'Lazaro', 'Juan el Bautista'
        ]
    },
    {
        id: 'costeno',
        name: 'Costa Caribe',
        icon: '🌴',
        color: '#00BCD4',
        words: [
            'Sancocho', 'Suero', 'Bollo', 'Arepa de huevo', 'Carimañola',
            'Patacon', 'Chicharron', 'Butifarra', 'Cayeye', 'Mojarra',
            'Arroz de coco', 'Alegria', 'Champeta', 'Vallenato', 'Pico',
            'Caseta', 'Mototaxi', 'Hamaca', 'Carnaval', 'Cumbia'
        ]
    },
    {
        id: 'shalom',
        name: 'Shalom',
        icon: '✨',
        color: '#E91E63',
        words: [
            'Ivan', 'Michael', 'Darianys', 'Jose', 'Franco',
            'Maria de los Angeles', 'Daniela', 'Dayanna', 'Jesus Zapata'
        ]
    }
];

export const getRandomWord = (themeId: string): string => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return '';
    return theme.words[Math.floor(Math.random() * theme.words.length)];
};
