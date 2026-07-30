const express = require('express');
const path = require('path');
const app = express();

// IMPORT DATABASE CONNECTOR
const db = require('./database/db-connector');

// Set up Handlebars templating engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// INCIDENTS

// Browse all incidents
app.get('/incidents', (req, res) => {
  const query = `
      SELECT Incidents.incidentID, Incidents.title, Incidents.description, 
             Incidents.reportedAt, Incidents.closedAt, 
             Severity_Levels.severityName, Statuses.statusName 
      FROM Incidents
      INNER JOIN Severity_Levels ON Incidents.severityLevelID = Severity_Levels.severityLevelID
      INNER JOIN Statuses ON Incidents.statusID = Statuses.statusID;
  `;
  
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('incidents', { incidents: rows });
      }
  });
});

// Add incident form (GET)
app.get('/incidents/add', (req, res) => {
  res.render('add-incident', { severities: [] });
});

// Add incident (POST) - form submission
app.post('/incidents', (req, res) => {
  res.redirect('/incidents');
});

// Edit incident form (GET)
app.get('/incidents/:id/edit', (req, res) => {
  const incidentId = req.params.id;
  res.render('edit-incident', { incident: {}, severities: [] });
});

// Update incident (POST)
app.post('/incidents/:id', (req, res) => {
  const incidentId = req.params.id;
  res.redirect('/incidents');
});

// Delete incident
app.post('/incidents/:id/delete', (req, res) => {
  const incidentId = req.params.id;
  res.redirect('/incidents');
});

// ANALYSTS

app.get('/analysts', (req, res) => {
  const query = "SELECT * FROM Analysts;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('analysts', { analysts: rows });
      }
  });
});

app.get('/analysts/add', (req, res) => {
  res.render('add-analyst');
});

app.post('/analysts', (req, res) => {
  res.redirect('/analysts');
});

app.get('/analysts/:id/edit', (req, res) => {
  const analystId = req.params.id;
  res.render('edit-analyst', { analyst: {} });
});

app.post('/analysts/:id', (req, res) => {
  const analystId = req.params.id;
  res.redirect('/analysts');
});

app.post('/analysts/:id/delete', (req, res) => {
  const analystId = req.params.id;
  res.redirect('/analysts');
});

// ASSETS

app.get('/assets', (req, res) => {
  const query = "SELECT * FROM Assets;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('assets', { assets: rows });
      }
  });
});

app.get('/assets/add', (req, res) => {
  res.render('add-asset');
});

app.post('/assets', (req, res) => {
  res.redirect('/assets');
});

app.get('/assets/:id/edit', (req, res) => {
  const assetId = req.params.id;
  res.render('edit-asset', { asset: {} });
});

app.post('/assets/:id', (req, res) => {
  const assetId = req.params.id;
  res.redirect('/assets');
});

app.post('/assets/:id/delete', (req, res) => {
  const assetId = req.params.id;
  res.redirect('/assets');
});


// CVEs

app.get('/cves', (req, res) => {
  const query = "SELECT * FROM CVEs;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('cves', { cves: rows });
      }
  });
});

app.get('/cves/add', (req, res) => {
  res.render('add-cve');
});

app.post('/cves', (req, res) => {
  res.redirect('/cves');
});

app.get('/cves/:id/edit', (req, res) => {
  const cveId = req.params.id;
  res.render('edit-cve', { cve: {} });
});

app.post('/cves/:id', (req, res) => {
  const cveId = req.params.id;
  res.redirect('/cves');
});

app.post('/cves/:id/delete', (req, res) => {
  const cveId = req.params.id;
  res.redirect('/cves');
});


// SEVERITY LEVELS

app.get('/severity-levels', (req, res) => {
  const query = "SELECT * FROM Severity_Levels;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('severity-levels', { severities: rows });
      }
  });
});

app.get('/severity-levels/add', (req, res) => {
  res.render('add-severity-level');
});

app.post('/severity-levels', (req, res) => {
  res.redirect('/severity-levels');
});

app.get('/severity-levels/:id/edit', (req, res) => {
  const severityId = req.params.id;
  res.render('edit-severity-level', { severity: {} });
});

app.post('/severity-levels/:id', (req, res) => {
  const severityId = req.params.id;
  res.redirect('/severity-levels');
});

app.post('/severity-levels/:id/delete', (req, res) => {
  const severityId = req.params.id;
  res.redirect('/severity-levels');
});

// STATUSES
app.get('/statuses', (req, res) => {
  const query = "SELECT * FROM Statuses;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('statuses', { statuses: rows });
      }
  });
});

app.get('/statuses/add', (req, res) => {
  res.render('add-status');
});

app.post('/statuses', (req, res) => {
  res.redirect('/statuses');
});

app.get('/statuses/:id/edit', (req, res) => {
  const statusId = req.params.id;
  res.render('edit-status', { status: {} });
});

app.post('/statuses/:id', (req, res) => {
  const statusId = req.params.id;
  res.redirect('/statuses');
});

app.post('/statuses/:id/delete', (req, res) => {
  const statusId = req.params.id;
  res.redirect('/statuses');
});

// START SERVER

const PORT = process.env.PORT || 9430;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});