import React from 'react';
import { Printer, FileText, Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export const PrintReport = ({ data, title, type }) => {
  const [open, setOpen] = React.useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = generateReportHTML(data, title, type);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateReportHTML = (data, title, type) => {
    const currentDate = new Date().toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - CCSConnect Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #333;
          }
          .report-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            color: #1a1a2e;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .summary {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
          }
          .summary-item {
            text-align: center;
            padding: 10px;
          }
          .summary-item .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a2e;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #1a1a2e;
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>CCSConnect - ${title}</h1>
            <p>Generated on: ${currentDate}</p>
          </div>
          ${generateSummaryHTML(data, type)}
          ${generateTableHTML(data, type)}
          <div class="footer">
            <p>CCSConnect Internship & Job Portal | EARIST - CCS</p>
            <p>This is a computer-generated document. No signature required.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateSummaryHTML = (data, type) => {
    if (type === 'company') {
      const stats = data.stats || {};
      return `
        <div class="summary">
          <div class="summary-item">
            <div class="label">Active Jobs</div>
            <div class="value">${stats.activeJobs || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Total Applications</div>
            <div class="value">${stats.totalApplications || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Active Interns</div>
            <div class="value">${stats.activeInterns || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Attendance Logs</div>
            <div class="value">${stats.totalAttendance || 0}</div>
          </div>
        </div>
      `;
    } else if (type === 'admin') {
      const stats = data.stats || {};
      return `
        <div class="summary">
          <div class="summary-item">
            <div class="label">Total Students</div>
            <div class="value">${stats.totalStudents || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Active Jobs</div>
            <div class="value">${stats.activeJobs || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Placement Rate</div>
            <div class="value">${stats.placementRate || 0}%</div>
          </div>
          <div class="summary-item">
            <div class="label">Total Applications</div>
            <div class="value">${stats.totalApplications || 0}</div>
          </div>
        </div>
      `;
    }
    return '';
  };

  const generateTableHTML = (data, type) => {
    if (type === 'company' && data.jobs) {
      return `
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Job Postings</h3>
        <table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Location</th>
              <th>Salary Range</th>
              <th>Applications</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.jobs.map(job => `
              <tr>
                <td>${job.title || 'N/A'}</td>
                <td>${job.location || 'N/A'}</td>
                <td>${job.salary_range || 'N/A'}</td>
                <td>${job.applicants_count || 0}</td>
                <td>${job.status || 'active'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Recent Applications</h3>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Position</th>
              <th>Applied Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(data.applications || []).slice(0, 20).map(app => `
              <tr>
                <td>${app.student_name || 'N/A'}</td>
                <td>${app.job_title || 'N/A'}</td>
                <td>${new Date(app.applied_at).toLocaleDateString()}</td>
                <td>${app.status || 'pending'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'admin' && data.students) {
      return `
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Student List</h3>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Year</th>
              <th>Applications</th>
            </tr>
          </thead>
          <tbody>
            ${(data.students || []).slice(0, 30).map(student => {
              const studentApps = (data.applications || []).filter(a => a.student_id === student.id);
              return `
                <tr>
                  <td>${student.full_name || 'N/A'}</td>
                  <td>${student.email || 'N/A'}</td>
                  <td>${student.department || 'N/A'}</td>
                  <td>${student.year || 'N/A'}</td>
                  <td>${studentApps.length}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
    return '<p>No data available for report.</p>';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-2">Generate a complete report of your dashboard data.</p>
            <p className="text-sm text-gray-500">The report will open in a new window and can be printed or saved as PDF.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button className="flex-1 bg-gray-800 hover:bg-gray-700" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Generate & Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};