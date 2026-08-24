/**
 * Export and Reporting Utilities for KRISHNA LAB SOLUTIONS
 */

import { DetectionResult, SecurityAlert } from '../types';

export function exportDetectionsToCSV(detections: DetectionResult[]): void {
  const headers = ['Detection ID', 'Date', 'Time', 'Camera', 'Location', 'Detected Objects', 'Highest Confidence', 'Threat Level', 'Status', 'Notes'];

  const rows = detections.map((d) => [
    `"${d.id}"`,
    `"${d.dateFormatted}"`,
    `"${d.timeFormatted}"`,
    `"${d.camera.replace(/"/g, '""')}"`,
    `"${d.location.replace(/"/g, '""')}"`,
    `"${d.objects.map((o) => `${o.name} (${Math.round(o.confidence * 100)}%)`).join(', ')}"`,
    `"${Math.round(d.highestConfidence * 100)}%"`,
    `"${d.highestThreatLevel}"`,
    `"${d.status}"`,
    `"${(d.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `KLS_Weapon_Detections_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAlertsToCSV(alerts: SecurityAlert[]): void {
  const headers = ['Alert ID', 'Detection Ref', 'Severity', 'Weapon Object', 'Confidence', 'Camera', 'Location', 'Date', 'Time', 'Status', 'Acknowledged By', 'Notes'];

  const rows = alerts.map((a) => [
    `"${a.id}"`,
    `"${a.detectionId}"`,
    `"${a.severity}"`,
    `"${a.objectName}"`,
    `"${Math.round(a.confidence * 100)}%"`,
    `"${a.cameraName.replace(/"/g, '""')}"`,
    `"${a.location.replace(/"/g, '""')}"`,
    `"${a.dateFormatted}"`,
    `"${a.timeFormatted}"`,
    `"${a.status}"`,
    `"${(a.acknowledgedBy || 'Unacknowledged').replace(/"/g, '""')}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `KLS_Security_Alerts_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printSecurityReport(): void {
  window.print();
}
