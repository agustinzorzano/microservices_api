import express from 'express';
import * as bodyParser from 'body-parser';
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');


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

const User = sequelize.define( "user",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(120)
        },
        email: {
            type: DataTypes.STRING(120),
            index: true,
            unique: true
        },
        age: {
            type: DataTypes.INTEGER
        },

    },{
        freezeTableName: true,
        timestamps: false
    }
)

const Playlist = sequelize.define( "playlist",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.STRING(120)
        },
        fk_user: {
            type: DataTypes.INTEGER
        },

    },{
        freezeTableName: true,
        timestamps: false
    }
)
Playlist.belongsTo(User, {
    onDelete: 'RESTRICT',
    foreignKey: {
        fieldName: 'fk_user',
    },
    targetKey: 'id'
});

const Suggestions = sequelize.define( "suggestions",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.STRING(120)
        },
        fk_user: {
            type: DataTypes.INTEGER
        },

    },{
        freezeTableName: true,
        timestamps: false
    }
)
Suggestions.belongsTo(User, {
    onDelete: 'RESTRICT',
    foreignKey: {
        fieldName: 'fk_user',
    },
    targetKey: 'id'
});

//import users from './users.json'


const app = express();

type User = {
    id: number,
    name: string,
    email: string,
    age: number,
}

type Playlist = {
    id: number,
    value: string,
    fk_user: number
}

type Suggestions = {
    id: number,
    value: string,
    fk_user: number
}

type Movie = {
    id: number,
    title: string,
    director: number,
    age_rating: string,
    duration: number,
    popularity: number
}


let users: User[] = []

app.use(bodyParser.json({
    limit: '50mb',
    verify(req: any, res, buf, encoding) {
        req.rawBody = buf;
    }
}));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/users', (req, res) => {
    User.findAll().then((users: User[]) => {
        res.json({users: users})
    })
});

app.post('/users', (req, res) => {
    console.log(req.body);
    let raw_user: User = req.body;
    // This is not the best solution for requests that arrive at the same time. However, in a normal app, this would be
    // saved in a database and the database will create the id for the user.
    const user = User.build(raw_user);
    user.save().then((model: User) => {
        res.status(200).json(model);
    })
});

app.get('/users/:id', (req, res) => {
    const user_id = parseInt(req.params.id);
    console.log(user_id)
    User.findOne({
        where: { id: user_id }
    }).then((user: User) => {
        if (user) {
            res.json(user);
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.get('/users/:id/playlist', (req, res) => {
    const user_id = parseInt(req.params.id);
    User.findOne({
        where: { id: user_id }
    }).then((user: User) => {
        if (user) {
            Playlist.findAll({
                where: { fk_user: user_id }
            }).then((playlist: Playlist[]) => {
                res.json(playlist.map((play:Playlist) => {
                    return play.value
                }));
            });
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.put('/users/:id/playlist', (req, res) => {
    const user_id = parseInt(req.params.id);
    User.findOne({
        where: { id: user_id }
    }).then((user: User) => {
        if (user) {
            //save
            axios.get(`http://0.0.0.0:5000/movies/title?title=${req.body.value}`).then((response: { status: any; }) => {
                console.log(response.status)
                const play = Playlist.build({fk_user: user.id, value: req.body.value});
                play.save().then((model: Playlist) => {
                    res.status(200).json({id: model.id, value: model.value});
                })
            }).catch((error: any) => {
                console.log(error.message);
                res.status(404).send("Not Found");
            })
        } else {
            res.status(404).send("Not Found");
        }
    })
});

app.get('/users/:id/suggestions', (req, res) => {
    const user_id = parseInt(req.params.id);
    User.findOne({
        where: { id: user_id }
    }).then((user: User) => {
        if (user) {
            Suggestions.findAll({
                where: { fk_user: user_id }
            }).then((suggestions: Suggestions[]) => {
                res.json(suggestions.map((suggestion: Suggestions) => {
                    return suggestion.value
                }));
            });
        } else {
            res.status(404).send("Not Found");
        }
    })

});

app.put('/users/:id/suggestions', (req, res) => {
    const user_id = parseInt(req.params.id);
    User.findOne({
        where: { id: user_id }
    }).then((user: User) => {
        if (user) {
            //save
            const suggestion = Suggestions.build({fk_user: user.id, value: req.body.value});
            suggestion.save().then((model: Suggestions) => {
                res.status(200).json({id: model.id, value: model.value});
            })
        } else {
            res.status(404).send("Not Found");
        }
    })

});

export { app, sequelize };
