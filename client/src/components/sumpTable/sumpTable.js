import React from 'react';
import './sumpTable.css';

const SumpTable = ({ sumpRecords = [] }) => {
    return (
        <table className="sump-table">
            <thead className="sump-table__head">
                <tr className="sump-table__row">
                    <th className="sump-table__header-cell">ID</th>
                    <th className="sump-table__header-cell">High ADC</th>
                    <th className="sump-table__header-cell">Low ADC</th>
                    <th className="sump-table__header-cell">On Time</th>
                    <th className="sump-table__header-cell">Off Time</th>
                    <th className="sump-table__header-cell">Hours ON</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(sumpRecords) && sumpRecords.map((record) => (
                    <tr key={record.id} className="sump-table__row">
                        <td className="sump-table__cell">{record.id}</td>
                        <td className="sump-table__cell">{record.payload?.Hadc ?? "N/a"}</td>
                        <td className="sump-table__cell">{record.payload?.Ladc ?? "N/a"}</td>
                        <td className="sump-table__cell">{record.payload?.OnTime ?? "N/a"}</td>
                        <td className="sump-table__cell">{record.payload?.OffTime ?? "N/a"}</td>
                        <td className="sump-table__cell">{record.payload?.HoursON ?? "N/a"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SumpTable;
