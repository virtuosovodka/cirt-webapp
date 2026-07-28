const express = require('express');
const path = require('path');
const app = express();

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
  // TODO: Run SELECT query from DML_Queries.sql
  // For now, just render the template
  res.render('incidents', { incidents: [] });
});

// Add incident form (GET)
app.get('/incidents/add', (req, res) => {
  // TODO: Get severity levels dropdown data
  res.render('add-incident', { severities: [] });
});

// Add incident (POST) - form submission
app.post('/incidents', (req, res) => {
  // TODO: Run INSERT query
  // TODO: Redirect to /incidents
  res.redirect('/incidents');
});

// Edit incident form (GET)
app.get('/incidents/:id/edit', (req, res) => {
  const incidentId = req.params.id;
  // TODO: Run SELECT query for this incident
  // TODO: Get severity levels dropdown data
  res.render('edit-incident', { incident: {}, severities: [] });
});

// Update incident (POST)
app.post('/incidents/:id', (req, res) => {
  const incidentId = req.params.id;
  // TODO: Run UPDATE query
  // TODO: Redirect to /incidents
  res.redirect('/incidents');
});

// Delete incident
app.post('/incidents/:id/delete', (req, res) => {
  const incidentId = req.params.id;
  // TODO: Run DELETE query
  // TODO: Redirect to /incidents
  res.redirect('/incidents');
});

// ANALYSTS

app.get('/analysts', (req, res) => {
  // TODO: Run SELECT query
  res.render('analysts', { analysts: [] });
});

app.get('/analysts/add', (req, res) => {
  res.render('add-analyst');
});

app.post('/analysts', (req, res) => {
  // TODO: Run INSERT query
  res.redirect('/analysts');
});

app.get('/analysts/:id/edit', (req, res) => {
  const analystId = req.params.id;
  // TODO: Run SELECT query
  res.render('edit-analyst', { analyst: {} });
});

app.post('/analysts/:id', (req, res) => {
  const analystId = req.params.id;
  // TODO: Run UPDATE query
  res.redirect('/analysts');
});

app.post('/analysts/:id/delete', (req, res) => {
  const analystId = req.params.id;
  // TODO: Run DELETE query
  res.redirect('/analysts');
});

// ASSETS

app.get('/assets', (req, res) => {
  res.render('assets', { assets: [] });
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
  res.render('cves', { cves: [] });
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
  res.render('severity-levels', { severities: [] });
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

// START SERVER

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on ${3005}`);
});