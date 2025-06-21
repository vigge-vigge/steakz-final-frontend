import React from 'react';
import '../pages/styles/Home.css';

const branchReports = [
  { id: 1, title: 'Filialrapport', summary: 'Försäljning denna vecka: 32 000 kr' },
  { id: 2, title: 'Personalnärvaro', summary: 'Närvaro denna vecka: 98%' },
];

const BranchReports: React.FC = () => {
  return (
    <div className="container">
      <h1>Filialrapporter</h1>
      <div className="card">
        {branchReports.map(report => (
          <div key={report.id} style={{ marginBottom: 24 }}>
            <h2>{report.title}</h2>
            <p>{report.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchReports;
