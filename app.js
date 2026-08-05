const express = require('express');
const path = require('path');
const app = express();

// IMPORT DATABASE CONNECTOR
const db = require('./database/db-connector');

// Set up Handlebars templating engine
const exphbs = require('express-handlebars');

app.engine('hbs', exphbs.engine({ 
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: (a, b) => a === b,
        formatDate: (date) => date ? new Date(date).toISOString().split('T')[0] : ''
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home page
app.get('/', (req, res) => {
  res.render('index', {
    isHome: true,
    title: 'Dashboard'
  });
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
          // For each incident, fetch related analysts, assets, and CVEs
          const incidentsWithRelations = rows.map(incident => {
              return new Promise((resolve, reject) => {
                  // Fetch analysts for this incident
                  const analystQuery = `
                      SELECT a.analystID, a.firstName, a.lastName, a.email, a.role
                      FROM Analysts a
                      INNER JOIN Incident_Analysts ia ON a.analystID = ia.analystID
                      WHERE ia.incidentID = ?
                      ORDER BY a.lastName ASC, a.firstName ASC
                  `;
                  
                  db.pool.query(analystQuery, [incident.incidentID], function(error, analysts) {
                      if (error) {
                          console.log(error);
                          resolve({ ...incident, analysts: [], assets: [], cves: [] });
                      } else {
                          // Fetch assets for this incident
                          const assetQuery = `
                              SELECT a.assetID, a.name, a.ipAddress, a.department, a.type
                              FROM Assets a
                              INNER JOIN Incident_Assets ia ON a.assetID = ia.assetID
                              WHERE ia.incidentID = ?
                              ORDER BY a.name ASC
                          `;
                          
                          db.pool.query(assetQuery, [incident.incidentID], function(error, assets) {
                              if (error) {
                                  console.log(error);
                                  resolve({ ...incident, analysts: analysts, assets: [], cves: [] });
                              } else {
                                  // Fetch CVEs for this incident
                                  const cveQuery = `
                                      SELECT c.cveID, c.cveCode, c.description, c.cvssScore, c.publishedDate
                                      FROM CVEs c
                                      INNER JOIN Incident_CVEs ic ON c.cveID = ic.cveID
                                      WHERE ic.incidentID = ?
                                      ORDER BY c.publishedDate DESC
                                  `;
                                  
                                  db.pool.query(cveQuery, [incident.incidentID], function(error, cves) {
                                      if (error) {
                                          console.log(error);
                                          resolve({ ...incident, analysts: analysts, assets: assets, cves: [] });
                                      } else {
                                          resolve({ ...incident, analysts: analysts, assets: assets, cves: cves });
                                      }
                                  });
                              }
                          });
                      }
                  });
              });
          });
          
          Promise.all(incidentsWithRelations).then(enhancedIncidents => {
              res.render('incidents', { 
                incidents: enhancedIncidents,
                isIncidents: true,
                title: 'Incidents'
              });
          });
      }
  });
});

// Add incident form (GET)
app.get('/incidents/add', (req, res) => {
  const severityQuery = "SELECT * FROM Severity_Levels ORDER BY responseHours ASC;";
  const statusQuery = "SELECT * FROM Statuses ORDER BY statusName ASC;";
  
  db.pool.query(severityQuery, function(error, severities, fields){
      if (error) {
          console.log(error);
          res.render('add-incident', { severities: [], statuses: [] });
      } else {
          db.pool.query(statusQuery, function(error, statuses, fields){
              if (error) {
                  console.log(error);
                  res.render('add-incident', { severities: severities, statuses: [] });
              } else {
                  res.render('add-incident', { severities: severities, statuses: statuses });
              }
          });
      }
  });
});

// Add incident (POST) - form submission
app.post('/incidents', (req, res) => {
  res.redirect('/incidents');
});

// Edit incident form (GET)
app.get('/incidents/:id/edit', (req, res) => {
  const incidentId = req.params.id;
  const incidentQuery = "SELECT * FROM Incidents WHERE incidentID = ?;";
  const severityQuery = "SELECT * FROM Severity_Levels ORDER BY responseHours ASC;";
  const statusQuery = "SELECT * FROM Statuses ORDER BY statusName ASC;";
  
  db.pool.query(incidentQuery, [incidentId], function(error, incident, fields){
      if (error) {
          console.log(error);
          res.render('edit-incident', { incident: {}, severities: [], statuses: [] });
      } else {
          db.pool.query(severityQuery, function(error, severities, fields){
              if (error) {
                  console.log(error);
                  res.render('edit-incident', { incident: incident[0], severities: [], statuses: [] });
              } else {
                  db.pool.query(statusQuery, function(error, statuses, fields){
                      if (error) {
                          console.log(error);
                          res.render('edit-incident', { incident: incident[0], severities: severities, statuses: [] });
                      } else {
                          res.render('edit-incident', { incident: incident[0], severities: severities, statuses: statuses });
                      }
                  });
              }
          });
      }
  });
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

// Manage analysts for incident (GET)
app.get('/incidents/:id/manage-analysts', (req, res) => {
  const incidentId = req.params.id;
  
  const incidentQuery = "SELECT incidentID, title FROM Incidents WHERE incidentID = ?;";
  const assignedQuery = `
    SELECT a.analystID, a.firstName, a.lastName, a.email, a.role
    FROM Analysts a
    INNER JOIN Incident_Analysts ia ON a.analystID = ia.analystID
    WHERE ia.incidentID = ?
    ORDER BY a.lastName ASC, a.firstName ASC
  `;
  const availableQuery = `
    SELECT a.analystID, a.firstName, a.lastName, a.email, a.role
    FROM Analysts a
    WHERE a.analystID NOT IN (
      SELECT analystID FROM Incident_Analysts WHERE incidentID = ?
    )
    ORDER BY a.lastName ASC, a.firstName ASC
  `;
  
  db.pool.query(incidentQuery, [incidentId], function(error, incident) {
    if (error || incident.length === 0) {
      console.log(error);
      res.redirect('/incidents');
    } else {
      db.pool.query(assignedQuery, [incidentId], function(error, assignedAnalysts) {
        if (error) {
          console.log(error);
          assignedAnalysts = [];
        }
        db.pool.query(availableQuery, [incidentId], function(error, availableAnalysts) {
          if (error) {
            console.log(error);
            availableAnalysts = [];
          }
          res.render('manage-incident-analysts', {
            incidentID: incidentId,
            incidentTitle: incident[0].title,
            assignedAnalysts: assignedAnalysts,
            availableAnalysts: availableAnalysts
          });
        });
      });
    }
  });
});

// Add analyst to incident (POST)
app.post('/incidents/:incidentId/add-analyst/:analystId', (req, res) => {
  const incidentId = req.params.incidentId;
  const analystId = req.params.analystId;
  
  const query = "INSERT INTO Incident_Analysts (incidentID, analystID) VALUES (?, ?);";
  db.pool.query(query, [incidentId, analystId], function(error) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.redirect(`/incidents/${incidentId}/manage-analysts`);
    }
  });
});

// Remove analyst from incident (POST)
app.post('/incidents/:incidentId/remove-analyst/:analystId', (req, res) => {
  const incidentId = req.params.incidentId;
  const analystId = req.params.analystId;
  
  const query = "DELETE FROM Incident_Analysts WHERE incidentID = ? AND analystID = ?;";
  db.pool.query(query, [incidentId, analystId], function(error) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.redirect(`/incidents/${incidentId}/manage-analysts`);
    }
  });
});

// Manage assets for incident (GET)
app.get('/incidents/:id/manage-assets', (req, res) => {
  const incidentId = req.params.id;
  
  const incidentQuery = "SELECT incidentID, title FROM Incidents WHERE incidentID = ?;";
  const assignedQuery = `
    SELECT a.assetID, a.name, a.ipAddress, a.department, a.type
    FROM Assets a
    INNER JOIN Incident_Assets ia ON a.assetID = ia.assetID
    WHERE ia.incidentID = ?
    ORDER BY a.name ASC
  `;
  const availableQuery = `
    SELECT a.assetID, a.name, a.ipAddress, a.department, a.type
    FROM Assets a
    WHERE a.assetID NOT IN (
      SELECT assetID FROM Incident_Assets WHERE incidentID = ?
    )
    ORDER BY a.name ASC
  `;
  
  db.pool.query(incidentQuery, [incidentId], function(error, incident) {
    if (error || incident.length === 0) {
      console.log(error);
      res.redirect('/incidents');
    } else {
      db.pool.query(assignedQuery, [incidentId], function(error, assignedAssets) {
        if (error) {
          console.log(error);
          assignedAssets = [];
        }
        db.pool.query(availableQuery, [incidentId], function(error, availableAssets) {
          if (error) {
            console.log(error);
            availableAssets = [];
          }
          res.render('manage-incident-assets', {
            incidentID: incidentId,
            incidentTitle: incident[0].title,
            assignedAssets: assignedAssets,
            availableAssets: availableAssets
          });
        });
      });
    }
  });
});

// Add asset to incident (POST)
app.post('/incidents/:incidentId/add-asset/:assetId', (req, res) => {
  const incidentId = req.params.incidentId;
  const assetId = req.params.assetId;
  
  const query = "INSERT INTO Incident_Assets (incidentID, assetID) VALUES (?, ?);";
  db.pool.query(query, [incidentId, assetId], function(error) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.redirect(`/incidents/${incidentId}/manage-assets`);
    }
  });
});

// Remove asset from incident (POST)
app.post('/incidents/:incidentId/remove-asset/:assetId', (req, res) => {
  const incidentId = req.params.incidentId;
  const assetId = req.params.assetId;
  
  const query = "DELETE FROM Incident_Assets WHERE incidentID = ? AND assetID = ?;";
  db.pool.query(query, [incidentId, assetId], function(error) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.redirect(`/incidents/${incidentId}/manage-assets`);
    }
  });
});

// Manage CVEs for incident (GET)
app.get('/incidents/:id/manage-cves', (req, res) => {
  const incidentId = req.params.id;
  
  const incidentQuery = "SELECT incidentID, title FROM Incidents WHERE incidentID = ?;";
  const assignedQuery = `
    SELECT c.cveID, c.cveCode, c.description, c.cvssScore, c.publishedDate
    FROM CVEs c
    INNER JOIN Incident_CVEs ic ON c.cveID = ic.cveID
    WHERE ic.incidentID = ?
    ORDER BY c.publishedDate DESC
  `;
  const availableQuery = `
    SELECT c.cveID, c.cveCode, c.description, c.cvssScore, c.publishedDate
    FROM CVEs c
    WHERE c.cveID NOT IN (
      SELECT cveID FROM Incident_CVEs WHERE incidentID = ?
    )
    ORDER BY c.publishedDate DESC
  `;
  
  db.pool.query(incidentQuery, [incidentId], function(error, incident) {
    if (error || incident.length === 0) {
      console.log(error);
      res.redirect('/incidents');
    } else {
      db.pool.query(assignedQuery, [incidentId], function(error, assignedCVEs) {
        if (error) {
          console.log(error);
          assignedCVEs = [];
        }
        db.pool.query(availableQuery, [incidentId], function(error, availableCVEs) {
          if (error) {
            console.log(error);
            availableCVEs = [];
          }
          res.render('manage-incident-cves', {
            incidentID: incidentId,
            incidentTitle: incident[0].title,
            assignedCVEs: assignedCVEs,
            availableCVEs: availableCVEs
          });
        });
      });
    }
  });
});

// Add CVE to incident (POST)
app.post('/incidents/:incidentId/add-cve/:cveId', (req, res) => {
  const incidentId = req.params.incidentId;
  const cveId = req.params.cveId;
  
  const query = "INSERT INTO Incident_CVEs (incidentID, cveID) VALUES (?, ?);";
  db.pool.query(query, [incidentId, cveId], function(error) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.redirect(`/incidents/${incidentId}/manage-cves`);
    }
  });
});

// Remove CVE from incident (POST)
app.post('/incidents/:incidentId/remove-cve/:cveId', (req, res) => {
  const incidentId = req.params.incidentId;
  const cveId = req.params.cveId;
  
  const query = "DELETE FROM Incident_CVEs WHERE incidentID = ? AND cveID = ?;";
  db.pool.query(query, [incidentId, cveId], function(error) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.redirect(`/incidents/${incidentId}/manage-cves`);
    }
  });
});

// ANALYSTS

app.get('/analysts', (req, res) => {
  const query = "SELECT * FROM Analysts;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('analysts', { 
            analysts: rows,
            isAnalysts: true,
            title: 'Analysts'
          });
      }
  });
});

app.get('/analysts/add', (req, res) => {
  res.render('add-analyst');
});

app.post('/analysts', (req, res) => {
  const { firstName, lastName, email, role, hireDate } = req.body;
  db.pool.query(
    'CALL AddAnalyst(?, ?, ?, ?, ?)',
    [firstName, lastName, email, role, hireDate],
    function(error) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.redirect('/analysts');
      }
    }
  );
});

app.get('/analysts/:id/edit', (req, res) => {
  const analystId = req.params.id;
  db.pool.query(
    'SELECT * FROM Analysts WHERE analystID = ?',
    [analystId],
    function(error, rows) {
      if (error || rows.length === 0) {
        console.log(error);
        res.redirect('/analysts');
      } else {
        const analyst = rows[0];
        // Format hireDate as YYYY-MM-DD for the date input field
        if (analyst.hireDate) {
          analyst.hireDate = new Date(analyst.hireDate).toISOString().split('T')[0];
        }
        res.render('edit-analyst', { analyst });
      }
    }
  );
});

app.post('/analysts/:id', (req, res) => {
  const analystId = req.params.id;
  const { firstName, lastName, email, role, hireDate } = req.body;
  db.pool.query(
    'CALL UpdateAnalyst(?, ?, ?, ?, ?, ?)',
    [analystId, firstName, lastName, email, role, hireDate],
    function(error) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.redirect('/analysts');
      }
    }
  );
});

app.post('/analysts/:id/delete', (req, res) => {
  const analystId = req.params.id;
  db.pool.query(
    'CALL DeleteAnalyst(?)',
    [analystId],
    function(error) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.redirect('/analysts');
      }
    }
  );
});

// ASSETS

app.get('/assets', (req, res) => {
  const query = "SELECT * FROM Assets;";
  db.pool.query(query, function(error, rows, fields){
      if (error) {
          console.log(error);
          res.sendStatus(500);
      } else {
          res.render('assets', { 
            assets: rows,
            isAssets: true,
            title: 'Assets'
          });
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
          res.render('cves', { 
            cves: rows,
            isCVEs: true,
            title: 'CVEs'
          });
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
          res.render('severity-levels', { 
            severities: rows,
            isSeverityLevels: true,
            title: 'Severity Levels'
          });
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
          res.render('statuses', { 
            statuses: rows,
            title: 'Statuses'
          });
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