const path = require('path');
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const memoryStore = new session.MemoryStore();

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));
app.use(session({
    secret: 'KWhjV<T=-*VW<;cC5Y6U-{F.ppK+])Ub',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

const keycloak = new Keycloak({
    store: memoryStore,
});

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/',
}));

app.get('/', (req, res) => res.redirect('/home'));

const parseToken = raw => {
    if (!raw || typeof raw !== 'string') return null;

    try {
        raw = JSON.parse(raw);
        const token = raw.id_token ? raw.id_token : raw.access_token;
        const content = token.split('.')[1];

        console.log("ID token");
        console.log(raw.id_token);
        console.log("Access token");
        console.log(raw.access_token);

        return JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
    } catch (e) {
        console.error('Error while parsing token: ', e);
    }
};

app.get('/home', keycloak.protect(), (req, res, next) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('home', {
        user: embedded_params,
    });
});

app.get('/login', keycloak.protect(), (req, res) => {
    return res.redirect('home');
});

app.get('/ue-1', keycloak.enforcer(['ue-1:lire'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue1');
    return res.status(200).end('success');
});

app.get('/ue-2', keycloak.enforcer(['ue-2:lire'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue2');
    return res.status(200).end('success');
});

app.get('/ue-3', keycloak.enforcer(['ue-3:lire'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue3');
    return res.status(200).end('success');
});

app.get('/ue-1/update', keycloak.enforcer(['ue-1:ecrire'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue-1/update');
    return res.status(200).end('success');
});

app.get('/ue-2/update', keycloak.enforcer(['ue-2:ecrire'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue-2/update');
    return res.status(200).end('success');
});

app.get('/ue-3/update', keycloak.enforcer(['ue-3:ecrire'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue-3/update');
    return res.status(200).end('success');
});

app.get('/ue-1/validate', keycloak.enforcer(['ue-1:valider'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue-1/validate');
    return res.status(200).end('success');
});

app.get('/ue-2/validate', keycloak.enforcer(['ue-2:valider'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue-2/validate');
    return res.status(200).end('success');
});

app.get('/ue-3/validate', keycloak.enforcer(['ue-3:valider'], {
    resource_server_id: 'application-note'
}), (req, res) => {
    res.render('ue-3/validate');
    return res.status(200).end('success');
});

app.use((req, res, next) => {
    return res.status(404).end('Not Found');
});

app.use((err, req, res, next) => {
    return res.status(req.errorCode ? req.errorCode : 500).end(req.error ? req.error.toString() : 'Internal Server Error');
});

const server = app.listen(3000, '127.0.0.1', () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Application running at http://%s:%s', host, port);
});
