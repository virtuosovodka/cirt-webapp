-- CIRT: Cyber Incident Response Tracker 
-- Data Manipulation Queries (DML) 
-- CS 340 Group 38: Samson Tan, Vedika Sheth 

-- Variables are denoted with an @ symbol 



-- SEVERTY_LEVELS QUERIES 
-- Browse: Get all severity levels (for dropdowns, lists) 
SELECT severityLevelID, severityName, responseHours 
FROM Severity_Levels 
ORDER BY responseHours ASC; 

-- Get single: Fetch one severity level for editing 
SELECT severityLevelID, severityName, responseHours 
FROM Severity_Levels 
WHERE severityLevelID = @severity_level_id;

-- Add: Insert new severity level 
INSERT INTO Severity_Levels (severityName, responseHours)
VALUES (@severity_name, @response_hours);

-- Update: Modify existing severity level 
UPDATE Severity_Levels
SET severityName = @severity_name, responseHours = @response_hours 
WHERE severityLevelID = @severity_level_id; 

-- Delete: Remove severity level 
DELETE FROM Severity_Levels
WHERE severityLevelID = @severity_level_id;



-- ANALYSTS QUERIES 
-- Browse: Get all analysts
SELECT analystID, firstName, lastName, email, role, hireDate
FROM Analysts
ORDER BY lastName ASC, firstName ASC; 

-- Get single: Fetch one analyst for editing 
SELECT analystID, firstName, lastName, email, role, hireDate
FROM Analysts
WHERE analystID = @analyst_id;

-- Add: Insert new analyst 
INSERT INTO Analysts (analystID, firstName, lastName, email, role, hireDate)
VALUES (@first_name, @last_name, @email, @role, @hire_date);

-- Update: Modify existing analyst 
UPDATE Analysts
SET firstName = @first_name, lastName = @last_name, email = @email, role = @role, hireDate = @hire_date
WHERE analystID = @analyst_id; 

-- Delete: Remove analyst 
DELETE FROM Analysts
WHERE analystID = @analyst_id;



-- ASSETS QUERIES 
-- Browse: Get all assets
SELECT assetID, name, ipAddress, department, type
FROM Assets
ORDER BY name ASC;

-- Get single: Fetch one asset for editing 
SELECT assetID, name, ipAddress, department, type
FROM Assets
WHERE assetID = @asset_id;

-- Add: Insert new asset 
INSERT INTO Assets (name, ipAddress, department, type)
VALUES (@asset_name, @ip_address, @department, @asset_type);

-- Update: Modify existing asset 
UPDATE Assets
SET name = @asset_name, ipAddress = @ip_address, department = @department, type = @asset_type
WHERE assetID = @asset_id;

-- Delete: Remove asset 
DELETE FROM Assets
WHERE assetID = @asset_id;



-- INCIDENTS QUERIES 
-- Browse: Get all incidents
SELECT incidentID, title, description, reportedAt, closedAt, severityLevelID, statusName
FROM Incidents
ORDER BY reportedAt DESC;

-- Get single: Fetch one incident for editing 
SELECT incidentID, title, description, reportedAt, closedAt, severityLevelID, statusName
FROM Incidents
WHERE incidentID = @incident_id;

-- Add: Insert new incident 
INSERT INTO Incidents (title, description, reportedAt, closedAt, severityLevelID, statusName)
VALUES (@title, @description, @reported_at, @closed_at, @severity_level_id, @status_name);

-- Update: Modify existing incident 
UPDATE Incidents
SET title = @title, description = @description, reportedAt = @reported_at, closedAt = @closed_at, severityLevelID = @severity_level_id, statusName = @status_name
WHERE incidentID = @incident_id;

-- Delete: Remove incident 
DELETE FROM Incidents
WHERE incidentID = @incident_id;



-- INCIDENT_ANALYSTS QUERIES 
-- Browse: Get all analysts assigned to a specific incident 
SELECT a.analystID, a.firstName, a.lastName, a.email, a.role 
FROM Analysts as a 
INNER JOIN Incident_Analysts on a.analystID = Incident_Analysts.analystID 
WHERE Incident_Analysts.incidentID = @incident_id 
ORDER BY a.lastName ASC, a.firstName ASC;

-- Add: Assign analyst to incident 
INSERT INTO Incident_Analysts (incidentID, analystID)
VALUES (@incident_id, @analyst_id); 

-- Delete: Remove analyst from incident 
DELETE FROM Incident_Analysts 
WHERE incidentID = @incident_id AND analystID = @analyst_id; 

-- Get Dropdown: All available analysts 
SELECT analystID, firstName, lastName, email, role
FROM Analysts
ORDER BY lastName ASC, firstName ASC;



-- INCIDENT_ASSETS QUERIES
-- Browse: Get all assets involved in a specific incident
SELECT Assets.assetID, Assets.name, Assets.ipAddress, Assets.department, Assets.type
FROM Assets
INNER JOIN Incident_Assets ON Assets.assetID = Incident_Assets.assetID
WHERE Incident_Assets.incidentID = @incident_id
ORDER BY Assets.name ASC;

-- Add: Link asset to incident
INSERT INTO Incident_Assets (incidentID, assetID)
VALUES (@incident_id, @asset_id);

-- Delete: Unlink asset from incident
DELETE FROM Incident_Assets
WHERE incidentID = @incident_id AND assetID = @asset_id;

-- Get dropdown: All available assets (for linking form)
SELECT assetID, name, department, type
FROM Assets
ORDER BY name ASC;

-- INCIDENT_CVEs QUERIES
-- Browse: Get all CVEs associated with a specific incident
SELECT CVEs.cveID, CVEs.cveCode, CVEs.description, CVEs.cvssScore, CVEs.publishedDate
FROM CVEs
INNER JOIN Incident_CVEs ON CVEs.cveID = Incident_CVEs.cveID
WHERE Incident_CVEs.incidentID = @incident_id
ORDER BY CVEs.publishedDate DESC;

-- Add: Link CVE to incident
INSERT INTO Incident_CVEs (incidentID, cveID)
VALUES (@incident_id, @cve_id);

-- Delete: Unlink CVE from incident
DELETE FROM Incident_CVEs
WHERE incidentID = @incident_id AND cveID = @cve_id;

-- Get dropdown: All available CVEs (for linking form)
SELECT cveID, cveCode, cvssScore
FROM CVEs
ORDER BY publishedDate DESC;



-- STATUSES QUERIES

-- Browse / Read All: Get all statuses (for table display or dropdowns)
SELECT statusID, statusName
FROM Statuses
ORDER BY statusName ASC;

-- Get Single: Fetch one status for editing
SELECT statusID, statusName
FROM Statuses
WHERE statusID = :status_id;

-- Add: Insert a new status
INSERT INTO Statuses (statusName)
VALUES (:status_name_input);

-- Update: Modify an existing status
UPDATE Statuses
SET statusName = :status_name_input
WHERE statusID = :status_id;

-- Delete: Remove a status
DELETE FROM Statuses
WHERE statusID = :status_id;