// Temáticas del juego Impostor
// Las palabras no se muestran al usuario cuando selecciona la temática

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
            'Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Jirafa', 'Cebra', 'Mono',
            'Serpiente', 'Águila', 'Delfín', 'Tiburón', 'Ballena', 'Oso', 'Lobo',
            'Zorro', 'Conejo', 'Caballo', 'Vaca', 'Cerdo', 'Oveja', 'Gallina',
            'Pato', 'Loro', 'Búho', 'Pingüino', 'Koala', 'Canguro', 'Hipopótamo',
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
            'Arroz', 'Pollo', 'Pescado', 'Carne', 'Sopa', 'Lasaña', 'Empanada',
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
            'Fútbol', 'Baloncesto', 'Tenis', 'Béisbol', 'Voleibol', 'Natación',
            'Atletismo', 'Ciclismo', 'Boxeo', 'Golf', 'Rugby', 'Hockey',
            'Esquí', 'Snowboard', 'Surf', 'Skate', 'Gimnasia', 'Karate',
            'Judo', 'Taekwondo', 'Esgrima', 'Remo', 'Vela', 'Escalada',
            'Patinaje', 'Polo', 'Críquet', 'Bádminton', 'Ping pong', 'Handball'
        ]
    },
    {
        id: 'peliculas',
        name: 'Películas',
        icon: '🎬',
        color: '#9B59B6',
        words: [
            'Titanic', 'Avatar', 'Matrix', 'Star Wars', 'Harry Potter', 'El Padrino',
            'Jurassic Park', 'Forrest Gump', 'El Rey León', 'Toy Story',
            'Frozen', 'Coco', 'Up', 'Shrek', 'Madagascar', 'Buscando a Nemo',
            'Los Vengadores', 'Spider-Man', 'Batman', 'Superman', 'Iron Man',
            'Thor', 'Hulk', 'Rápidos y Furiosos', 'Misión Imposible', 'James Bond',
            'Indiana Jones', 'Piratas del Caribe', 'Gladiador', 'Rocky'
        ]
    },
    {
        id: 'paises',
        name: 'Países',
        icon: '🌍',
        color: '#3498DB',
        words: [
            'España', 'Francia', 'Italia', 'Alemania', 'Inglaterra', 'Portugal',
            'México', 'Argentina', 'Brasil', 'Colombia', 'Perú', 'Chile',
            'Estados Unidos', 'Canadá', 'Japón', 'China', 'Corea', 'India',
            'Australia', 'Egipto', 'Marruecos', 'Sudáfrica', 'Rusia', 'Grecia',
            'Turquía', 'Tailandia', 'Vietnam', 'Indonesia', 'Filipinas', 'Cuba'
        ]
    },
    {
        id: 'profesiones',
        name: 'Profesiones',
        icon: '👨‍⚕️',
        color: '#1ABC9C',
        words: [
            'Médico', 'Abogado', 'Ingeniero', 'Profesor', 'Arquitecto', 'Chef',
            'Policía', 'Bombero', 'Piloto', 'Astronauta', 'Dentista', 'Veterinario',
            'Enfermero', 'Farmacéutico', 'Programador', 'Diseñador', 'Fotógrafo',
            'Periodista', 'Actor', 'Músico', 'Cantante', 'Bailarín', 'Pintor',
            'Escultor', 'Escritor', 'Electricista', 'Plomero', 'Carpintero', 'Mecánico'
        ]
    },
    {
        id: 'lugares',
        name: 'Lugares',
        icon: '🏛️',
        color: '#E74C3C',
        words: [
            'Hospital', 'Escuela', 'Supermercado', 'Aeropuerto', 'Estación de tren',
            'Biblioteca', 'Museo', 'Cine', 'Teatro', 'Estadio', 'Parque',
            'Playa', 'Montaña', 'Restaurante', 'Hotel', 'Bank', 'Iglesia',
            'Cementerio', 'Zoo', 'Circo', 'Casino', 'Gimnasio', 'Spa',
            'Discoteca', 'Bar', 'Cafetería', 'Farmacia', 'Gasolinera', 'Prisión'
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
        name: 'Música',
        icon: '🎵',
        color: '#F39C12',
        words: [
            'Rock', 'Pop', 'Reggaetón', 'Salsa', 'Bachata', 'Cumbia', 'Merengue',
            'Hip Hop', 'Rap', 'Jazz', 'Blues', 'Clásica', 'Electrónica', 'Techno',
            'House', 'Country', 'Folk', 'Reggae', 'Punk', 'Metal', 'Indie',
            'K-Pop', 'Trap', 'R&B', 'Soul', 'Gospel', 'Ópera', 'Flamenco', 'Tango'
        ]
    },
    {
        id: 'objetos',
        name: 'Objetos',
        icon: '📦',
        color: '#27AE60',
        words: [
            'Teléfono', 'Computadora', 'Televisor', 'Refrigerador', 'Microondas',
            'Lavadora', 'Secadora', 'Aspiradora', 'Plancha', 'Licuadora',
            'Tostadora', 'Cafetera', 'Ventilador', 'Aire acondicionado', 'Calefactor',
            'Lámpara', 'Reloj', 'Espejo', 'Silla', 'Mesa', 'Sofá', 'Cama',
            'Almohada', 'Cobija', 'Toalla', 'Paraguas', 'Maleta', 'Mochila', 'Cartera'
        ]
    },
    {
        id: 'superheroes',
        name: 'Superhéroes',
        icon: '🦸',
        color: '#C0392B',
        words: [
            'Superman', 'Batman', 'Spider-Man', 'Iron Man', 'Capitán América',
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
            'Camisa', 'Pantalón', 'Vestido', 'Falda', 'Chaqueta', 'Abrigo',
            'Suéter', 'Camiseta', 'Jeans', 'Shorts', 'Corbata', 'Bufanda',
            'Guantes', 'Gorra', 'Sombrero', 'Zapatos', 'Botas', 'Sandalias',
            'Tacones', 'Tenis', 'Calcetines', 'Medias', 'Ropa interior', 'Pijama',
            'Bata', 'Traje de baño', 'Bikini', 'Cinturón', 'Bolso', 'Mochila'
        ]
    },
    {
        id: 'biblia',
        name: 'Personajes Bíblicos',
        icon: '✝️',
        color: '#D4AF37',
        words: [
            'Jesús', 'Moisés', 'Abraham', 'David', 'Noé', 'Adán', 'Eva',
            'María', 'José', 'Pedro', 'Pablo', 'Judas', 'Daniel', 'Jonás',
            'Sansón', 'Goliat', 'Caín', 'Abel', 'Lázaro', 'Juan el Bautista'
        ]
    },
    {
        id: 'costeño',
        name: 'Costa Caribe 🇨🇴',
        icon: '🌴',
        color: '#00BCD4',
        words: [
            'Rebusque', 'Sancocho', 'Suero', 'Bollo', 'Arepa e huevo',
            'Carimañola', 'Patacón', 'Chicharrón', 'Butifarra', 'Cayeye',
            'Mojarra', 'Arroz de coco', 'Alegría', 'Champeta', 'Vallenato',
            'Corroncho', 'Vieja guardia', 'Picó', 'Caseta', 'Mototaxi'
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
