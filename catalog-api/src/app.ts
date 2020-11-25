import express from 'express';
import * as bodyParser from 'body-parser';
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize('microservices', 'agustin', 'Agustin95', { // database, username, password
    host: 'localhost',
    dialect: 'mariadb'
})

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const Movies = sequelize.define( "movies",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(120)
        },
        director: {
            type: DataTypes.INTEGER
        },
        age_rating: {
            type: DataTypes.STRING(120)
        },
        duration: {
            type: DataTypes.INTEGER
        },
        popularity: {
            type: DataTypes.INTEGER
        },
    },{
        freezeTableName: true,
        timestamps: false
    }
)

const Genres = sequelize.define( "genres",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING(120)
        },

    },{
        freezeTableName: true,
        timestamps: false
    }
)

const People = sequelize.define( "people",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(120)
        },
        roles: {
            type: DataTypes.STRING(120)
        }

    },{
        freezeTableName: true,
        timestamps: false
    }
)

const MovieCast = sequelize.define( "movie_cast",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fk_movie: {
            type: DataTypes.INTEGER,
        },
        fk_actor: {
            type: DataTypes.INTEGER,
        }

    },{
        freezeTableName: true,
        timestamps: false
    }
)
MovieCast.belongsTo(People, {
    onDelete: 'RESTRICT',
    foreignKey: {
        fieldName: 'fk_actor',
    },
    targetKey: 'id'
});
MovieCast.belongsTo(Movies, {
    onDelete: 'RESTRICT',
    foreignKey: {
        fieldName: 'fk_movie',
    },
    targetKey: 'id'
});

const MovieGenres = sequelize.define( "movie_genres",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fk_movie: {
            type: DataTypes.INTEGER,
        },
        fk_genre: {
            type: DataTypes.INTEGER,
        }

    },{
        freezeTableName: true,
        timestamps: false
    }
)
MovieGenres.belongsTo(Genres, {
    onDelete: 'RESTRICT',
    foreignKey: {
        fieldName: 'fk_genre',
    },
    targetKey: 'id'
});
MovieGenres.belongsTo(Movies, {
    onDelete: 'RESTRICT',
    foreignKey: {
        fieldName: 'fk_movie',
    },
    targetKey: 'id'
});


//import users from './users.json'


const app = express();

type People = {
    id: number,
    name: string,
    roles: string
}

type Genre = {
    id: number,
    description: string
}

type Movie = {
    id: number,
    title: string,
    director: number,
    age_rating: string,
    duration: number,
    popularity: number
}



app.use(bodyParser.json({
    limit: '50mb',
    verify(req: any, res, buf, encoding) {
        req.rawBody = buf;
    }
}));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/people', (req, res) => {
    People.findAll().then((users: People[]) => {
        res.json({people: users})
    })
});

app.post('/people', (req, res) => {
    console.log(req.body);
    let raw_user: People = req.body;
    // This is not the best solution for requests that arrive at the same time. However, in a normal app, this would be
    // saved in a database and the database will create the id for the user.
    const person = People.build(raw_user);
    person.save().then((model: People) => {
        res.status(200).json(model);
    })
});

app.get('/people/:id', (req, res) => {
    const user_id = parseInt(req.params.id);
    console.log(user_id)
    People.findOne({
        where: { id: user_id }
    }).then((user: People) => {
        if (user) {
            res.json(user);
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.get('/genres', (req, res) => {
    Genres.findAll().then((genres: Genre[]) => {
        res.json({genres: genres})
    })
});

app.post('/genres', (req, res) => {
    console.log(req.body);
    let raw_user: People = req.body;
    // This is not the best solution for requests that arrive at the same time. However, in a normal app, this would be
    // saved in a database and the database will create the id for the user.
    const genre = Genres.build(raw_user);
    genre.save().then((model: Genre) => {
        res.status(200).json(model);
    })
});

app.get('/genres/:id', (req, res) => {
    const user_id = parseInt(req.params.id);
    console.log(user_id)
    Genres.findOne({
        where: { id: user_id }
    }).then((user: Genre) => {
        if (user) {
            res.json(user);
        } else {
            res.status(404).send("Not Found");
        }
    })
});


app.get('/movies', (req, res) => {
    Movies.findAll().then((movies: Movie[]) => {
        res.json({movies: movies})
    })
});

app.post('/movies', (req, res) => {
    console.log(req.body);
    let raw_user: People = req.body;
    // This is not the best solution for requests that arrive at the same time. However, in a normal app, this would be
    // saved in a database and the database will create the id for the user.
    const movie = Movies.build(raw_user);
    movie.save().then((model: Movie) => {
        res.status(200).json(model);
    })
});

app.get('/movies/title', (req, res) => {
    Movies.findOne({
        where: { title: req.query.title }
    }).then((movie: Movie) => {
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.get('/movies/:id', (req, res) => {
    const user_id = parseInt(req.params.id);
    console.log(user_id)
    Movies.findOne({
        where: { id: user_id }
    }).then((user: Movie) => {
        if (user) {
            res.json(user);
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.put('/movies/:id/genre', (req, res) => {
    console.log(req.body);
    const user_id = parseInt(req.params.id);
    Movies.findOne({
        where: { id: user_id }
    }).then((movie: Movie) => {
        if (movie) {
            //save
            Genres.findOne({where: { description: req.body.description }}).then((genre: Genre) => {
                if (genre) {
                    const movie_genre = MovieGenres.build({fk_movie: movie.id, fk_genre: genre.id});
                    movie_genre.save().then(() => {
                        res.status(200).json({});
                    })
                } else {
                    res.status(404).send("Not Found");
                }
            })
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.put('/movies/:id/cast', (req, res) => {
    const user_id = parseInt(req.params.id);
    Movies.findOne({
        where: { id: user_id }
    }).then((movie: Movie) => {
        if (movie) {
            //save
            People.findOne({where: { id: req.body.id }}).then((person: People) => {
                if (person) {
                    const movie_cast = MovieCast.build({fk_movie: movie.id, fk_actor: person.id});
                    movie_cast.save().then(() => {
                        res.status(204).json({});
                    })
                } else {
                    res.status(404).send("Not Found");
                }
            })
        } else {
            res.status(404).send("Not Found");
        }
    })
});

//
// app.get('/users/:id/playlist', (req, res) => {
//     const user_id = parseInt(req.params.id);
//     User.findOne({
//         where: { id: user_id }
//     }).then((user: User) => {
//         if (user) {
//             Playlist.findAll({
//                 where: { fk_user: user_id }
//             }).then((playlist: Playlist[]) => {
//                 res.json(playlist.map((play:Playlist) => {
//                     return play.value
//                 }));
//             });
//         } else {
//             res.status(404).send("Not Found");
//         }
//     })
// });
//
// app.put('/users/:id/playlist', (req, res) => {
//     const user_id = parseInt(req.params.id);
//     User.findOne({
//         where: { id: user_id }
//     }).then((user: User) => {
//         if (user) {
//             //save
//             const play = Playlist.build({fk_user: user.id, value: req.body.value});
//             play.save().then((model: Playlist) => {
//                 res.status(200).json({id: model.id, value: model.value});
//             })
//         } else {
//             res.status(404).send("Not Found");
//         }
//     })
// });
//
// app.get('/users/:id/suggestions', (req, res) => {
//     const user_id = parseInt(req.params.id);
//     User.findOne({
//         where: { id: user_id }
//     }).then((user: User) => {
//         if (user) {
//             Suggestions.findAll({
//                 where: { fk_user: user_id }
//             }).then((suggestions: Suggestions[]) => {
//                 res.json(suggestions.map((suggestion: Suggestions) => {
//                     return suggestion.value
//                 }));
//             });
//         } else {
//             res.status(404).send("Not Found");
//         }
//     })
//
// });
//
// app.put('/users/:id/suggestions', (req, res) => {
//     const user_id = parseInt(req.params.id);
//     User.findOne({
//         where: { id: user_id }
//     }).then((user: User) => {
//         if (user) {
//             //save
//             const suggestion = Suggestions.build({fk_user: user.id, value: req.body.value});
//             suggestion.save().then((model: Suggestions) => {
//                 res.status(200).json({id: model.id, value: model.value});
//             })
//         } else {
//             res.status(404).send("Not Found");
//         }
//     })
//
// });

export { app, sequelize };
