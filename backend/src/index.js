import { createHandler } from 'graphql-http/lib/use/express';
import express from 'express';
import cors from "cors";
import helmet from "helmet";
import { schema } from './graphql/schema.js';
import { root } from './graphql/resolvers/root.js';
import { ruruHTML } from 'ruru/server';
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const limiter = rateLimit({
    windowMs: 1000 * 60 * 15,
    max: 100 // limit each IP to 100 requests per windowMs
});
// Construct a schema, using GraphQL schema language

const app = express();

// The root provides a resolver function for each API endpoint
// app.use(helmet());
app.use(cors({
    origin: "http://localhost:4000",
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Protect certain pages from unauthenticated access
const protectedPages = ['/pages/dashboard.html'];

app.use((req, res, next) => {
    if (protectedPages.includes(req.path)) {
        const { user } = authMiddleware(req);
        if (!user) {
            return res.redirect('/pages/login.html?error=Please+login+first');
        }
    }
    next();
});

app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/graphql', limiter);
app.get('/', (_req, res) => {
    res.type('html');
    res.end(ruruHTML({ endpoint: '/graphql' }));
});


app.all(
    '/graphql',

    createHandler({
        schema: schema,
        rootValue: root,
        context: (req) => (
            {
                res: req.raw.res,
                ...authMiddleware(req.raw),
            }),
    }),
);
const PORT = 4000;
// Start the server at port
app.listen(PORT, () => {
    console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`);
});