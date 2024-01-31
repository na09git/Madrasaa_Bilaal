const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/db')
const multer = require('multer');
const handlebarsHelpers = require('handlebars-helpers')();
const base64Helper = (data) => new handlebars.SafeString(data.toString('base64'));
const app = express()
const { ensureAdmin, ensureWorker, ensureAdminOrWorker } = require('./middleware/auth');
const { uuid } = require('uuidv4');


// Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

// Body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Method overrides
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
);


// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  editIcon1,
  select,
} = require('./helpers/hbs')

const hbs = exphbs.create({
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    editIcon1,
    select,
  }, if: function (conditional, options) {
    return conditional ? options.fn(this) : options.inverse(this);
  },
  defaultLayout: 'main',
  extname: '.hbs',
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs')

// home render
app.get('/', function (req, res) {
  res.render('home', { layout: false });
  console.log("You are in home+++++++ Page !")
});
// homeadmin render
app.get('/', function (req, res) {
  res.render('homeadmin', { layout: false });
  console.log("You are in homeAdmin Page !")
});
// homeproblem render
app.get('/', function (req, res) {
  res.render('homeworker', { layout: false });
  console.log("You are in homeWorker Page !")
});
// Routes News
app.get('/', (req, res) => {
  res.render('newspage', { title: "News Page" }, { layout: false });
});

// Routes amirdetail Page
app.get('/', (req, res) => {
  res.render('directormessage');
});
// Routes vission-and-mission Page
app.get('/', (req, res) => {
  res.render('vission-and-mission', { title: "vission-and-mission" }, { layout: false });
});
// Routes students Page
app.get('/', (req, res) => {
  res.render('students', { title: "Students Page" }, { layout: false });
});
// Routes workers Page
app.get('/', (req, res) => {
  res.render('workers', { title: "Workers Page" }, { layout: false });
});
// Routes Problems Page
app.get('/', (req, res) => {
  res.render('problems', { title: "Problem Page" }, { layout: false });
});


const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
// Sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

// Static folder
// The express.static middleware should be placed before other middleware or route handlers that might need to handle specific routes. 
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.static(path.join(__dirname, 'uploadstory', 'uploadsnews', 'uploadstudent', 'uploadworker')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/story', require('./routes/story'))
app.use('/news', require('./routes/news'));
app.use('/home', require('./routes/home'))
app.use('/homeadmin', require('./routes/homeadmin'))
app.use('/homeworker', require('./routes/homeworker'))
app.use('/contact', require('./routes/contact'));
app.use('/directormessage', require('./routes/directormessage'));
app.use('/vission-and-mission', require('./routes/vission-and-mission'));
app.use('/student', require('./routes/student'));
app.use('/worker', require('./routes/worker'));
app.use('/problem', require('./routes/problem'));
app.use('/privacy', require('./routes/privacy'));
app.use('/terms', require('./routes/terms'));


const PORT = process.env.PORT || 3000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)