import React from 'react';
import './SumpTable.css';

function SumpTable({ records, isLoading }) {
    if (isLoading) return <p className="sump-table__message">Loading data...</p>;
    if (!records || records.length === 0) return <p className="sump-table__message">No data available.</p>;

    // Process the JSON payloads
    const parsedRecords = records.map(row => 
        typeof row.payload === 'object' && row.payload !== null ? row.payload : {}
    );

    // Get unique headers for BEM Block "sump-table"
    const allKeys = [...new Set(parsedRecords.flatMap(obj => Object.keys(obj)))];

    return (
        <div className="sump-table-container">
            <table className="sump-table">
                <thead className="sump-table__head">
                    <tr>
                        {allKeys.map(key => (
                            <th key={key} className="sump-table__header-cell">{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="sump-table__body">
                    {parsedRecords.map((record, index) => (
                        <tr key={index} className="sump-table__row">
                            {allKeys.map(key => (
                                <td key={key} className="sump-table__cell">
                                    {record[key] !== undefined ? String(record[key]) : 'n/a'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default SumpTable;
